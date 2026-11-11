'use client';

import { useState, useRef, useCallback } from 'react';
import type {
  GenerateRequestPayload,
  RefineRequestPayload,
  GenerationResponse,
  ApiErrorResponse,
} from '@/types/study';

export interface GenerationError {
  code: string;
  message: string;
  retryable: boolean;
}

export function useGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [error, setError] = useState<GenerationError | null>(null);

  // Monotonically increasing request counter to prevent race conditions
  const latestRequestIdRef = useRef<number>(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const abort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const generate = useCallback(
    async (
      payload: GenerateRequestPayload,
      options?: { isDemo?: boolean }
    ): Promise<GenerationResponse | null> => {
      // 1. Cancel any active request
      abort();

      // 2. Increment request ID
      const requestId = ++latestRequestIdRef.current;
      const controller = new AbortController();
      abortControllerRef.current = controller;

      setIsGenerating(true);
      setError(null);

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

        // 3. Prevent race condition: if a newer request was dispatched, discard this result!
        if (requestId !== latestRequestIdRef.current) {
          return null;
        }

        const data = await response.json();

        if (!response.ok) {
          const apiError: ApiErrorResponse = data;
          const errorObj: GenerationError = {
            code: apiError.error?.code || 'UNKNOWN_ERROR',
            message: apiError.error?.message || `Request failed with status ${response.status}`,
            retryable: apiError.error?.retryable ?? true,
          };
          setError(errorObj);
          return null;
        }

        return data.data as GenerationResponse;
      } catch (err: unknown) {
        // If aborted by a newer request, do not treat as an error
        if ((err as { name?: string })?.name === 'AbortError') {
          return null;
        }

        if (requestId === latestRequestIdRef.current) {
          const message = err instanceof Error ? err.message : 'Network error occurred.';
          setError({
            code: 'CLIENT_FETCH_ERROR',
            message: message.includes('Failed to fetch')
              ? 'Could not connect to the server. Please check your internet connection.'
              : message,
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
    error,
    clearError,
    generate,
    refine,
    abort,
  };
}
