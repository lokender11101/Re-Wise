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

  const answeredCount = Object.keys(answers).length;
  const allAnswered = total > 0 && answeredCount >= total;
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
