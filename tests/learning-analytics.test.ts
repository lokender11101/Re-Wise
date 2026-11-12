import { describe, it, expect } from 'vitest';
import { calculateDetailedAnalytics } from '@/lib/studyLogic';
import type { StudySession, QuizBlock, FlashcardBlock } from '@/types/study';

describe('Learning Intelligence & Concept Analytics Suite', () => {
  const baseSession: StudySession = {
    id: 'test-analytics-session',
    title: 'Operating Systems Scheduling',
    topicOrNotes: 'CPU scheduling algorithms',
    difficulty: 'intermediate',
    selectedBlockTypes: ['flashcards', 'quiz'],
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
    blocks: [
      {
        type: 'flashcards',
        id: 'fc-1',
        cards: [
          {
            id: 'c-1',
            question: 'What is convoy effect?',
            answer: 'Short jobs stuck behind long job.',
            conceptTag: 'FCFS Scheduling',
          },
          {
            id: 'c-2',
            question: 'What is aging?',
            answer: 'Gradually increasing priority.',
            conceptTag: 'Priority Scheduling',
          },
        ],
      } as FlashcardBlock,
      {
        type: 'quiz',
        id: 'quiz-1',
        questions: [
          {
            id: 'q-1',
            question: 'Which algorithm is optimal for waiting time?',
            options: ['FCFS', 'SJF', 'RR', 'Priority'],
            correctAnswerIndex: 1,
            explanation: 'SJF is provably optimal.',
            conceptTag: 'SJF Optimality',
          },
          {
            id: 'q-2',
            question: 'What causes convoy effect in FCFS?',
            options: ['Short jobs arriving first', 'Long CPU burst running first', 'Small quantum', 'Preemption'],
            correctAnswerIndex: 1,
            explanation: 'Long CPU bound process blocks short I/O bound jobs.',
            conceptTag: 'FCFS Scheduling',
          },
        ],
      } as QuizBlock,
    ],
    progress: {
      flashcards: {},
      quiz: {
        answers: {},
        submitted: false,
        attempts: 0,
        history: [],
      },
      checklist: {},
    },
  };

  it('indicates not enough data when learner has not yet answered quiz or marked flashcards', () => {
    const analytics = calculateDetailedAnalytics(baseSession);
    expect(analytics.hasEnoughData).toBe(false);
    expect(analytics.conceptMasteryList).toHaveLength(0);
    expect(analytics.frequentlyMissedConcepts).toHaveLength(0);
  });

  it('calculates concept-level accuracy and identifies frequently missed concepts from quiz answers', () => {
    const sessionWithSubmittedQuiz: StudySession = {
      ...baseSession,
      progress: {
        ...baseSession.progress,
        quiz: {
          answers: {
            'q-1': 1, // Correct (SJF Optimality)
            'q-2': 0, // Incorrect: selected 0 instead of 1 (FCFS Scheduling)
          },
          submitted: true,
          attempts: 1,
          incorrectQuestionIds: ['q-2'],
          history: [
            {
              timestamp: 1700000010000,
              score: 1,
              total: 2,
              mode: 'full',
            },
          ],
        },
      },
    };

    const analytics = calculateDetailedAnalytics(sessionWithSubmittedQuiz);
    expect(analytics.hasEnoughData).toBe(true);

    const sjfConcept = analytics.conceptMasteryList.find((c) => c.concept === 'SJF Optimality');
    expect(sjfConcept).toBeDefined();
    expect(sjfConcept?.accuracyPercentage).toBe(100);
    expect(sjfConcept?.status).toBe('mastered');

    const fcfsConcept = analytics.conceptMasteryList.find((c) => c.concept === 'FCFS Scheduling');
    expect(fcfsConcept).toBeDefined();
    expect(fcfsConcept?.accuracyPercentage).toBe(0);
    expect(fcfsConcept?.status).toBe('needs_practice');

    expect(analytics.frequentlyMissedConcepts).toContain('FCFS Scheduling');
  });

  it('accurately computes attempt improvement delta across multiple quiz attempts', () => {
    const sessionWithMultipleAttempts: StudySession = {
      ...baseSession,
      progress: {
        ...baseSession.progress,
        quiz: {
          answers: { 'q-1': 1, 'q-2': 1 },
          submitted: true,
          attempts: 2,
          history: [
            {
              timestamp: 1700000010000,
              score: 1,
              total: 2,
              mode: 'full', // Attempt 1: 50%
            },
            {
              timestamp: 1700000050000,
              score: 2,
              total: 2,
              mode: 'retest', // Attempt 2: 100%
            },
          ],
        },
      },
    };

    const analytics = calculateDetailedAnalytics(sessionWithMultipleAttempts);
    expect(analytics.improvementSummary).not.toBeNull();
    expect(analytics.improvementSummary?.firstAttemptPercentage).toBe(50);
    expect(analytics.improvementSummary?.latestAttemptPercentage).toBe(100);
    expect(analytics.improvementSummary?.deltaPercentage).toBe(50); // +50%
    expect(analytics.improvementSummary?.totalAttempts).toBe(2);
  });

  it('tracks flashcards marked learning under cardsNeedingReview with concept tags', () => {
    const sessionWithCardReview: StudySession = {
      ...baseSession,
      progress: {
        ...baseSession.progress,
        flashcards: {
          'c-1': 'learning',
          'c-2': 'known',
        },
      },
    };

    const analytics = calculateDetailedAnalytics(sessionWithCardReview);
    expect(analytics.hasEnoughData).toBe(true);
    expect(analytics.cardsNeedingReview).toHaveLength(1);
    expect(analytics.cardsNeedingReview[0].id).toBe('c-1');
    expect(analytics.cardsNeedingReview[0].conceptTag).toBe('FCFS Scheduling');
  });
});
