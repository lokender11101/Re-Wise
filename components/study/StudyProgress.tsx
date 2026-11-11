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
    <Card className="p-4 md:p-5 bg-card/60 border-card-border/80 space-y-4">
      {/* Top row: Overall Mastery Gauge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Active Learning Progress
            </span>
            <h4 className="text-sm font-bold text-slate-200">Session Mastery Score</h4>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-xl md:text-2xl font-black font-mono text-slate-100">
              {overallMastery}%
            </span>
          </div>
          <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                overallMastery >= 80
                  ? 'bg-emerald-500'
                  : overallMastery >= 50
                  ? 'bg-indigo-500'
                  : 'bg-amber-500'
              }`}
              style={{ width: `${overallMastery}%` }}
            />
          </div>
        </div>
      </div>

      {/* Sub-metrics cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 border-t border-card-border/40 text-xs">
        {/* Flashcards metric */}
        {flashcardStats && (
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              Cards Mastered
            </span>
            <span className="font-mono font-semibold text-slate-200">
              {flashcardStats.knownCount}/{flashcardStats.total}
            </span>
          </div>
        )}

        {/* Quiz metric */}
        {quizBlock && (
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-primary-400" />
              Quiz Score
            </span>
            <span className="font-mono font-semibold text-slate-200">
              {session.progress.quiz.submitted && quizStats
                ? `${quizStats.score}/${quizStats.total} (${quizStats.percentage}%)`
                : 'Not taken'}
            </span>
          </div>
        )}

        {/* Checklist metric */}
        {checklistStats && (
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5">
              <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
              Checklist Done
            </span>
            <span className="font-mono font-semibold text-slate-200">
              {checklistStats.completedCount}/{checklistStats.total} ({checklistStats.percentage}%)
            </span>
          </div>
        )}
      </div>
    </Card>
  );
};
