import { describe, it, expect } from 'vitest';
import {
  extractAndParseJSON,
  validateGenerationResponse,
  validateStudyBlock,
} from '@/lib/validation';
import {
  GenerationResponseSchema,
  QuizBlockSchema,
  FlashcardBlockSchema,
  SummaryBlockSchema,
  ChecklistBlockSchema,
} from '@/lib/schemas';

describe('AI Data Contract & Validation Suite', () => {
  it('successfully validates a well-formed AI response', () => {
    const validData = {
      title: 'Operating Systems: CPU Scheduling',
      blocks: [
        {
          type: 'summary',
          id: 'summary-1',
          title: 'Overview',
          content: 'CPU scheduling allocates processor time.',
          keyPoints: ['Key point 1', 'Key point 2'],
        },
        {
          type: 'flashcards',
          id: 'fc-1',
          cards: [
            {
              id: 'c1',
              question: 'What is FCFS?',
              answer: 'First Come First Served',
              difficulty: 'easy',
            },
          ],
        },
        {
          type: 'quiz',
          id: 'q-block-1',
          questions: [
            {
              id: 'q1',
              question: 'Which uses a time quantum?',
              options: ['FCFS', 'SJF', 'Round Robin', 'Priority'],
              correctAnswerIndex: 2,
              explanation: 'Round Robin uses time slices.',
            },
          ],
        },
        {
          type: 'checklist',
          id: 'chk-1',
          title: 'Review checklist',
          items: [{ id: 'i1', text: 'Review Round Robin' }],
        },
      ],
    };

    const parsed = validateGenerationResponse(validData);
    expect(parsed.title).toBe('Operating Systems: CPU Scheduling');
    expect(parsed.blocks.length).toBe(4);
    expect(parsed.blocks[0].type).toBe('summary');
    expect(parsed.blocks[1].type).toBe('flashcards');
    expect(parsed.blocks[2].type).toBe('quiz');
    expect(parsed.blocks[3].type).toBe('checklist');
  });

  describe('Handling Bad AI Output & Edge Cases', () => {
    it('strips markdown code fences (```json ... ```)', () => {
      const rawWithFences = `\`\`\`json
{
  "title": "Cleaned Title",
  "blocks": [
    {
      "type": "summary",
      "id": "s1",
      "title": "Clean Summary",
      "content": "Valid content",
      "keyPoints": ["Point A"]
    }
  ]
}
\`\`\``;
      const parsed = extractAndParseJSON(rawWithFences);
      const validated = validateGenerationResponse(parsed);
      expect(validated.title).toBe('Cleaned Title');
    });

    it('extracts outermost JSON when surrounded by model commentary', () => {
      const rawWithCommentary = `Here is your requested study material:
{
  "title": "Extracted JSON",
  "blocks": [
    {
      "type": "summary",
      "id": "s1",
      "title": "Clean Summary",
      "content": "Valid content",
      "keyPoints": ["Point A"]
    }
  ]
}
Hope this helps your studies!`;

      const parsed = extractAndParseJSON(rawWithCommentary);
      const validated = validateGenerationResponse(parsed);
      expect(validated.title).toBe('Extracted JSON');
    });

    it('rejects malformed syntax JSON', () => {
      const malformed = `{"title": "Unclosed string, "blocks": []}`;
      expect(() => extractAndParseJSON(malformed)).toThrow(/Malformed JSON/);
    });

    it('rejects empty or whitespace response', () => {
      expect(() => extractAndParseJSON('')).toThrow(/empty/);
      expect(() => extractAndParseJSON('   ')).toThrow(/empty/);
    });

    it('rejects quiz question with out-of-bounds correctAnswerIndex', () => {
      const invalidQuiz = {
        type: 'quiz',
        id: 'quiz-bad-index',
        questions: [
          {
            id: 'q1',
            question: 'What is 2 + 2?',
            options: ['3', '4'], // length is 2 (valid indexes 0, 1)
            correctAnswerIndex: 5, // INVALID! Index 5 does not exist
            explanation: '4 is the sum',
          },
        ],
      };

      const result = QuizBlockSchema.safeParse(invalidQuiz);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('correctAnswerIndex must be a valid index');
      }
    });

    it('rejects unknown block types', () => {
      const unknownBlock = {
        type: 'chatbot_conversation', // Unsupported block type
        id: 'chat-1',
        messages: [],
      };

      expect(() => validateStudyBlock(unknownBlock)).toThrow(/Invalid study block/);
    });

    it('rejects empty keyPoints in summary', () => {
      const emptySummary = {
        type: 'summary',
        id: 's1',
        title: 'Title',
        content: 'Content',
        keyPoints: [], // Empty array violates min(1) constraint
      };

      const result = SummaryBlockSchema.safeParse(emptySummary);
      expect(result.success).toBe(false);
    });

    it('stabilizes entity IDs when omitted by the model', () => {
      const blockMissingIds = {
        title: 'Session without IDs',
        blocks: [
          {
            type: 'flashcards',
            // id omitted
            cards: [
              {
                // card id omitted
                question: 'Question?',
                answer: 'Answer.',
              },
            ],
          },
        ],
      };

      const validated = validateGenerationResponse(blockMissingIds);
      expect(validated.blocks[0].id).toBeDefined();
      expect(validated.blocks[0].id.length).toBeGreaterThan(0);
      const card = (validated.blocks[0] as { cards: { id: string }[] }).cards[0];
      expect(card.id).toBeDefined();
      expect(card.id.length).toBeGreaterThan(0);
    });
  });
});
