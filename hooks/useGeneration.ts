'use client';

import { useState, useRef, useCallback } from 'react';
import type {
  GenerateRequestPayload,
  RefineRequestPayload,
  GenerationResponse,
  ApiErrorResponse,
} from '@/types/study';
import { extractAndParseJSON, validateGenerationResponse } from '@/lib/validation';

export interface GenerationError {
  code: string;
  message: string;
  retryable: boolean;
}

export type GenerationStage =
  | 'idle'
  | 'analyzing'
  | 'structuring'
  | 'flashcards'
  | 'quiz'
  | 'validating'
  | 'finalizing';

export interface StreamProgressState {
  stage: GenerationStage;
  stageMessage: string;
  bytesReceived: number;
  chunkCount: number;
}

export function useGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [error, setError] = useState<GenerationError | null>(null);
  const [streamProgress, setStreamProgress] = useState<StreamProgressState>({
    stage: 'idle',
    stageMessage: '',
    bytesReceived: 0,
    chunkCount: 0,
  });

  // Monotonically increasing request counter to prevent race conditions
  const latestRequestIdRef = useRef<number>(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const abort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsGenerating(false);
    setIsRefining(false);
    setStreamProgress({
      stage: 'idle',
      stageMessage: '',
      bytesReceived: 0,
      chunkCount: 0,
    });
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Safe Streaming Generation
   * Streams chunks from /api/generate/stream via Server-Sent Events,
   * buffers complete JSON safely, updates progress stages, validates
   * against Zod schemas upon stream completion, and returns sanitized data.
   */
  const generate = useCallback(
    async (
      payload: GenerateRequestPayload,
      options?: { isDemo?: boolean; preferStreaming?: boolean }
    ): Promise<GenerationResponse | null> => {
      // 1. Cancel any active request
      abort();

      // 2. Increment request ID
      const requestId = ++latestRequestIdRef.current;
      const controller = new AbortController();
      abortControllerRef.current = controller;

      setIsGenerating(true);
      setError(null);
      setStreamProgress({
        stage: 'analyzing',
        stageMessage: 'Analyzing study material & key concepts...',
        bytesReceived: 0,
        chunkCount: 0,
      });

      const useStreaming = options?.preferStreaming !== false;

      if (!useStreaming) {
        // Fallback to synchronous generation
        try {
          const url = options?.isDemo ? '/api/generate?demo=true' : '/api/generate';
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(options?.isDemo ? { 'x-demo-mode': 'true' } : {}),
            },
            body: JSON.stringify(payload),
            signal: controller.signal,
          });

          if (requestId !== latestRequestIdRef.current) return null;

          const data = await response.json();
          if (!response.ok) {
            const apiError: ApiErrorResponse = data;
            setError({
              code: apiError.error?.code || 'UNKNOWN_ERROR',
              message: apiError.error?.message || `Request failed with status ${response.status}`,
              retryable: apiError.error?.retryable ?? true,
            });
            return null;
          }

          return data.data as GenerationResponse;
        } catch (err: unknown) {
          if ((err as { name?: string })?.name === 'AbortError') return null;
          if (requestId === latestRequestIdRef.current) {
            setError({
              code: 'CLIENT_FETCH_ERROR',
              message: err instanceof Error ? err.message : 'Network error occurred.',
              retryable: true,
            });
          }
          return null;
        } finally {
          if (requestId === latestRequestIdRef.current) {
            setIsGenerating(false);
            abortControllerRef.current = null;
          }
        }
      }

      // Safe Streaming Pipeline
      try {
        const url = options?.isDemo ? '/api/generate/stream?demo=true' : '/api/generate/stream';
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(options?.isDemo ? { 'x-demo-mode': 'true' } : {}),
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        if (requestId !== latestRequestIdRef.current) return null;

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          setError({
            code: errData?.error?.code || `HTTP_${response.status}`,
            message: errData?.error?.message || `Streaming request failed with status ${response.status}`,
            retryable: errData?.error?.retryable ?? true,
          });
          return null;
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('Response body stream is not readable.');
        }

        const decoder = new TextDecoder();
        let accumulatedJSON = '';
        let bytesCount = 0;
        let chunksCount = 0;
        let sseBuffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          bytesCount += value.byteLength;
          chunksCount += 1;

          const textChunk = decoder.decode(value, { stream: true });
          sseBuffer += textChunk;

          // Parse SSE data frames (split by \n\n)
          const lines = sseBuffer.split('\n\n');
          sseBuffer = lines.pop() || ''; // retain incomplete tail

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('data: ')) {
              try {
                const parsedEvent = JSON.parse(trimmed.slice(6));

                if (parsedEvent.type === 'stage') {
                  setStreamProgress((prev) => ({
                    ...prev,
                    stage: parsedEvent.stage || prev.stage,
                    stageMessage: parsedEvent.message || prev.stageMessage,
                  }));
                } else if (parsedEvent.type === 'chunk') {
                  accumulatedJSON += parsedEvent.text || '';

                  // Heuristic client-side stage updates based on accumulated tokens
                  if (accumulatedJSON.includes('"quiz"') && streamProgress.stage !== 'quiz') {
                    setStreamProgress((prev) => ({
                      ...prev,
                      stage: 'quiz',
                      stageMessage: 'Formulating multiple-choice comprehension questions...',
                      bytesReceived: bytesCount,
                      chunkCount: chunksCount,
                    }));
                  } else if (accumulatedJSON.includes('"flashcards"') && streamProgress.stage !== 'flashcards') {
                    setStreamProgress((prev) => ({
                      ...prev,
                      stage: 'flashcards',
                      stageMessage: 'Crafting interactive 3D recall flashcards...',
                      bytesReceived: bytesCount,
                      chunkCount: chunksCount,
                    }));
                  } else if (accumulatedJSON.includes('"summary"') && streamProgress.stage !== 'structuring') {
                    setStreamProgress((prev) => ({
                      ...prev,
                      stage: 'structuring',
                      stageMessage: 'Synthesizing executive summary and takeaways...',
                      bytesReceived: bytesCount,
                      chunkCount: chunksCount,
                    }));
                  } else {
                    setStreamProgress((prev) => ({
                      ...prev,
                      bytesReceived: bytesCount,
                      chunkCount: chunksCount,
                    }));
                  }
                } else if (parsedEvent.type === 'complete') {
                  if (parsedEvent.rawText) {
                    accumulatedJSON = parsedEvent.rawText;
                  }
                } else if (parsedEvent.type === 'error') {
                  throw new Error(parsedEvent.error || 'Server error received during stream.');
                }
              } catch (parseErr) {
                // If it's the error throw from above, rethrow
                if (parseErr instanceof Error && parseErr.message.includes('Server error')) {
                  throw parseErr;
                }
              }
            }
          }
        }

        if (requestId !== latestRequestIdRef.current) return null;

        // Stage 5: Validation boundary
        setStreamProgress((prev) => ({
          ...prev,
          stage: 'validating',
          stageMessage: 'Validating output against strict Zod schemas & contracts...',
        }));

        if (!accumulatedJSON || accumulatedJSON.trim().length === 0) {
          throw new Error('Streaming completed but received an empty payload.');
        }

        // Clean, parse, and strictly validate
        const rawParsed = extractAndParseJSON(accumulatedJSON);
        const validatedResponse = validateGenerationResponse(rawParsed);

        setStreamProgress((prev) => ({
          ...prev,
          stage: 'finalizing',
          stageMessage: 'Finalizing session state...',
        }));

        return validatedResponse;
      } catch (err: unknown) {
        if ((err as { name?: string })?.name === 'AbortError') return null;

        if (requestId === latestRequestIdRef.current) {
          const message = err instanceof Error ? err.message : 'Streaming error occurred.';
          setError({
            code: 'STREAMING_GENERATION_ERROR',
            message,
            retryable: true,
          });
        }
        return null;
      } finally {
        if (requestId === latestRequestIdRef.current) {
          setIsGenerating(false);
          abortControllerRef.current = null;
        }
      }
    },
    [abort]
  );

  const refine = useCallback(
    async (payload: RefineRequestPayload): Promise<GenerationResponse | null> => {
      abort();

      const requestId = ++latestRequestIdRef.current;
      const controller = new AbortController();
      abortControllerRef.current = controller;

      setIsRefining(true);
      setError(null);

      try {
        const response = await fetch('/api/refine', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        if (requestId !== latestRequestIdRef.current) {
          return null;
        }

        const data = await response.json();

        if (!response.ok) {
          const apiError: ApiErrorResponse = data;
          const errorObj: GenerationError = {
            code: apiError.error?.code || 'REFINEMENT_ERROR',
            message: apiError.error?.message || 'Refinement failed',
            retryable: apiError.error?.retryable ?? true,
          };
          setError(errorObj);
          return null;
        }

        return data.data as GenerationResponse;
      } catch (err: unknown) {
        if ((err as { name?: string })?.name === 'AbortError') {
          return null;
        }

        if (requestId === latestRequestIdRef.current) {
          setError({
            code: 'CLIENT_REFINE_ERROR',
            message: err instanceof Error ? err.message : 'Refinement network error',
            retryable: true,
          });
        }
        return null;
      } finally {
        if (requestId === latestRequestIdRef.current) {
          setIsRefining(false);
          abortControllerRef.current = null;
        }
      }
    },
    [abort]
  );

  return {
    isGenerating,
    isRefining,
    streamProgress,
    error,
    clearError,
    generate,
    refine,
    abort,
  };
}
