import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { callDeepSeekStructured, createDeepSeekStream, DeepSeekServiceError } from '@/lib/deepseek';
import OpenAI from 'openai';

vi.mock('openai');

describe('DeepSeek API Reliability & Error Classification Suite', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('throws API_KEY_MISSING when DEEPSEEK_API_KEY is not configured or placeholder', async () => {
    delete process.env.DEEPSEEK_API_KEY;

    await expect(
      callDeepSeekStructured({
        systemInstruction: 'Test system',
        userPrompt: 'Test prompt',
      })
    ).rejects.toMatchObject({
      code: 'API_KEY_MISSING',
      statusCode: 401,
      retryable: false,
    });

    process.env.DEEPSEEK_API_KEY = 'your_deepseek_api_key_here';
    await expect(
      createDeepSeekStream({
        systemInstruction: 'Test system',
        userPrompt: 'Test prompt',
      })
    ).rejects.toMatchObject({
      code: 'API_KEY_MISSING',
      statusCode: 401,
      retryable: false,
    });
  });

  it('classifies 401 / 403 authentication failures as INVALID_API_KEY (non-retryable)', async () => {
    process.env.DEEPSEEK_API_KEY = 'sk-mock-invalid-key';

    const mockCreate = vi.fn().mockRejectedValue({
      status: 401,
      message: 'Authentication failed: Invalid Bearer token',
    });

    (OpenAI as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      chat: {
        completions: {
          create: mockCreate,
        },
      },
    }));

    await expect(
      callDeepSeekStructured({
        systemInstruction: 'Test',
        userPrompt: 'Test',
      })
    ).rejects.toMatchObject({
      code: 'INVALID_API_KEY',
      statusCode: 401,
      retryable: false,
    });
  });

  it('classifies connection timeouts as REQUEST_TIMEOUT (retryable)', async () => {
    process.env.DEEPSEEK_API_KEY = 'sk-mock-key';

    const mockCreate = vi.fn().mockRejectedValue({
      name: 'APIConnectionTimeoutError',
      message: 'Request timed out after 35000ms',
    });

    (OpenAI as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      chat: {
        completions: {
          create: mockCreate,
        },
      },
    }));

    await expect(
      callDeepSeekStructured({
        systemInstruction: 'Test',
        userPrompt: 'Test',
      })
    ).rejects.toMatchObject({
      code: 'REQUEST_TIMEOUT',
      statusCode: 504,
      retryable: true,
    });
  });

  it('classifies 429 and quota exhaustion as RATE_LIMIT_EXCEEDED (retryable)', async () => {
    process.env.DEEPSEEK_API_KEY = 'sk-mock-key';

    const mockCreate = vi.fn().mockRejectedValue({
      status: 429,
      message: 'Rate limit reached or insufficient_quota for current tier',
    });

    (OpenAI as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      chat: {
        completions: {
          create: mockCreate,
        },
      },
    }));

    await expect(
      callDeepSeekStructured({
        systemInstruction: 'Test',
        userPrompt: 'Test',
      })
    ).rejects.toMatchObject({
      code: 'RATE_LIMIT_EXCEEDED',
      statusCode: 429,
      retryable: true,
    });
  });

  it('classifies empty or whitespace-only AI responses as EMPTY_AI_RESPONSE (retryable)', async () => {
    process.env.DEEPSEEK_API_KEY = 'sk-mock-key';

    const mockCreate = vi.fn().mockResolvedValue({
      choices: [
        {
          message: {
            content: '   ',
          },
        },
      ],
    });

    (OpenAI as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      chat: {
        completions: {
          create: mockCreate,
        },
      },
    }));

    await expect(
      callDeepSeekStructured({
        systemInstruction: 'Test',
        userPrompt: 'Test',
      })
    ).rejects.toMatchObject({
      code: 'EMPTY_AI_RESPONSE',
      statusCode: 502,
      retryable: true,
    });
  });

  it('classifies network connection drops as NETWORK_ERROR (retryable)', async () => {
    process.env.DEEPSEEK_API_KEY = 'sk-mock-key';

    const mockCreate = vi.fn().mockRejectedValue({
      name: 'APIConnectionError',
      message: 'fetch failed: ECONNREFUSED',
    });

    (OpenAI as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      chat: {
        completions: {
          create: mockCreate,
        },
      },
    }));

    await expect(
      callDeepSeekStructured({
        systemInstruction: 'Test',
        userPrompt: 'Test',
      })
    ).rejects.toMatchObject({
      code: 'NETWORK_ERROR',
      statusCode: 503,
      retryable: true,
    });
  });

  it('successfully returns rawText on valid structured completion', async () => {
    process.env.DEEPSEEK_API_KEY = 'sk-valid-key';

    const validJsonText = JSON.stringify({
      title: 'Valid Response',
      blocks: [],
    });

    const mockCreate = vi.fn().mockResolvedValue({
      choices: [
        {
          message: {
            content: validJsonText,
          },
        },
      ],
    });

    (OpenAI as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      chat: {
        completions: {
          create: mockCreate,
        },
      },
    }));

    const result = await callDeepSeekStructured({
      systemInstruction: 'Test system',
      userPrompt: 'Test prompt',
    });

    expect(result.rawText).toBe(validJsonText);
  });
});
