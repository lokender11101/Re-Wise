import { describe, it, expect } from 'vitest';
import {
  calculateQuizScore,
  calculateFlashcardStats,
  calculateChecklistStats,
  calculateOverallMastery,
} from '@/lib/studyLogic';
import type { QuizQuestion, Flashcard, ChecklistItem, StudySession } from '@/types/study';

describe('Study Logic & Wrong-Answer Retest Suite', () => {
  const sampleQuestions: QuizQuestion[] = [
    {
      id: 'q1',
      question: 'Which scheduling algorithm is non-preemptive?',
      options: ['FCFS', 'Round Robin', 'SRTF', 'Preemptive Priority'],
      correctAnswerIndex: 0,
      explanation: 'FCFS runs to completion.',
    },
    {
      id: 'q2',
      question: 'What is the primary drawback of SJF?',
      options: ['Convoy effect', 'Starvation of long jobs', 'Excessive context switches', 'Requires hardware support'],
      correctAnswerIndex: 1,
      explanation: 'Long jobs can starve if shorter jobs arrive continuously.',
    },
    {
      id: 'q3',
      question: 'What does a time quantum regulate?',
      options: ['Memory allocation', 'Round Robin CPU slice', 'Disk seek time', 'Cache hit ratio'],
      correctAnswerIndex: 1,
      explanation: 'Time quantum determines Round Robin slice.',
    },
  ];

  it('correctly calculates perfect quiz score', () => {
    const answers = { q1: 0, q2: 1, q3: 1 };
    const result = calculateQuizScore(sampleQuestions, answers);

    expect(result.score).toBe(3);
    expect(result.total).toBe(3);
    expect(result.percentage).toBe(100);
    expect(result.incorrectQuestionIds).toEqual([]);
    expect(result.correctQuestionIds).toEqual(['q1', 'q2', 'q3']);
    expect(result.allAnswered).toBe(true);
  });

  it('identifies wrong answers for retesting', () => {
    // q1 is wrong (chose 2 instead of 0), q2 is correct (1), q3 is unanswered
    const answers = { q1: 2, q2: 1 };
    const result = calculateQuizScore(sampleQuestions, answers);

    expect(result.score).toBe(1);
    expect(result.total).toBe(3);
    expect(result.percentage).toBe(33);
    expect(result.incorrectQuestionIds).toEqual(['q1', 'q3']);
    expect(result.correctQuestionIds).toEqual(['q2']);
    expect(result.allAnswered).toBe(false);
  });

  it('supports isolated retesting of incorrect questions only', () => {
    // User failed q1 initially
    const initialAnswers = { q1: 3, q2: 1, q3: 1 };
    const initialResult = calculateQuizScore(sampleQuestions, initialAnswers);
    expect(initialResult.incorrectQuestionIds).toEqual(['q1']);

    // Filter only the questions for retesting
    const retestQuestions = sampleQuestions.filter((q) =>
      initialResult.incorrectQuestionIds.includes(q.id)
    );
    expect(retestQuestions.length).toBe(1);
    expect(retestQuestions[0].id).toBe('q1');

    // User attempts retest and gets it right
    const retestAnswers = { q1: 0 };
    const retestResult = calculateQuizScore(retestQuestions, retestAnswers);
    expect(retestResult.score).toBe(1);
    expect(retestResult.total).toBe(1);
    expect(retestResult.percentage).toBe(100);
    expect(retestResult.incorrectQuestionIds).toEqual([]);
  });

  it('calculates flashcard progress and mastery percentage accurately', () => {
    const cards: Flashcard[] = [
      { id: 'c1', question: 'Q1', answer: 'A1' },
      { id: 'c2', question: 'Q2', answer: 'A2' },
      { id: 'c3', question: 'Q3', answer: 'A3' },
      { id: 'c4', question: 'Q4', answer: 'A4' },
    ];

    const progress = {
      c1: 'known' as const,
      c2: 'known' as const,
      c3: 'learning' as const,
      // c4 unreviewed
    };

    const stats = calculateFlashcardStats(cards, progress);
    expect(stats.knownCount).toBe(2);
    expect(stats.learningCount).toBe(1);
    expect(stats.unreviewedCount).toBe(1);
    expect(stats.total).toBe(4);
    expect(stats.masteryPercentage).toBe(50); // 2 out of 4 = 50%
  });

  it('calculates checklist completion stats', () => {
    const items: ChecklistItem[] = [
      { id: 'i1', text: 'Item 1' },
      { id: 'i2', text: 'Item 2' },
      { id: 'i3', text: 'Item 3' },
      { id: 'i4', text: 'Item 4' },
    ];

    const stats = calculateChecklistStats(items, { i1: true, i3: true });
    expect(stats.completedCount).toBe(2);
    expect(stats.total).toBe(4);
    expect(stats.percentage).toBe(50);
  });
});
