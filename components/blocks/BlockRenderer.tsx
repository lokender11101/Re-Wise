'use client';

import React from 'react';
import { motion } from 'framer-motion';
import type { StudyBlock } from '@/types/study';
import { SummaryBlock } from './SummaryBlock';
import { FlashcardBlock } from './FlashcardBlock';
import { QuizBlock } from './QuizBlock';
import { ChecklistBlock } from './ChecklistBlock';
import { ChartBlock } from './ChartBlock';
import { blockEntranceVariants } from '@/lib/motion';

export interface BlockRendererProps {
  block: StudyBlock;
  // Flashcard props
  flashcardProgress?: { [cardId: string]: 'known' | 'learning' };
  onMarkCard?: (cardId: string, status: 'known' | 'learning') => void;
  // Quiz props
  quizAnswers?: { [questionId: string]: number };
  quizSubmitted?: boolean;
  onRecordQuizAnswer?: (questionId: string, optionIndex: number) => void;
  onSubmitQuiz?: () => void;
  onResetQuiz?: () => void;
  onStartRetest?: () => void;
  // Checklist props
  checklistProgress?: { [itemId: string]: boolean };
  onToggleChecklistItem?: (itemId: string) => void;
}

export const BlockRenderer: React.FC<BlockRendererProps> = ({
  block,
  flashcardProgress,
  onMarkCard,
  quizAnswers,
  quizSubmitted,
  onRecordQuizAnswer,
  onSubmitQuiz,
  onResetQuiz,
  onStartRetest,
  checklistProgress,
  onToggleChecklistItem,
}) => {
  const renderContent = () => {
    switch (block.type) {
      case 'summary':
        return <SummaryBlock block={block} />;

      case 'flashcards':
        return (
          <FlashcardBlock
            block={block}
            progressMap={flashcardProgress}
            onMarkCard={onMarkCard}
          />
        );

      case 'quiz':
        return (
          <QuizBlock
            block={block}
            answers={quizAnswers}
            submitted={quizSubmitted}
            onRecordAnswer={onRecordQuizAnswer}
            onSubmitQuiz={onSubmitQuiz}
            onResetQuiz={onResetQuiz}
            onStartRetest={onStartRetest}
          />
        );

      case 'checklist':
        return (
          <ChecklistBlock
            block={block}
            progressMap={checklistProgress}
            onToggleItem={onToggleChecklistItem}
          />
        );

      case 'chart':
        return <ChartBlock block={block} />;

      default:
        return (
          <div className="p-4 rounded-xl border border-[#331F1F] bg-[#141010] text-xs text-[#FCA5A5]">
            Unsupported block format encountered: {(block as { type?: string })?.type || 'unknown'}
          </div>
        );
    }
  };

  return (
    <motion.div
      variants={blockEntranceVariants}
      initial="hidden"
      animate="visible"
      className="w-full"
    >
      {renderContent()}
    </motion.div>
  );
};
