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
 * Post-processes validated blocks to ensure all IDs are unique, valid strings.
 * Safely replaces duplicated or missing model-generated IDs while preserving
 * valid, already-unique IDs across blocks, cards, questions, and checklist items.
 */
export function stabilizeBlockIds(blocks: StudyBlock[]): StudyBlock[] {
  const seenIds = new Set<string>();

  const getUniqueId = (candidate: unknown, fallbackPrefix: string): string => {
    if (
      typeof candidate === 'string' &&
      candidate.trim().length > 0 &&
      !seenIds.has(candidate.trim())
    ) {
      const trimmed = candidate.trim();
      seenIds.add(trimmed);
      return trimmed;
    }
    let uniqueId = '';
    do {
      uniqueId = `${fallbackPrefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    } while (seenIds.has(uniqueId));
    seenIds.add(uniqueId);
    return uniqueId;
  };

  return blocks.map((block, bIdx) => {
    const blockId = getUniqueId(block.id, `${block.type}-${bIdx + 1}`);

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
            id: getUniqueId(card.id, `card-${bIdx + 1}-${cIdx + 1}`),
          })),
        };
      case 'quiz':
        return {
          ...block,
          id: blockId,
          questions: block.questions.map((q, qIdx) => ({
            ...q,
            id: getUniqueId(q.id, `q-${bIdx + 1}-${qIdx + 1}`),
          })),
        };
      case 'checklist':
        return {
          ...block,
          id: blockId,
          items: block.items.map((item, iIdx) => ({
            ...item,
            id: getUniqueId(item.id, `item-${bIdx + 1}-${iIdx + 1}`),
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
