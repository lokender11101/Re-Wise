import { z } from 'zod';

/**
 * Zod Schemas for ReWise Active Learning Data Contract
 * Enforces strict discriminated unions, non-empty constraints,
 * valid quiz option indexes, and bounds.
 */

export const DifficultyLevelSchema = z.enum(['beginner', 'intermediate', 'advanced']);
export const BlockTypeSchema = z.enum(['summary', 'flashcards', 'quiz', 'checklist', 'chart']);

// 1. Summary Block Schema
export const SummaryBlockSchema = z.object({
  type: z.literal('summary'),
  id: z.string().min(1).default(() => `summary-${Math.random().toString(36).substring(2, 9)}`),
  title: z.string().min(1, 'Summary title cannot be empty'),
  content: z.string().min(1, 'Summary content cannot be empty'),
  keyPoints: z.array(z.string().min(1)).min(1, 'Summary must have at least one key point'),
});

// 2. Flashcard Schema & Block
export const FlashcardSchema = z.object({
  id: z.string().min(1).default(() => `card-${Math.random().toString(36).substring(2, 9)}`),
  question: z.string().min(1, 'Card question cannot be empty'),
  answer: z.string().min(1, 'Card answer cannot be empty'),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
});

export const FlashcardBlockSchema = z.object({
  type: z.literal('flashcards'),
  id: z.string().min(1).default(() => `flashcards-${Math.random().toString(36).substring(2, 9)}`),
  cards: z.array(FlashcardSchema).min(1, 'Flashcard block must contain at least one card').max(30),
});

// 3. Quiz Question Schema & Block
export const QuizQuestionSchema = z
  .object({
    id: z.string().min(1).default(() => `q-${Math.random().toString(36).substring(2, 9)}`),
    question: z.string().min(1, 'Quiz question cannot be empty'),
    options: z.array(z.string().min(1, 'Quiz option cannot be empty')).min(2, 'Must have at least 2 options').max(6),
    correctAnswerIndex: z.number().int().min(0),
    explanation: z.string().min(1, 'Question explanation cannot be empty'),
  })
  .refine(
    (data) => data.correctAnswerIndex >= 0 && data.correctAnswerIndex < data.options.length,
    {
      message: 'correctAnswerIndex must be a valid index within options',
      path: ['correctAnswerIndex'],
    }
  );

export const QuizBlockSchema = z.object({
  type: z.literal('quiz'),
  id: z.string().min(1).default(() => `quiz-${Math.random().toString(36).substring(2, 9)}`),
  questions: z.array(QuizQuestionSchema).min(1, 'Quiz block must contain at least one question').max(25),
});

// 4. Checklist Item Schema & Block
export const ChecklistItemSchema = z.object({
  id: z.string().min(1).default(() => `item-${Math.random().toString(36).substring(2, 9)}`),
  text: z.string().min(1, 'Checklist item text cannot be empty'),
});

export const ChecklistBlockSchema = z.object({
  type: z.literal('checklist'),
  id: z.string().min(1).default(() => `checklist-${Math.random().toString(36).substring(2, 9)}`),
  title: z.string().min(1, 'Checklist title cannot be empty'),
  items: z.array(ChecklistItemSchema).min(1, 'Checklist must contain at least one item').max(30),
});

// 5. Chart Data Point Schema & Block (Quantitative / Metric Comparison)
export const ChartDataPointSchema = z.object({
  label: z.string().min(1, 'Chart item label cannot be empty'),
  value: z.number({ invalid_type_error: 'Chart item value must be a valid number' }),
  unit: z.string().optional(),
  description: z.string().optional(),
});

export const ChartBlockSchema = z.object({
  type: z.literal('chart'),
  id: z.string().min(1).default(() => `chart-${Math.random().toString(36).substring(2, 9)}`),
  title: z.string().min(1, 'Chart title cannot be empty'),
  chartType: z.enum(['bar', 'comparison', 'distribution']).default('bar'),
  xAxisLabel: z.string().optional(),
  yAxisLabel: z.string().optional(),
  data: z.array(ChartDataPointSchema).min(1, 'Chart must contain at least one data point').max(20),
  summary: z.string().min(1, 'Chart must provide an accessible text summary'),
});

// Discriminated Union for all block types
export const StudyBlockSchema = z.discriminatedUnion('type', [
  SummaryBlockSchema,
  FlashcardBlockSchema,
  QuizBlockSchema,
  ChecklistBlockSchema,
  ChartBlockSchema,
]);

// Full AI Generation Structured Response Schema
export const GenerationResponseSchema = z.object({
  title: z.string().min(1, 'Session title cannot be empty'),
  blocks: z.array(StudyBlockSchema).min(1, 'Response must contain at least one study block'),
});

// Client Request Schemas
export const GenerateRequestSchema = z.object({
  notes: z
    .string()
    .trim()
    .min(3, 'Please provide at least a few words of study material, lecture notes, or a topic')
    .max(25000, 'Input exceeds maximum limit of 25,000 characters'),
  difficulty: DifficultyLevelSchema.default('intermediate'),
  selectedTypes: z.array(BlockTypeSchema).min(1, 'Please select at least one content block type to generate'),
});

export const RefineRequestSchema = z.object({
  session: z.object({
    title: z.string().min(1),
    topicOrNotes: z.string(),
    difficulty: DifficultyLevelSchema,
    blocks: z.array(StudyBlockSchema),
  }),
  instruction: z
    .string()
    .trim()
    .min(3, 'Refinement instruction must be at least 3 characters')
    .max(1000, 'Refinement instruction is too long (max 1000 characters)'),
});

// Saved Session Schema for local storage validation
export const SavedSessionSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  topicOrNotes: z.string(),
  difficulty: DifficultyLevelSchema,
  selectedBlockTypes: z.array(BlockTypeSchema),
  createdAt: z.number(),
  updatedAt: z.number(),
  blocks: z.array(StudyBlockSchema),
  progress: z.object({
    flashcards: z.record(z.enum(['known', 'learning'])).default({}),
    quiz: z.object({
      answers: z.record(z.number()).default({}),
      submitted: z.boolean().default(false),
      score: z.number().optional(),
      total: z.number().optional(),
      incorrectQuestionIds: z.array(z.string()).optional(),
      attempts: z.number().optional(),
      history: z
        .array(
          z.object({
            timestamp: z.number(),
            score: z.number(),
            total: z.number(),
            mode: z.enum(['full', 'retest']),
          })
        )
        .optional(),
    }).default({ answers: {}, submitted: false }),
    checklist: z.record(z.boolean()).default({}),
  }),
});

export const SavedSessionsListSchema = z.array(SavedSessionSchema);
