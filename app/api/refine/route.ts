import { NextRequest, NextResponse } from 'next/server';
import { RefineRequestSchema } from '@/lib/schemas';
import { buildRefinementPrompt } from '@/lib/prompts';
import { callGeminiStructured, GeminiServiceError } from '@/lib/gemini';
import { extractAndParseJSON, validateGenerationResponse } from '@/lib/validation';
import type { StudyBlock } from '@/types/study';

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

    // 1. Validate request payload
    const validationResult = RefineRequestSchema.safeParse(body);
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

    const { session, instruction } = validationResult.data;

    // 2. Build refinement prompt
    const { systemInstruction, userPrompt } = buildRefinementPrompt(
      session.title,
      session.difficulty,
      session.blocks as StudyBlock[],
      instruction
    );

    // 3. Call Gemini
    const { rawText } = await callGeminiStructured({
      systemInstruction,
      userPrompt,
      timeoutMs: 35000,
    });

    // 4. Parse & Validate
    const parsedJSON = extractAndParseJSON(rawText);
    const validatedData = validateGenerationResponse(parsedJSON);

    return NextResponse.json({
      success: true,
      data: validatedData,
      source: 'gemini-refinement',
    });
  } catch (error: unknown) {
    console.error('Error in /api/refine:', error);

    if (error instanceof GeminiServiceError) {
      return NextResponse.json(
        {
          error: {
            code: error.code,
            message: error.message,
            retryable: error.retryable,
          },
        },
        { status: error.statusCode }
      );
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown refinement error occurred.';

    return NextResponse.json(
      {
        error: {
          code: 'REFINEMENT_ERROR',
          message: errorMessage,
          retryable: true,
        },
      },
      { status: 500 }
    );
  }
}
