'use client';

import React from 'react';
import {
  Target,
  Layers,
  HelpCircle,
  CheckSquare,
  Brain,
  ChevronDown,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import type { StudySession, FlashcardBlock, QuizBlock, ChecklistBlock } from '@/types/study';
import {
  calculateOverallMastery,
  calculateFlashcardStats,
  calculateQuizScore,
  calculateChecklistStats,
} from '@/lib/studyLogic';
import { THEME } from '@/lib/designTokens';

export interface MasteryStatsPanelProps {
  session: StudySession;
  onScrollToInsights?: () => void;
}

export const MasteryStatsPanel: React.FC<MasteryStatsPanelProps> = ({
  session,
  onScrollToInsights,
}) => {
  const overallMastery = calculateOverallMastery(session);

  const flashcardBlock = session.blocks.find((b): b is FlashcardBlock => b.type === 'flashcards');
  const flashcardStats = flashcardBlock
    ? calculateFlashcardStats(flashcardBlock.cards, session.progress.flashcards)
    : null;

  const quizBlock = session.blocks.find((b): b is QuizBlock => b.type === 'quiz');
  const quizStats =
    quizBlock && session.progress.quiz.submitted
      ? calculateQuizScore(quizBlock.questions, session.progress.quiz.answers)
      : null;

  const checklistBlock = session.blocks.find((b): b is ChecklistBlock => b.type === 'checklist');
  const checklistStats = checklistBlock
    ? calculateChecklistStats(checklistBlock.items, session.progress.checklist)
    : null;

  // SVG Circular progress ring calculations
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overallMastery / 100) * circumference;

  return (
    <div
      id="progress-block"
      className="p-6 sm:p-7 rounded-3xl border space-y-6 scroll-mt-24 shadow-xl"
      style={{
        backgroundColor: THEME.sections.progress.surface,
        borderColor: THEME.sections.progress.border,
      }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left Column: Circular Progress Ring & Session Mastery Score */}
        <div className="lg:col-span-4 flex items-center gap-4 sm:gap-5">
          <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
            <svg className="w-16 h-16 -rotate-90 transform" viewBox="0 0 64 64">
              <circle
                cx="32"
                cy="32"
                r={radius}
                className="text-neutral-800/80"
                strokeWidth="5"
                stroke="currentColor"
                fill="none"
              />
              <circle
                cx="32"
                cy="32"
                r={radius}
                style={{
                  stroke: THEME.sections.progress.accent,
                  strokeDasharray: circumference,
                  strokeDashoffset,
                }}
                strokeWidth="5"
                strokeLinecap="round"
                fill="none"
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <span className="absolute font-mono font-bold text-sm text-[#F5F5F5]">
              {overallMastery}%
            </span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#7DAA8E]">
              Mastery Score
            </span>
            <h3 className="text-base sm:text-lg font-bold text-[#F5F5F5]">
              Active Retention
            </h3>
            <p className="text-[11px] text-[#A3A3A3]">
              Calculated across recall cards, quiz accuracy & verification
            </p>
          </div>
        </div>

        {/* Right Columns: Horizontal Metrics Panels (Zomato style horizontal panels) */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {/* Flashcard Metric */}
          <div className="p-3.5 rounded-2xl bg-[#090E0B] border border-[#18281E] flex flex-col justify-between gap-2">
            <div className="flex items-center justify-between text-[#8EBA9A]">
              <span className="flex items-center gap-1.5 font-medium">
                <Layers className="w-3.5 h-3.5 text-[#A7D8B5]" /> Cards Known
              </span>
              <span className="font-mono font-bold text-[#F5F5F5]">
                {flashcardStats ? `${flashcardStats.knownCount}/${flashcardStats.total}` : 'N/A'}
              </span>
            </div>
            <div className="h-1.5 w-full bg-[#121E17] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#A7D8B5] transition-all duration-300 rounded-full"
                style={{
                  width: flashcardStats
                    ? `${(flashcardStats.knownCount / Math.max(flashcardStats.total, 1)) * 100}%`
                    : '0%',
                }}
              />
            </div>
          </div>

          {/* Quiz Metric */}
          <div className="p-3.5 rounded-2xl bg-[#090E0B] border border-[#18281E] flex flex-col justify-between gap-2">
            <div className="flex items-center justify-between text-[#8EBA9A]">
              <span className="flex items-center gap-1.5 font-medium">
                <HelpCircle className="w-3.5 h-3.5 text-[#A7D8B5]" /> Quiz Accuracy
              </span>
              <span className="font-mono font-bold text-[#F5F5F5]">
                {session.progress.quiz.submitted && quizStats
                  ? `${quizStats.percentage}%`
                  : 'Pending'}
              </span>
            </div>
            <div className="h-1.5 w-full bg-[#121E17] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#A7D8B5] transition-all duration-300 rounded-full"
                style={{
                  width: quizStats ? `${quizStats.percentage}%` : '0%',
                }}
              />
            </div>
          </div>

          {/* Checklist Metric */}
          <div className="p-3.5 rounded-2xl bg-[#090E0B] border border-[#18281E] flex flex-col justify-between gap-2">
            <div className="flex items-center justify-between text-[#8EBA9A]">
              <span className="flex items-center gap-1.5 font-medium">
                <CheckSquare className="w-3.5 h-3.5 text-[#A7D8B5]" /> Checklist Done
              </span>
              <span className="font-mono font-bold text-[#F5F5F5]">
                {checklistStats ? `${checklistStats.completedCount}/${checklistStats.total}` : 'N/A'}
              </span>
            </div>
            <div className="h-1.5 w-full bg-[#121E17] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#A7D8B5] transition-all duration-300 rounded-full"
                style={{
                  width: checklistStats ? `${checklistStats.percentage}%` : '0%',
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
