import type {
  QuizQuestion,
  Flashcard,
  ChecklistItem,
  StudySession,
  StudyBlock,
  QuizBlock,
  FlashcardBlock,
  ChecklistBlock,
} from '@/types/study';

export interface QuizScoreResult {
  score: number;
  total: number;
  percentage: number;
  incorrectQuestionIds: string[];
  correctQuestionIds: string[];
  allAnswered: boolean;
}

export interface ConceptMastery {
  concept: string;
  totalQuestions: number;
  correctQuestions: number;
  accuracyPercentage: number;
  cardsNeedingReview: number;
  totalCards: number;
  status: 'mastered' | 'review_recommended' | 'needs_practice';
}

export interface AttemptImprovementSummary {
  firstAttemptPercentage: number;
  latestAttemptPercentage: number;
  deltaPercentage: number;
  totalAttempts: number;
}

export interface DetailedSessionAnalytics {
  overallMastery: number;
  hasEnoughData: boolean;
  conceptMasteryList: ConceptMastery[];
  frequentlyMissedConcepts: string[];
  improvementSummary: AttemptImprovementSummary | null;
  flashcardStats: {
    knownCount: number;
    learningCount: number;
    unreviewedCount: number;
    total: number;
    masteryPercentage: number;
  } | null;
  quizStats: {
    score: number;
    total: number;
    accuracyPercentage: number;
    submitted: boolean;
    attempts: number;
    history: {
      timestamp: number;
      score: number;
      total: number;
      percentage: number;
      mode: 'full' | 'retest';
    }[];
    incorrectQuestions: {
      id: string;
      question: string;
      explanation: string;
      userChoice?: string;
      correctChoice: string;
      conceptTag?: string;
    }[];
  } | null;
  checklistStats: {
    completedCount: number;
    total: number;
    percentage: number;
  } | null;
  cardsNeedingReview: {
    id: string;
    question: string;
    answer: string;
    conceptTag?: string;
  }[];
  pedagogicalRecommendation: string;
}

/**
 * Calculates quiz score, identifies wrong answers for retesting, and tracks answered status.
 */
export function calculateQuizScore(
  questions: QuizQuestion[],
  answers: { [questionId: string]: number }
): QuizScoreResult {
  const total = questions.length;
  let score = 0;
  const incorrectQuestionIds: string[] = [];
  const correctQuestionIds: string[] = [];

  for (const q of questions) {
    const selected = answers[q.id];
    if (selected !== undefined && selected === q.correctAnswerIndex) {
      score += 1;
      correctQuestionIds.push(q.id);
    } else {
      incorrectQuestionIds.push(q.id);
    }
  }

  // Verify that every question in the active quiz has a recorded answer
  // (Prevents stale answer IDs or mismatched counts from erroneously validating incomplete quizzes)
  const allAnswered = total > 0 && questions.every((q) => answers[q.id] !== undefined);
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

  return {
    score,
    total,
    percentage,
    incorrectQuestionIds,
    correctQuestionIds,
    allAnswered,
  };
}

/**
 * Calculates Flashcard mastery progress.
 */
export function calculateFlashcardStats(
  cards: Flashcard[],
  progressMap: { [cardId: string]: 'known' | 'learning' }
) {
  const total = cards.length;
  let knownCount = 0;
  let learningCount = 0;

  for (const card of cards) {
    const status = progressMap[card.id];
    if (status === 'known') knownCount += 1;
    else if (status === 'learning') learningCount += 1;
  }

  const unreviewedCount = Math.max(0, total - (knownCount + learningCount));
  const masteryPercentage = total > 0 ? Math.round((knownCount / total) * 100) : 0;

  return {
    knownCount,
    learningCount,
    unreviewedCount,
    total,
    masteryPercentage,
  };
}

/**
 * Calculates revision checklist completion statistics.
 */
export function calculateChecklistStats(
  items: ChecklistItem[],
  progressMap: { [itemId: string]: boolean }
) {
  const total = items.length;
  let completedCount = 0;

  for (const item of items) {
    if (progressMap[item.id] === true) {
      completedCount += 1;
    }
  }

  const percentage = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  return {
    completedCount,
    total,
    percentage,
  };
}

/**
 * Calculates overall combined session mastery percentage (0-100%).
 */
export function calculateOverallMastery(session: StudySession): number {
  const weights: number[] = [];
  const percentages: number[] = [];

  const flashcardBlock = session.blocks.find((b): b is FlashcardBlock => b.type === 'flashcards');
  if (flashcardBlock && flashcardBlock.cards.length > 0) {
    const stats = calculateFlashcardStats(flashcardBlock.cards, session.progress.flashcards);
    percentages.push(stats.masteryPercentage);
    weights.push(1);
  }

  const quizBlock = session.blocks.find((b): b is QuizBlock => b.type === 'quiz');
  if (quizBlock && quizBlock.questions.length > 0 && session.progress.quiz.submitted) {
    const stats = calculateQuizScore(quizBlock.questions, session.progress.quiz.answers);
    percentages.push(stats.percentage);
    weights.push(1.5); // Quiz counts with slightly higher weight
  }

  const checklistBlock = session.blocks.find((b): b is ChecklistBlock => b.type === 'checklist');
  if (checklistBlock && checklistBlock.items.length > 0) {
    const stats = calculateChecklistStats(checklistBlock.items, session.progress.checklist);
    percentages.push(stats.percentage);
    weights.push(0.8);
  }

  if (percentages.length === 0) return 0;

  const totalWeight = weights.reduce((a, b) => a + b, 0);
  const weightedSum = percentages.reduce((sum, val, idx) => sum + val * weights[idx], 0);

  return Math.round(weightedSum / totalWeight);
}

/**
 * Merges refined blocks into existing study session blocks,
 * preserving existing IDs and existing progress for unchanged items,
 * and seamlessly integrating newly added cards, questions, or blocks.
 */
export function mergeRefinedBlocks(
  existingBlocks: StudyBlock[],
  incomingBlocks: StudyBlock[]
): StudyBlock[] {
  const mergedMap = new Map<string, StudyBlock>();

  // Index existing blocks by type
  const existingByType = new Map<string, StudyBlock>();
  for (const block of existingBlocks) {
    existingByType.set(block.type, block);
  }

  for (const incoming of incomingBlocks) {
    const existing = existingByType.get(incoming.type);

    if (!existing) {
      // Brand new block type added during refinement (e.g. chart was requested)
      mergedMap.set(incoming.type, incoming);
      continue;
    }

    // Merge entities within existing block type
    if (incoming.type === 'flashcards' && existing.type === 'flashcards') {
      const existingCardsByQuestion = new Map<string, Flashcard>();
      for (const card of existing.cards) {
        existingCardsByQuestion.set(card.question.trim().toLowerCase(), card);
      }

      const mergedCards: Flashcard[] = incoming.cards.map((inCard) => {
        const match = existingCardsByQuestion.get(inCard.question.trim().toLowerCase());
        if (match) {
          // Preserve stable ID so user's mastery progress is preserved!
          return { ...inCard, id: match.id };
        }
        return inCard;
      });

      mergedMap.set(incoming.type, {
        ...incoming,
        id: existing.id,
        cards: mergedCards,
      });
    } else if (incoming.type === 'quiz' && existing.type === 'quiz') {
      const existingQuestionsByText = new Map<string, QuizQuestion>();
      for (const q of existing.questions) {
        existingQuestionsByText.set(q.question.trim().toLowerCase(), q);
      }

      const mergedQuestions: QuizQuestion[] = incoming.questions.map((inQ) => {
        const match = existingQuestionsByText.get(inQ.question.trim().toLowerCase());
        if (match) {
          return { ...inQ, id: match.id };
        }
        return inQ;
      });

      mergedMap.set(incoming.type, {
        ...incoming,
        id: existing.id,
        questions: mergedQuestions,
      });
    } else if (incoming.type === 'checklist' && existing.type === 'checklist') {
      const existingItemsByText = new Map<string, ChecklistItem>();
      for (const item of existing.items) {
        existingItemsByText.set(item.text.trim().toLowerCase(), item);
      }

      const mergedItems: ChecklistItem[] = incoming.items.map((inItem) => {
        const match = existingItemsByText.get(inItem.text.trim().toLowerCase());
        if (match) {
          return { ...inItem, id: match.id };
        }
        return inItem;
      });

      mergedMap.set(incoming.type, {
        ...incoming,
        id: existing.id,
        items: mergedItems,
      });
    } else {
      // Summary or Chart block: preserve block ID
      mergedMap.set(incoming.type, {
        ...incoming,
        id: existing.id,
      });
    }
  }

  // Preserve any existing blocks that the model did not mention in incomingBlocks
  for (const block of existingBlocks) {
    if (!mergedMap.has(block.type)) {
      mergedMap.set(block.type, block);
    }
  }

  return Array.from(mergedMap.values());
}

/**
 * Extracts a concise concept label from question or card prose.
 */
export function extractConceptFromText(text: string): string {
  if (!text) return 'Core Concept';

  // Check for quoted phrases (e.g. "Convoy Effect")
  const quoteMatch = text.match(/["']([^"']+)["']/);
  if (quoteMatch && quoteMatch[1].trim().length > 2) {
    return quoteMatch[1].trim();
  }

  // Remove common interrogative prefixes
  let cleaned = text
    .replace(
      /^(what is|what are|which of the following|which|how does|why is|explain the|identify the|define|describe)\s+/i,
      ''
    )
    .replace(/\?.*$/, '')
    .trim();

  // If text is still long, take first 6 words
  const words = cleaned.split(/\s+/);
  if (words.length > 6) {
    cleaned = words.slice(0, 6).join(' ') + '...';
  }

  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

/**
 * Computes deep, authentic session analytics without hardcoded estimates.
 */
export function calculateDetailedAnalytics(session: StudySession): DetailedSessionAnalytics {
  const overallMastery = calculateOverallMastery(session);

  // Flashcards
  const flashcardBlock = session.blocks.find((b): b is FlashcardBlock => b.type === 'flashcards');
  const flashcardStats = flashcardBlock
    ? calculateFlashcardStats(flashcardBlock.cards, session.progress.flashcards)
    : null;

  // Quiz
  const quizBlock = session.blocks.find((b): b is QuizBlock => b.type === 'quiz');
  let quizStats: DetailedSessionAnalytics['quizStats'] = null;

  if (quizBlock) {
    const questions = quizBlock.questions;
    const scoreResult = calculateQuizScore(questions, session.progress.quiz.answers);
    const rawHistory = session.progress.quiz.history || [];

    const historyWithPercentages = rawHistory.map((item) => ({
      ...item,
      percentage: item.total > 0 ? Math.round((item.score / item.total) * 100) : 0,
    }));

    const incorrectQuestions = (session.progress.quiz.incorrectQuestionIds || []).map((qId) => {
      const q = questions.find((item) => item.id === qId);
      const userChoiceIndex = session.progress.quiz.answers[qId];
      return {
        id: qId,
        question: q?.question || 'Unknown question',
        explanation: q?.explanation || 'No explanation provided.',
        userChoice: q && userChoiceIndex !== undefined ? q.options[userChoiceIndex] : undefined,
        correctChoice: q ? q.options[q.correctAnswerIndex] : 'Unknown',
        conceptTag: q?.conceptTag,
      };
    });

    quizStats = {
      score: scoreResult.score,
      total: scoreResult.total,
      accuracyPercentage: scoreResult.percentage,
      submitted: session.progress.quiz.submitted,
      attempts: session.progress.quiz.attempts || 0,
      history: historyWithPercentages,
      incorrectQuestions,
    };
  }

  // Checklist
  const checklistBlock = session.blocks.find((b): b is ChecklistBlock => b.type === 'checklist');
  const checklistStats = checklistBlock
    ? calculateChecklistStats(checklistBlock.items, session.progress.checklist)
    : null;

  // Flashcards Needing Review
  const cardsNeedingReview = (flashcardBlock?.cards || [])
    .filter((card) => session.progress.flashcards[card.id] === 'learning')
    .map((card) => ({
      id: card.id,
      question: card.question,
      answer: card.answer,
      conceptTag: card.conceptTag,
    }));

  // Verify whether enough actual learner interactions exist before rendering weak-topic analytics
  const hasEnoughData = Boolean(
    session.progress.quiz.submitted ||
      (session.progress.quiz.history && session.progress.quiz.history.length > 0) ||
      cardsNeedingReview.length > 0
  );

  // Concept-Level Accuracy & Breakdown (Uses structured conceptTag, never regex guessing)
  const conceptMasteryList: ConceptMastery[] = [];
  const conceptMap = new Map<
    string,
    {
      totalQuestions: number;
      correctQuestions: number;
      totalCards: number;
      cardsNeedingReview: number;
    }
  >();

  if (hasEnoughData) {
    // 1. Map quiz questions with concept tags
    if (quizBlock && session.progress.quiz.submitted) {
      for (const q of quizBlock.questions) {
        const tag = q.conceptTag || 'General Core';
        const entry = conceptMap.get(tag) || {
          totalQuestions: 0,
          correctQuestions: 0,
          totalCards: 0,
          cardsNeedingReview: 0,
        };

        entry.totalQuestions += 1;
        if (session.progress.quiz.answers[q.id] === q.correctAnswerIndex) {
          entry.correctQuestions += 1;
        }
        conceptMap.set(tag, entry);
      }
    }

    // 2. Map flashcards with concept tags
    if (flashcardBlock) {
      for (const card of flashcardBlock.cards) {
        if (!card.conceptTag) continue;
        const tag = card.conceptTag;
        const entry = conceptMap.get(tag) || {
          totalQuestions: 0,
          correctQuestions: 0,
          totalCards: 0,
          cardsNeedingReview: 0,
        };

        entry.totalCards += 1;
        if (session.progress.flashcards[card.id] === 'learning') {
          entry.cardsNeedingReview += 1;
        }
        conceptMap.set(tag, entry);
      }
    }

    // Build ConceptMastery items
    for (const [concept, data] of conceptMap.entries()) {
      const accuracyPercentage =
        data.totalQuestions > 0 ? Math.round((data.correctQuestions / data.totalQuestions) * 100) : 100;

      let status: ConceptMastery['status'] = 'mastered';
      if (accuracyPercentage < 60 || data.cardsNeedingReview > 0) {
        status = 'needs_practice';
      } else if (accuracyPercentage < 100) {
        status = 'review_recommended';
      }

      conceptMasteryList.push({
        concept,
        totalQuestions: data.totalQuestions,
        correctQuestions: data.correctQuestions,
        accuracyPercentage,
        totalCards: data.totalCards,
        cardsNeedingReview: data.cardsNeedingReview,
        status,
      });
    }
  }

  // Frequently Missed Concepts
  const frequentlyMissedConcepts = conceptMasteryList
    .filter((c) => c.status === 'needs_practice')
    .map((c) => c.concept);

  // Attempt Improvement Delta across Quiz Attempts
  let improvementSummary: AttemptImprovementSummary | null = null;
  const quizHistory = session.progress.quiz.history || [];
  if (quizHistory.length >= 2) {
    const firstAttempt = quizHistory[0];
    const latestAttempt = quizHistory[quizHistory.length - 1];
    const firstPct =
      firstAttempt.total > 0 ? Math.round((firstAttempt.score / firstAttempt.total) * 100) : 0;
    const latestPct =
      latestAttempt.total > 0 ? Math.round((latestAttempt.score / latestAttempt.total) * 100) : 0;

    improvementSummary = {
      firstAttemptPercentage: firstPct,
      latestAttemptPercentage: latestPct,
      deltaPercentage: latestPct - firstPct,
      totalAttempts: quizHistory.length,
    };
  }

  // Pedagogical Recommendation based on real metrics
  let pedagogicalRecommendation =
    'Begin by reviewing the executive summary and flipping through key flashcards.';
  if (!hasEnoughData) {
    pedagogicalRecommendation =
      'Complete the multiple-choice quiz and review flashcards to reveal authentic concept-level insights.';
  } else if (frequentlyMissedConcepts.length > 0) {
    pedagogicalRecommendation = `Prioritize revision on ${frequentlyMissedConcepts.length} flagged concept${
      frequentlyMissedConcepts.length > 1 ? 's' : ''
    } (${frequentlyMissedConcepts.slice(0, 2).join(', ')}) before retesting.`;
  } else if (improvementSummary && improvementSummary.deltaPercentage > 0) {
    pedagogicalRecommendation = `Great progress! Quiz accuracy improved by +${improvementSummary.deltaPercentage}% across ${improvementSummary.totalAttempts} attempts.`;
  } else if (overallMastery >= 90) {
    pedagogicalRecommendation =
      'Exceptional mastery across all active modules! Ready to proceed to advanced topics.';
  } else if (checklistStats && checklistStats.percentage < 100) {
    pedagogicalRecommendation = `Complete your remaining ${
      checklistStats.total - checklistStats.completedCount
    } checklist revision milestone${checklistStats.total - checklistStats.completedCount > 1 ? 's' : ''}.`;
  }

  return {
    overallMastery,
    hasEnoughData,
    conceptMasteryList,
    frequentlyMissedConcepts,
    improvementSummary,
    flashcardStats,
    quizStats,
    checklistStats,
    cardsNeedingReview,
    pedagogicalRecommendation,
  };
}
