import { NextRequest, NextResponse } from 'next/server';
import { GenerateRequestSchema } from '@/lib/schemas';
import { buildGenerationPrompt } from '@/lib/prompts';
import { createDeepSeekStream, DeepSeekServiceError } from '@/lib/deepseek';
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

    // Check for demo mode query param or header
    const isDemoMode =
      request.nextUrl.searchParams.get('demo') === 'true' ||
      request.headers.get('x-demo-mode') === 'true';

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

    // Handle offline / demo stream fallback
    if (isDemoMode) {
      const encoder = new TextEncoder();
      const mockStr = JSON.stringify(MOCK_GENERATION_RESPONSE);
      const chunkSize = 64;

      const stream = new ReadableStream({
        async start(controller) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'stage', stage: 'analyzing', message: 'Analyzing study material...' })}\n\n`)
          );

          for (let i = 0; i < mockStr.length; i += chunkSize) {
            if (request.signal.aborted) break;
            const slice = mockStr.slice(i, i + chunkSize);
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: 'chunk', text: slice })}\n\n`)
            );
            await new Promise((r) => setTimeout(r, 20));
          }

          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'complete', rawText: mockStr })}\n\n`)
          );
          controller.close();
        },
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream; charset=utf-8',
          'Cache-Control': 'no-cache, no-transform',
          Connection: 'keep-alive',
          'X-Accel-Buffering': 'no',
        },
      });
    }

    // 2. Build structured generation prompt for DeepSeek
    const { systemInstruction, userPrompt } = buildGenerationPrompt(notes, difficulty, selectedTypes);

    // 3. Initiate DeepSeek streaming completion via OpenAI SDK
    const deepSeekStream = await createDeepSeekStream({
      systemInstruction,
      userPrompt,
      timeoutMs: 60000,
      abortSignal: request.signal,
    });

    const encoder = new TextEncoder();

    const readableStream = new ReadableStream({
      async start(controller) {
        let accumulatedText = '';

        try {
          // Announce initial stage
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'stage', stage: 'analyzing', message: 'Analyzing study material...' })}\n\n`)
          );

          for await (const chunk of deepSeekStream) {
            if (request.signal.aborted) {
              break;
            }

            const deltaText = chunk.choices?.[0]?.delta?.content || '';
            if (deltaText) {
              accumulatedText += deltaText;
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ type: 'chunk', text: deltaText })}\n\n`)
              );
            }
          }

          // Complete event with full accumulated payload
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'complete', rawText: accumulatedText })}\n\n`)
          );
          controller.close();
        } catch (streamErr: unknown) {
          if (request.signal.aborted) {
            controller.close();
            return;
          }

          const errMsg = streamErr instanceof Error ? streamErr.message : String(streamErr);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: 'error',
                error: errMsg,
                code: 'STREAM_TRANSMISSION_ERROR',
              })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (error: unknown) {
    console.error('Error in /api/generate/stream:', error);

    if (error instanceof DeepSeekServiceError) {
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

    const errorMessage = error instanceof Error ? error.message : 'Unknown streaming error occurred.';

    return NextResponse.json(
      {
        error: {
          code: 'PROCESSING_ERROR',
          message: errorMessage,
          retryable: true,
        },
      },
      { status: 500 }
    );
  }
}
