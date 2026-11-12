'use client';

import React from 'react';
import { Layers, HelpCircle, CheckSquare, Target } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import type { StudySession, FlashcardBlock, QuizBlock, ChecklistBlock } from '@/types/study';
import {
  calculateFlashcardStats,
  calculateQuizScore,
  calculateChecklistStats,
  calculateOverallMastery,
} from '@/lib/studyLogic';

export interface StudyProgressProps {
  session: StudySession;
}

export const StudyProgress: React.FC<StudyProgressProps> = ({ session }) => {
  const overallMastery = calculateOverallMastery(session);

  const flashcardBlock = session.blocks.find((b): b is FlashcardBlock => b.type === 'flashcards');
  const flashcardStats = flashcardBlock
    ? calculateFlashcardStats(flashcardBlock.cards, session.progress.flashcards)
    : null;

  const quizBlock = session.blocks.find((b): b is QuizBlock => b.type === 'quiz');
  const quizStats = quizBlock && session.progress.quiz.submitted
    ? calculateQuizScore(quizBlock.questions, session.progress.quiz.answers)
    : null;

  const checklistBlock = session.blocks.find((b): b is ChecklistBlock => b.type === 'checklist');
  const checklistStats = checklistBlock
    ? calculateChecklistStats(checklistBlock.items, session.progress.checklist)
    : null;

  return (
    <Card className="p-4 md:p-5 bg-[#101010] border border-[#252525] space-y-4">
      {/* Top row: Overall Mastery Gauge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-[#181818] border border-[#252525] text-[#F5F5F5]">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-medium uppercase tracking-wider text-[#737373]">
              Active Learning Progress
            </span>
            <h4 className="text-sm font-semibold text-[#F5F5F5]">Session Mastery Score</h4>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-xl md:text-2xl font-semibold font-mono text-[#F5F5F5]">
              {overallMastery}%
            </span>
          </div>
          <div className="w-24 h-1.5 bg-[#181818] rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-300 rounded-full"
              style={{ width: `${overallMastery}%` }}
            />
          </div>
        </div>
      </div>

      {/* Sub-metrics cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 border-t border-[#1F1F1F] text-xs">
        {/* Flashcards metric */}
        {flashcardStats && (
          <div className="p-2.5 rounded-xl bg-[#141414] border border-[#1F1F1F] flex items-center justify-between">
            <span className="text-[#737373] flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#A3A3A3]" />
              Cards Mastered
            </span>
            <span className="font-mono font-medium text-[#F5F5F5]">
              {flashcardStats.knownCount}/{flashcardStats.total}
            </span>
          </div>
        )}

        {/* Quiz metric */}
        {quizBlock && (
          <div className="p-2.5 rounded-xl bg-[#141414] border border-[#1F1F1F] flex items-center justify-between">
            <span className="text-[#737373] flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-[#A3A3A3]" />
              Quiz Score
            </span>
            <span className="font-mono font-medium text-[#F5F5F5]">
              {session.progress.quiz.submitted && quizStats
                ? `${quizStats.score}/${quizStats.total} (${quizStats.percentage}%)`
                : 'Not taken'}
            </span>
          </div>
        )}

        {/* Checklist metric */}
        {checklistStats && (
          <div className="p-2.5 rounded-xl bg-[#141414] border border-[#1F1F1F] flex items-center justify-between">
            <span className="text-[#737373] flex items-center gap-1.5">
              <CheckSquare className="w-3.5 h-3.5 text-[#A3A3A3]" />
              Checklist Done
            </span>
            <span className="font-mono font-medium text-[#F5F5F5]">
              {checklistStats.completedCount}/{checklistStats.total} ({checklistStats.percentage}%)
            </span>
          </div>
        )}
      </div>
    </Card>
  );
};
