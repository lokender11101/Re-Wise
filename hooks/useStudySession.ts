'use client';

import { useState, useEffect, useCallback } from 'react';
import type {
  StudySession,
  GenerationResponse,
  DifficultyLevel,
  ContentBlockType,
  StudyBlock,
  QuizBlock,
} from '@/types/study';
import {
  saveSession,
  getSavedSessions,
  deleteSession,
  getActiveSessionId,
  setActiveSessionId,
} from '@/lib/storage';
import { calculateQuizScore, mergeRefinedBlocks } from '@/lib/studyLogic';

export function useStudySession() {
  const [session, setSession] = useState<StudySession | null>(null);
  const [retestAnswers, setRetestAnswers] = useState<{ [qId: string]: number }>({});
  const [isRetesting, setIsRetesting] = useState(false);
  const [retestSubmitted, setRetestSubmitted] = useState(false);
  const [retestScoreResult, setRetestScoreResult] = useState<{
    score: number;
    total: number;
    percentage: number;
  } | null>(null);

  // Initialize or restore active session on mount
  useEffect(() => {
    const activeId = getActiveSessionId();
    if (activeId) {
      const allSessions = getSavedSessions();
      const found = allSessions.find((s) => s.id === activeId);
      if (found) {
        setSession(found);
      }
    }
  }, []);

  // Sync session changes to storage
  const syncSession = useCallback((updated: StudySession) => {
    setSession(updated);
    saveSession(updated);
    setActiveSessionId(updated.id);
  }, []);

  // Initialize a fresh session from generation response
  const initNewSession = useCallback(
    (
      data: GenerationResponse,
      input: {
        notes: string;
        difficulty: DifficultyLevel;
        selectedTypes: ContentBlockType[];
      }
    ): StudySession => {
      const newSession: StudySession = {
        id: `session-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
        title: data.title,
        topicOrNotes: input.notes,
        difficulty: input.difficulty,
        selectedBlockTypes: input.selectedTypes,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        blocks: data.blocks,
        progress: {
          flashcards: {},
          quiz: {
            answers: {},
            submitted: false,
            incorrectQuestionIds: [],
            attempts: 0,
            history: [],
          },
          checklist: {},
        },
      };

      setIsRetesting(false);
      setRetestAnswers({});
      setRetestSubmitted(false);
      setRetestScoreResult(null);

      syncSession(newSession);
      return newSession;
    },
    [syncSession]
  );

  // Update blocks with smart merging (preserves unchanged IDs & user progress)
  const updateBlocks = useCallback(
    (newBlocks: StudyBlock[], newTitle?: string) => {
      if (!session) return;
      const merged = mergeRefinedBlocks(session.blocks, newBlocks);
      const updated: StudySession = {
        ...session,
        title: newTitle || session.title,
        blocks: merged,
        updatedAt: Date.now(),
      };
      syncSession(updated);
    },
    [session, syncSession]
  );

  // Mark Flashcard progress
  const markFlashcard = useCallback(
    (cardId: string, status: 'known' | 'learning') => {
      if (!session) return;
      const currentCards = { ...session.progress.flashcards };

      // Toggle off if clicking same status again
      if (currentCards[cardId] === status) {
        delete currentCards[cardId];
      } else {
        currentCards[cardId] = status;
      }

      const updated: StudySession = {
        ...session,
        progress: {
          ...session.progress,
          flashcards: currentCards,
        },
        updatedAt: Date.now(),
      };
      syncSession(updated);
    },
    [session, syncSession]
  );

  // Record answer for regular quiz
  const recordQuizAnswer = useCallback(
    (questionId: string, optionIndex: number) => {
      if (!session || session.progress.quiz.submitted) return;

      const updatedAnswers = {
        ...session.progress.quiz.answers,
        [questionId]: optionIndex,
      };

      const updated: StudySession = {
        ...session,
        progress: {
          ...session.progress,
          quiz: {
            ...session.progress.quiz,
            answers: updatedAnswers,
          },
        },
        updatedAt: Date.now(),
      };
      syncSession(updated);
    },
    [session, syncSession]
  );

  // Submit regular quiz
  const submitQuiz = useCallback(() => {
    if (!session) return;
    const quizBlock = session.blocks.find((b): b is QuizBlock => b.type === 'quiz');
    if (!quizBlock) return;

    const result = calculateQuizScore(quizBlock.questions, session.progress.quiz.answers);
    const prevHistory = session.progress.quiz.history || [];

    const updated: StudySession = {
      ...session,
      progress: {
        ...session.progress,
        quiz: {
          ...session.progress.quiz,
          submitted: true,
          score: result.score,
          total: result.total,
          incorrectQuestionIds: result.incorrectQuestionIds,
          attempts: (session.progress.quiz.attempts || 0) + 1,
          history: [
            ...prevHistory,
            {
              timestamp: Date.now(),
              score: result.score,
              total: result.total,
              mode: 'full',
            },
          ],
        },
      },
      updatedAt: Date.now(),
    };

    syncSession(updated);
  }, [session, syncSession]);

  // Start Retest for wrong answers only
  const startRetest = useCallback(() => {
    setIsRetesting(true);
    setRetestAnswers({});
    setRetestSubmitted(false);
    setRetestScoreResult(null);
  }, []);

  const cancelRetest = useCallback(() => {
    setIsRetesting(false);
    setRetestAnswers({});
    setRetestSubmitted(false);
    setRetestScoreResult(null);
  }, []);

  const recordRetestAnswer = useCallback(
    (questionId: string, optionIndex: number) => {
      if (retestSubmitted) return;
      setRetestAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
    },
    [retestSubmitted]
  );

  // Submit Retest
  const submitRetest = useCallback(() => {
    if (!session) return;
    const quizBlock = session.blocks.find((b): b is QuizBlock => b.type === 'quiz');
    if (!quizBlock) return;

    const wrongIds = session.progress.quiz.incorrectQuestionIds || [];
    const questionsToRetest = quizBlock.questions.filter((q) => wrongIds.includes(q.id));

    const result = calculateQuizScore(questionsToRetest, retestAnswers);

    setRetestSubmitted(true);
    setRetestScoreResult({
      score: result.score,
      total: result.total,
      percentage: result.percentage,
    });

    // Update session answers with corrected ones
    const updatedQuizAnswers = { ...session.progress.quiz.answers };
    for (const qId of result.correctQuestionIds) {
      if (retestAnswers[qId] !== undefined) {
        updatedQuizAnswers[qId] = retestAnswers[qId];
      }
    }

    // Recalculate full quiz score with updated answers
    const overallNewResult = calculateQuizScore(quizBlock.questions, updatedQuizAnswers);
    const prevHistory = session.progress.quiz.history || [];

    const updated: StudySession = {
      ...session,
      progress: {
        ...session.progress,
        quiz: {
          ...session.progress.quiz,
          answers: updatedQuizAnswers,
          score: overallNewResult.score,
          total: overallNewResult.total,
          incorrectQuestionIds: overallNewResult.incorrectQuestionIds,
          attempts: (session.progress.quiz.attempts || 0) + 1,
          history: [
            ...prevHistory,
            {
              timestamp: Date.now(),
              score: result.score,
              total: result.total,
              mode: 'retest',
            },
          ],
        },
      },
      updatedAt: Date.now(),
    };

    syncSession(updated);
  }, [session, retestAnswers, syncSession]);

  // Toggle Checklist item
  const toggleChecklistItem = useCallback(
    (itemId: string) => {
      if (!session) return;
      const currentList = { ...session.progress.checklist };
      currentList[itemId] = !currentList[itemId];

      const updated: StudySession = {
        ...session,
        progress: {
          ...session.progress,
          checklist: currentList,
        },
        updatedAt: Date.now(),
      };
      syncSession(updated);
    },
    [session, syncSession]
  );

  // Reset quiz to retry from scratch
  const resetQuiz = useCallback(() => {
    if (!session) return;
    const updated: StudySession = {
      ...session,
      progress: {
        ...session.progress,
        quiz: {
          ...session.progress.quiz,
          answers: {},
          submitted: false,
          incorrectQuestionIds: [],
        },
      },
      updatedAt: Date.now(),
    };
    setIsRetesting(false);
    setRetestAnswers({});
    setRetestSubmitted(false);
    setRetestScoreResult(null);
    syncSession(updated);
  }, [session, syncSession]);

  // Load a saved session
  const loadSession = useCallback(
    (sessionId: string): boolean => {
      const allSessions = getSavedSessions();
      const target = allSessions.find((s) => s.id === sessionId);
      if (!target) return false;

      setIsRetesting(false);
      setRetestAnswers({});
      setRetestSubmitted(false);
      setRetestScoreResult(null);
      syncSession(target);
      return true;
    },
    [syncSession]
  );

  // Clear current active session (for creating a new one)
  const clearSession = useCallback(() => {
    setSession(null);
    setActiveSessionId(null);
    setIsRetesting(false);
    setRetestAnswers({});
    setRetestSubmitted(false);
    setRetestScoreResult(null);
  }, []);

  return {
    session,
    setSession: syncSession,
    initNewSession,
    updateBlocks,
    markFlashcard,
    recordQuizAnswer,
    submitQuiz,
    resetQuiz,
    isRetesting,
    retestAnswers,
    retestSubmitted,
    retestScoreResult,
    startRetest,
    cancelRetest,
    recordRetestAnswer,
    submitRetest,
    toggleChecklistItem,
    loadSession,
    clearSession,
  };
}
