import type {
  QuizQuestion,
  Flashcard,
  ChecklistItem,
  StudySession,
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
