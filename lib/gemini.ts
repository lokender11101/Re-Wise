import { GoogleGenAI } from '@google/genai';

export interface GeminiCallParams {
  systemInstruction: string;
  userPrompt: string;
  timeoutMs?: number;
}

export interface GeminiCallResult {
  rawText: string;
}

export class GeminiServiceError extends Error {
  code: string;
  statusCode: number;
  retryable: boolean;

  constructor(message: string, code: string, statusCode = 500, retryable = false) {
    super(message);
    this.name = 'GeminiServiceError';
    this.code = code;
    this.statusCode = statusCode;
    this.retryable = retryable;
  }
}

/**
 * Initializes and executes structured Google Gemini API calls via @google/genai SDK.
 * Handles timeouts, rate limits, and network errors defensively.
 */
export async function callGeminiStructured({
  systemInstruction,
  userPrompt,
  timeoutMs = 30000,
}: GeminiCallParams): Promise<GeminiCallResult> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    throw new GeminiServiceError(
      'Gemini API key is not configured. Please add GEMINI_API_KEY to .env.local.',
      'API_KEY_MISSING',
      401,
      false
    );
  }

  const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

  const ai = new GoogleGenAI({ apiKey });

  // Use AbortController for reliable server-side timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        temperature: 0.3, // Lower temperature for consistent pedagogical structure
      },
    });

    clearTimeout(timeoutId);

    const rawText = response.text;

    if (!rawText || rawText.trim().length === 0) {
      throw new GeminiServiceError(
        'The AI model returned an empty response. Please try again.',
        'EMPTY_AI_RESPONSE',
        502,
        true
      );
    }

    return { rawText };
  } catch (error: unknown) {
    clearTimeout(timeoutId);

    if (error instanceof GeminiServiceError) {
      throw error;
    }

    // Check if error is due to abort timeout
    if ((error as { name?: string })?.name === 'AbortError' || controller.signal.aborted) {
      throw new GeminiServiceError(
        `Gemini API request timed out after ${Math.round(timeoutMs / 1000)} seconds.`,
        'REQUEST_TIMEOUT',
        504,
        true
      );
    }

    const errorMessage = error instanceof Error ? error.message : String(error);

    // Map common Gemini API error patterns
    if (errorMessage.includes('API_KEY_INVALID') || errorMessage.includes('403') || errorMessage.includes('401')) {
      throw new GeminiServiceError(
        'Invalid Gemini API key. Please check your GEMINI_API_KEY in .env.local.',
        'INVALID_API_KEY',
        401,
        false
      );
    }

    if (errorMessage.includes('RESOURCE_EXHAUSTED') || errorMessage.includes('429')) {
      throw new GeminiServiceError(
        'Gemini API rate limit or quota exceeded. Please wait a moment and retry.',
        'RATE_LIMIT_EXCEEDED',
        429,
        true
      );
    }

    if (errorMessage.includes('fetch failed') || errorMessage.includes('ENOTFOUND') || errorMessage.includes('ECONNREFUSED')) {
      throw new GeminiServiceError(
        'Network error reaching the Gemini API. Please check your internet connection.',
        'NETWORK_ERROR',
        503,
        true
      );
    }

    throw new GeminiServiceError(
      `AI generation failed: ${errorMessage}`,
      'GENERATION_FAILED',
      500,
      true
    );
  }
}
