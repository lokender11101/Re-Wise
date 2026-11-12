import OpenAI from 'openai';

export interface DeepSeekCallParams {
  systemInstruction: string;
  userPrompt: string;
  timeoutMs?: number;
}

export interface DeepSeekCallResult {
  rawText: string;
}

export class DeepSeekServiceError extends Error {
  code: string;
  statusCode: number;
  retryable: boolean;

  constructor(message: string, code: string, statusCode = 500, retryable = false) {
    super(message);
    this.name = 'DeepSeekServiceError';
    this.code = code;
    this.statusCode = statusCode;
    this.retryable = retryable;
  }
}

/**
 * Executes structured DeepSeek API calls via the official OpenAI JavaScript SDK.
 * Configured for DeepSeek's OpenAI-compatible endpoint with JSON object mode.
 */
export async function callDeepSeekStructured({
  systemInstruction,
  userPrompt,
  timeoutMs = 35000,
}: DeepSeekCallParams): Promise<DeepSeekCallResult> {
  const apiKey = process.env.DEEPSEEK_API_KEY?.trim();

  if (!apiKey || apiKey === 'your_deepseek_api_key_here') {
    throw new DeepSeekServiceError(
      'DeepSeek API key is not configured. Please add DEEPSEEK_API_KEY to .env.local.',
      'API_KEY_MISSING',
      401,
      false
    );
  }

  const modelName = process.env.DEEPSEEK_MODEL || 'deepseek-flash';

  const client = new OpenAI({
    apiKey,
    baseURL: 'https://api.deepseek.com',
    timeout: timeoutMs,
    maxRetries: 1, // Avoid aggressive retry storms on persistent failures
  });

  try {
    const completion = await client.chat.completions.create({
      model: modelName,
      messages: [
        {
          role: 'system',
          content: systemInstruction,
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });

    const choice = completion.choices?.[0];
    const rawText = choice?.message?.content;

    if (!rawText || rawText.trim().length === 0) {
      throw new DeepSeekServiceError(
        'DeepSeek returned an empty response. Please try again.',
        'EMPTY_AI_RESPONSE',
        502,
        true
      );
    }

    return { rawText };
  } catch (error: unknown) {
    if (error instanceof DeepSeekServiceError) {
      throw error;
    }

    // Inspect OpenAI SDK error properties
    const anyErr = error as {
      status?: number;
      code?: string;
      message?: string;
      name?: string;
    };

    if (anyErr?.name === 'AbortError' || anyErr?.name === 'APIConnectionTimeoutError') {
      throw new DeepSeekServiceError(
        `DeepSeek API request timed out after ${Math.round(timeoutMs / 1000)} seconds.`,
        'REQUEST_TIMEOUT',
        504,
        true
      );
    }

    const statusCode = anyErr?.status || 500;
    const message = anyErr?.message || String(error);

    if (statusCode === 401 || statusCode === 403 || message.includes('Authentication')) {
      throw new DeepSeekServiceError(
        'Invalid DeepSeek API key or unauthorized request. Please check DEEPSEEK_API_KEY in .env.local.',
        'INVALID_API_KEY',
        401,
        false
      );
    }

    if (statusCode === 429 || message.includes('rate limit') || message.includes('insufficient_quota')) {
      throw new DeepSeekServiceError(
        'DeepSeek rate limit or credit quota exceeded. Please wait a moment or check your account.',
        'RATE_LIMIT_EXCEEDED',
        429,
        true
      );
    }

    if (anyErr?.name === 'APIConnectionError' || message.includes('ECONNREFUSED') || message.includes('fetch failed')) {
      throw new DeepSeekServiceError(
        'Network error reaching DeepSeek API. Please check your internet connection.',
        'NETWORK_ERROR',
        503,
        true
      );
    }

    throw new DeepSeekServiceError(
      `DeepSeek generation failed: ${message}`,
      'GENERATION_FAILED',
      statusCode,
      statusCode >= 500
    );
  }
}

export interface DeepSeekStreamParams {
  systemInstruction: string;
  userPrompt: string;
  timeoutMs?: number;
  abortSignal?: AbortSignal;
}

/**
 * Creates an asynchronous streaming completion from DeepSeek via OpenAI SDK.
 */
export async function createDeepSeekStream({
  systemInstruction,
  userPrompt,
  timeoutMs = 60000,
  abortSignal,
}: DeepSeekStreamParams) {
  const apiKey = process.env.DEEPSEEK_API_KEY?.trim();

  if (!apiKey || apiKey === 'your_deepseek_api_key_here') {
    throw new DeepSeekServiceError(
      'DeepSeek API key is not configured. Please add DEEPSEEK_API_KEY to .env.local.',
      'API_KEY_MISSING',
      401,
      false
    );
  }

  const modelName = process.env.DEEPSEEK_MODEL || 'deepseek-flash';

  const client = new OpenAI({
    apiKey,
    baseURL: 'https://api.deepseek.com',
    timeout: timeoutMs,
    maxRetries: 1,
  });

  return await client.chat.completions.create(
    {
      model: modelName,
      messages: [
        {
          role: 'system',
          content: systemInstruction,
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      response_format: { type: 'json_object' },
      stream: true,
      temperature: 0.3,
    },
    { signal: abortSignal }
  );
}
