import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGeneration } from '@/hooks/useGeneration';

describe('Streaming Reliability & Error Recovery Suite', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('handles client cancellation via abort() cleanly without setting error', async () => {
    // Mock fetch that hangs until aborted
    global.fetch = vi.fn().mockImplementation((_url, options) => {
      return new Promise((_, reject) => {
        options?.signal?.addEventListener('abort', () => {
          const abortError = new Error('The user aborted a request.');
          abortError.name = 'AbortError';
          reject(abortError);
        });
      });
    });

    const { result } = renderHook(() => useGeneration());

    let generatePromise: Promise<unknown>;
    act(() => {
      generatePromise = result.current.generate({
        topicOrNotes: 'Operating Systems Scheduling',
        difficulty: 'intermediate',
        selectedBlockTypes: ['summary'],
      });
    });

    expect(result.current.isGenerating).toBe(true);

    // Cancel while stream is in flight
    await act(async () => {
      result.current.abort();
      await generatePromise;
    });

    expect(result.current.isGenerating).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('handles interrupted streams with reader errors and flags error as retryable', async () => {
    // Mock response stream whose reader throws midway
    const mockStream = new ReadableStream({
      start(controller) {
        controller.enqueue(
          new TextEncoder().encode('data: {"type":"chunk","text":"{\\"title\\":\\"Test\\"}\n\n')
        );
        controller.error(new Error('Network connection reset by peer'));
      },
    });

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      body: mockStream,
    });

    const { result } = renderHook(() => useGeneration());

    let res: unknown;
    await act(async () => {
      res = await result.current.generate({
        topicOrNotes: 'Operating Systems',
        difficulty: 'intermediate',
        selectedBlockTypes: ['summary'],
      });
    });

    expect(res).toBeNull();
    expect(result.current.isGenerating).toBe(false);
    expect(result.current.error).not.toBeNull();
    expect(result.current.error?.retryable).toBe(true);
    expect(result.current.error?.code).toBe('STREAMING_GENERATION_ERROR');
  });

  it('handles empty streaming payload by catching and setting retryable error', async () => {
    // Empty stream with no data chunks
    const mockStream = new ReadableStream({
      start(controller) {
        controller.close();
      },
    });

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      body: mockStream,
    });

    const { result } = renderHook(() => useGeneration());

    let res: unknown;
    await act(async () => {
      res = await result.current.generate({
        topicOrNotes: 'Operating Systems',
        difficulty: 'intermediate',
        selectedBlockTypes: ['summary'],
      });
    });

    expect(res).toBeNull();
    expect(result.current.isGenerating).toBe(false);
    expect(result.current.error?.message).toContain('empty payload');
    expect(result.current.error?.retryable).toBe(true);
  });

  it('handles HTTP error responses from stream endpoint', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      json: async () => ({
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Rate limit reached. Please wait a moment.',
          retryable: true,
        },
      }),
    });

    const { result } = renderHook(() => useGeneration());

    let res: unknown;
    await act(async () => {
      res = await result.current.generate({
        topicOrNotes: 'Operating Systems',
        difficulty: 'intermediate',
        selectedBlockTypes: ['summary'],
      });
    });

    expect(res).toBeNull();
    expect(result.current.error?.code).toBe('RATE_LIMIT_EXCEEDED');
    expect(result.current.error?.retryable).toBe(true);
  });
});
