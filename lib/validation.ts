import { GenerationResponseSchema, StudyBlockSchema } from './schemas';
import type { GenerationResponse, StudyBlock } from '@/types/study';

/**
 * Robust JSON extraction and sanitization utility.
 * Handles:
 * 1. Markdown codeblock fences (```json ... ``` or ``` ... ```)
 * 2. Leading/trailing whitespace or accidental prose
 * 3. Sanitizing entity IDs so every block, card, question, and item has a unique, deterministic ID
 */
export function extractAndParseJSON(rawText: string): unknown {
  if (!rawText || typeof rawText !== 'string' || rawText.trim().length === 0) {
    throw new Error('Received empty or non-string response from AI model');
  }

  let cleaned = rawText.trim();

  // 1. Remove markdown code fences if present
  if (cleaned.startsWith('```')) {
    // Remove the opening ``` or ```json
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, '');
    // Remove the trailing ```
    cleaned = cleaned.replace(/\n?```\s*$/, '');
    cleaned = cleaned.trim();
  }

  // 2. If the model included commentary before or after JSON, attempt to locate the outermost { ... }
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    const parseError = err instanceof Error ? err.message : String(err);
    throw new Error(`Malformed JSON returned by model: ${parseError}`);
  }
}

/**
 * Post-processes validated blocks to ensure all IDs are unique, valid strings
 * (do not depend on the LLM to generate stable IDs).
 */
export function stabilizeBlockIds(blocks: StudyBlock[]): StudyBlock[] {
  return blocks.map((block, bIdx) => {
    const blockId = block.id && typeof block.id === 'string' && block.id.trim().length > 0
      ? block.id
      : `${block.type}-${bIdx + 1}-${Date.now().toString(36)}`;

    switch (block.type) {
      case 'summary':
        return {
          ...block,
          id: blockId,
        };
      case 'flashcards':
        return {
          ...block,
          id: blockId,
          cards: block.cards.map((card, cIdx) => ({
            ...card,
            id: card.id && typeof card.id === 'string' && card.id.trim().length > 0
              ? card.id
              : `card-${bIdx + 1}-${cIdx + 1}-${Date.now().toString(36)}`,
          })),
        };
      case 'quiz':
        return {
          ...block,
          id: blockId,
          questions: block.questions.map((q, qIdx) => ({
            ...q,
            id: q.id && typeof q.id === 'string' && q.id.trim().length > 0
              ? q.id
              : `q-${bIdx + 1}-${qIdx + 1}-${Date.now().toString(36)}`,
          })),
        };
      case 'checklist':
        return {
          ...block,
          id: blockId,
          items: block.items.map((item, iIdx) => ({
            ...item,
            id: item.id && typeof item.id === 'string' && item.id.trim().length > 0
              ? item.id
              : `item-${bIdx + 1}-${iIdx + 1}-${Date.now().toString(36)}`,
          })),
        };
      case 'chart':
        return {
          ...block,
          id: blockId,
        };
      default:
        return block;
    }
  });
}

/**
 * Validates parsed AI response against the strict Zod schema.
 * Rejects invalid block structures or out-of-range indexes safely.
 */
export function validateGenerationResponse(data: unknown): GenerationResponse {
  const result = GenerationResponseSchema.safeParse(data);

  if (!result.success) {
    const errorDetails = result.error.errors
      .map((e) => `[${e.path.join('.') || 'root'}]: ${e.message}`)
      .join('; ');
    throw new Error(`Data structure validation failed: ${errorDetails}`);
  }

  return {
    title: result.data.title,
    blocks: stabilizeBlockIds(result.data.blocks as StudyBlock[]),
  };
}

/**
 * Helper to validate a single block (used in refinement or granular updates).
 */
export function validateStudyBlock(data: unknown): StudyBlock {
  const result = StudyBlockSchema.safeParse(data);
  if (!result.success) {
    const errorDetails = result.error.errors
      .map((e) => `[${e.path.join('.') || 'root'}]: ${e.message}`)
      .join('; ');
    throw new Error(`Invalid study block: ${errorDetails}`);
  }
  return result.data as StudyBlock;
}
