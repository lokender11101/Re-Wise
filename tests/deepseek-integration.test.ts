// @vitest-environment node
import { describe, it, expect, beforeAll } from 'vitest';
import { callDeepSeekStructured } from '@/lib/deepseek';
import { buildGenerationPrompt, buildRefinementPrompt } from '@/lib/prompts';
import { extractAndParseJSON, validateGenerationResponse } from '@/lib/validation';
import type { StudyBlock } from '@/types/study';
import fs from 'fs';
import path from 'path';

// Automatically load local credentials from gitignored .env.local if present
beforeAll(() => {
  if (!process.env.DEEPSEEK_API_KEY) {
    const envLocalPath = path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(envLocalPath)) {
      const content = fs.readFileSync(envLocalPath, 'utf8');
      const keyMatch = content.match(/DEEPSEEK_API_KEY=(.+)/);
      if (keyMatch && keyMatch[1]) {
        process.env.DEEPSEEK_API_KEY = keyMatch[1].trim();
      }
      const modelMatch = content.match(/DEEPSEEK_MODEL=(.+)/);
      if (modelMatch && modelMatch[1]) {
        process.env.DEEPSEEK_MODEL = modelMatch[1].trim();
      }
    }
  }
});

describe('DeepSeek End-to-End Integration Suite', () => {
  let generatedBlocks: StudyBlock[] = [];
  let generatedTitle = '';

  it('successfully generates structured study material from DeepSeek API', async () => {
    if (!process.env.DEEPSEEK_API_KEY) {
      console.warn('Skipping live test: DEEPSEEK_API_KEY not found in environment or .env.local');
      return;
    }

    const { systemInstruction, userPrompt } = buildGenerationPrompt(
      'Binary Search Trees: insertions, in-order traversal, and search complexity O(h).',
      'beginner',
      ['summary', 'flashcards', 'quiz', 'checklist']
    );

    const { rawText } = await callDeepSeekStructured({
      systemInstruction,
      userPrompt,
      timeoutMs: 35000,
    });

    expect(rawText).toBeDefined();
    expect(typeof rawText).toBe('string');

    // Parse JSON
    const parsed = extractAndParseJSON(rawText);
    expect(parsed).toBeDefined();

    // Validate with Zod
    const validated = validateGenerationResponse(parsed);
    expect(validated.title).toBeDefined();
    expect(validated.blocks.length).toBeGreaterThanOrEqual(1);

    // Verify block discriminators
    const types = validated.blocks.map((b) => b.type);
    expect(types).toContain('summary');
    expect(types).toContain('flashcards');
    expect(types).toContain('quiz');
    expect(types).toContain('checklist');

    generatedBlocks = validated.blocks;
    generatedTitle = validated.title;
  }, 40000);

  it('successfully refines existing study material with follow-up instruction via DeepSeek', async () => {
    if (!process.env.DEEPSEEK_API_KEY) {
      console.warn('Skipping live test: DEEPSEEK_API_KEY not found in environment or .env.local');
      return;
    }

    expect(generatedBlocks.length).toBeGreaterThan(0);

    const { systemInstruction, userPrompt } = buildRefinementPrompt(
      generatedTitle,
      'beginner',
      generatedBlocks,
      'Add 2 additional flashcards testing tree balancing and worst-case degeneracy.'
    );

    const { rawText } = await callDeepSeekStructured({
      systemInstruction,
      userPrompt,
      timeoutMs: 35000,
    });

    expect(rawText).toBeDefined();

    const parsed = extractAndParseJSON(rawText);
    const validated = validateGenerationResponse(parsed);

    expect(validated.title).toBeDefined();
    expect(validated.blocks.length).toBeGreaterThanOrEqual(1);

    const flashcardBlock = validated.blocks.find((b) => b.type === 'flashcards');
    expect(flashcardBlock).toBeDefined();
  }, 40000);
});
