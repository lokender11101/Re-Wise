import { NextRequest, NextResponse } from 'next/server';
import { GenerateRequestSchema } from '@/lib/schemas';
import { buildGenerationPrompt } from '@/lib/prompts';
import { callDeepSeekStructured, classifyDeepSeekError, DeepSeekServiceError } from '@/lib/deepseek';
import { extractAndParseJSON, validateGenerationResponse } from '@/lib/validation';
import { MOCK_GENERATION_RESPONSE } from '@/lib/mockData';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);

    if (!body) {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_REQUEST_BODY',
            message: 'Request body must be valid JSON.',
            retryable: false,
          },
        },
        { status: 400 }
      );
    }

    // Check for demo mode query param or header (explicitly requested for offline/demo testing)
    const isDemoMode =
      request.nextUrl.searchParams.get('demo') === 'true' ||
      request.headers.get('x-demo-mode') === 'true';

    if (isDemoMode) {
      return NextResponse.json({
        success: true,
        data: MOCK_GENERATION_RESPONSE,
        source: 'demo',
      });
    }

    // 1. Validate incoming request against Zod schema
    const validationResult = GenerateRequestSchema.safeParse(body);
    if (!validationResult.success) {
      const errorMessages = validationResult.error.errors.map((e) => e.message).join('. ');
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: errorMessages,
            details: validationResult.error.flatten(),
            retryable: false,
          },
        },
        { status: 400 }
      );
    }

    const { notes, difficulty, selectedTypes } = validationResult.data;

    // 2. Build structured generation prompt
    const { systemInstruction, userPrompt } = buildGenerationPrompt(notes, difficulty, selectedTypes);

    // 3. Call DeepSeek via official OpenAI SDK
    const { rawText } = await callDeepSeekStructured({
      systemInstruction,
      userPrompt,
      timeoutMs: 35000,
    });

    // 4. Clean and parse raw output safely (strips code fences, parses JSON)
    const parsedJSON = extractAndParseJSON(rawText);

    // 5. Strictly validate structured response against Zod contract
    const validatedData = validateGenerationResponse(parsedJSON);

    return NextResponse.json({
      success: true,
      data: validatedData,
      source: 'deepseek',
    });
  } catch (error: unknown) {
    console.error('Error in /api/generate:', error);

    const classified = classifyDeepSeekError(error, 35000);

    return NextResponse.json(
      {
        error: {
          code: classified.code,
          message: classified.message,
          retryable: classified.retryable,
        },
      },
      { status: classified.statusCode }
    );
  }
}
