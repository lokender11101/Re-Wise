import { describe, it, expect } from 'vitest';
import { mergeRefinedBlocks } from '../lib/studyLogic';
import type { StudyBlock, FlashcardBlock, QuizBlock, ChartBlock } from '../types/study';

describe('Smart Refinement Block Merging Suite', () => {
  it('preserves stable IDs for unchanged flashcards while integrating newly added cards', () => {
    const existingBlocks: StudyBlock[] = [
      {
        type: 'flashcards',
        id: 'stable-fc-block-id',
        cards: [
          { id: 'card-1-original', question: 'What is a mutex?', answer: 'Mutual exclusion lock', difficulty: 'easy' },
          { id: 'card-2-original', question: 'What is a semaphore?', answer: 'Signaling integer mechanism', difficulty: 'medium' },
        ],
      },
    ];

    const incomingBlocks: StudyBlock[] = [
      {
        type: 'flashcards',
        id: 'temp-fc-id',
        cards: [
          // Unchanged question with different ephemeral id
          { id: 'new-temp-1', question: 'What is a mutex?', answer: 'Mutual exclusion lock', difficulty: 'easy' },
          // Brand new question added during refinement
          { id: 'new-temp-2', question: 'What is a spinlock?', answer: 'Busy-waiting lock mechanism', difficulty: 'hard' },
        ],
      },
    ];

    const merged = mergeRefinedBlocks(existingBlocks, incomingBlocks);
    expect(merged).toHaveLength(1);

    const fcBlock = merged[0] as FlashcardBlock;
    expect(fcBlock.id).toBe('stable-fc-block-id');
    expect(fcBlock.cards).toHaveLength(2);

    // card 1 should retain original ID to keep user's mastery progress intact!
    expect(fcBlock.cards[0].id).toBe('card-1-original');
    // card 2 is new, so it gets its new ID
    expect(fcBlock.cards[1].id).toBe('new-temp-2');
  });

  it('preserves existing quiz questions and merges new harder questions seamlessly', () => {
    const existingBlocks: StudyBlock[] = [
      {
        type: 'quiz',
        id: 'stable-quiz-id',
        questions: [
          {
            id: 'q-1-original',
            question: 'What is the convoy effect?',
            options: ['A', 'B', 'C', 'D'],
            correctAnswerIndex: 0,
            explanation: 'FCFS drawback',
          },
        ],
      },
    ];

    const incomingBlocks: StudyBlock[] = [
      {
        type: 'quiz',
        id: 'incoming-id',
        questions: [
          {
            id: 'temp-q1',
            question: 'What is the convoy effect?',
            options: ['A', 'B', 'C', 'D'],
            correctAnswerIndex: 0,
            explanation: 'FCFS drawback',
          },
          {
            id: 'q-2-new',
            question: 'What is priority inversion and how does inheritance resolve it?',
            options: ['W', 'X', 'Y', 'Z'],
            correctAnswerIndex: 1,
            explanation: 'Priority inheritance raises lower thread priority',
          },
        ],
      },
    ];

    const merged = mergeRefinedBlocks(existingBlocks, incomingBlocks);
    const quizBlock = merged[0] as QuizBlock;

    expect(quizBlock.id).toBe('stable-quiz-id');
    expect(quizBlock.questions).toHaveLength(2);
    expect(quizBlock.questions[0].id).toBe('q-1-original');
    expect(quizBlock.questions[1].id).toBe('q-2-new');
  });

  it('appends a newly requested chart block while preserving all existing summary and checklist blocks', () => {
    const existingBlocks: StudyBlock[] = [
      {
        type: 'summary',
        id: 'summary-id',
        title: 'OS Overview',
        content: 'Summary text',
        keyPoints: ['Point 1'],
      },
      {
        type: 'checklist',
        id: 'chk-id',
        title: 'Checklist',
        items: [{ id: 'item-1', text: 'Task 1' }],
      },
    ];

    const incomingBlocks: StudyBlock[] = [
      {
        type: 'chart',
        id: 'chart-new',
        title: 'Latency Benchmarks',
        chartType: 'bar',
        data: [{ label: 'Algorithm A', value: 10, unit: 'ms' }],
        summary: 'Speed analysis',
      },
    ];

    const merged = mergeRefinedBlocks(existingBlocks, incomingBlocks);
    expect(merged).toHaveLength(3);

    const types = merged.map((b) => b.type);
    expect(types).toContain('summary');
    expect(types).toContain('checklist');
    expect(types).toContain('chart');
  });
});
