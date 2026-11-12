'use client';

import React from 'react';
import {
  Brain,
  Target,
  Layers,
  HelpCircle,
  CheckSquare,
  BarChart3,
  BookOpen,
  ArrowRight,
  RotateCcw,
  Compass,
  Calendar,
  Sparkles,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import type {
  StudySession,
  FlashcardBlock as FlashcardBlockType,
  QuizBlock as QuizBlockType,
  ChecklistBlock as ChecklistBlockType,
  ChartBlock as ChartBlockType,
} from '@/types/study';
import {
  calculateDetailedAnalytics,
  calculateOverallMastery,
  calculateFlashcardStats,
  calculateQuizScore,
  calculateChecklistStats,
} from '@/lib/studyLogic';

export interface ContextualRightSidebarProps {
  session: StudySession;
  activeSection?: string;
  onNavigate?: (sectionId: string) => void;
  onStartRetest?: () => void;
  onResetQuiz?: () => void;
  isRetesting?: boolean;
}

export const ContextualRightSidebar: React.FC<ContextualRightSidebarProps> = ({
  session,
  activeSection = 'overview-block',
  onNavigate,
  onStartRetest,
  onResetQuiz,
  isRetesting = false,
}) => {
  const overallMastery = calculateOverallMastery(session);
  const analytics = calculateDetailedAnalytics(session);

  const flashcardBlock = session.blocks.find(
    (b): b is FlashcardBlockType => b.type === 'flashcards'
  );
  const flashcardStats = flashcardBlock
    ? calculateFlashcardStats(flashcardBlock.cards, session.progress.flashcards)
    : null;

  const quizBlock = session.blocks.find((b): b is QuizBlockType => b.type === 'quiz');
  const quizStats =
    quizBlock && session.progress.quiz.submitted
      ? calculateQuizScore(quizBlock.questions, session.progress.quiz.answers)
      : null;

  const checklistBlock = session.blocks.find(
    (b): b is ChecklistBlockType => b.type === 'checklist'
  );
  const checklistStats = checklistBlock
    ? calculateChecklistStats(checklistBlock.items, session.progress.checklist)
    : null;

  const hasChartBlock = session.blocks.some((b) => b.type === 'chart');

  // Navigation targets based on available blocks
  const navItems = [
    {
      id: 'overview-block',
      label: 'Session Overview',
      icon: Compass,
      accent: '#E5E5E5',
      available: true,
    },
    {
      id: 'summary-block',
      label: 'Executive Summary',
      icon: BookOpen,
      accent: '#D9C69D',
      available: session.blocks.some((b) => b.type === 'summary'),
    },
    {
      id: 'flashcards-block',
      label: '3D Flashcards',
      icon: Layers,
      accent: '#C8ADD9',
      available: !!flashcardBlock,
    },
    {
      id: 'quiz-block',
      label: 'Comprehension Quiz',
      icon: HelpCircle,
      accent: '#E0AAAA',
      available: !!quizBlock,
    },
    {
      id: 'checklist-block',
      label: 'Mastery Checklist',
      icon: CheckSquare,
      accent: '#A5C7CC',
      available: !!checklistBlock,
    },
    {
      id: 'chart-block',
      label: 'Quantitative Chart',
      icon: BarChart3,
      accent: '#A8CDBB',
      available: hasChartBlock,
    },
    {
      id: 'refine-block',
      label: 'Refine Material',
      icon: Sparkles,
      accent: '#D8BD91',
      available: !isRetesting,
    },
  ].filter((item) => item.available);

  const handleScrollTo = (id: string) => {
    if (onNavigate) {
      onNavigate(id);
    } else {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const formattedDate = new Date(session.updatedAt || session.createdAt).toLocaleDateString(
    undefined,
    {
      month: 'short',
      day: 'numeric',
    }
  );

  return (
    <div className="space-y-4 text-xs font-sans">
      {/* 1. Header / Session Intelligence Card (#151515) */}
      <div className="p-4 rounded-2xl bg-[#151515] border border-[#262626] space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold tracking-wider uppercase text-[#737373]">
            Session Intelligence
          </span>
          <Badge variant="neutral" size="sm" className="capitalize text-[10px] px-2 py-0.5">
            {session.difficulty}
          </Badge>
        </div>

        <div>
          <h4 className="font-semibold text-[#F5F5F5] text-sm leading-snug line-clamp-2">
            {session.title}
          </h4>
          <div className="flex items-center gap-2 mt-1.5 text-[11px] text-[#737373]">
            <span>{session.blocks.length} Blocks</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-[#525252]" />
              {formattedDate}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Compact Progress Indicators (#14201A, Accent #A7D8B5) */}
      <div className="p-4 rounded-2xl bg-[#14201A] border border-[#1E3328] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#A7D8B5]">
            <Target className="w-3.5 h-3.5" />
            <span className="text-[10px] font-semibold uppercase tracking-wider">
              Overall Mastery
            </span>
          </div>
          <span className="font-mono font-bold text-sm text-[#A7D8B5]">
            {overallMastery}%
          </span>
        </div>

        {/* Master Progress Track */}
        <div className="h-1.5 w-full bg-[#0F1713] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#A7D8B5] transition-all duration-300 rounded-full"
            style={{ width: `${overallMastery}%` }}
          />
        </div>

        {/* Detailed mini progress rows */}
        <div className="space-y-2 pt-2 border-t border-[#1E3328]/60 text-[11px]">
          {flashcardStats && (
            <div className="flex items-center justify-between text-[#8EBA9A]">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3 h-3 text-[#A7D8B5]" />
                Flashcards
              </span>
              <span className="font-mono font-medium text-[#F5F5F5]">
                {flashcardStats.knownCount}/{flashcardStats.total}
              </span>
            </div>
          )}

          {quizBlock && (
            <div className="flex items-center justify-between text-[#8EBA9A]">
              <span className="flex items-center gap-1.5">
                <HelpCircle className="w-3 h-3 text-[#A7D8B5]" />
                Quiz Score
              </span>
              <span className="font-mono font-medium text-[#F5F5F5]">
                {session.progress.quiz.submitted && quizStats
                  ? `${quizStats.percentage}% (${quizStats.score}/${quizStats.total})`
                  : 'Pending'}
              </span>
            </div>
          )}

          {checklistStats && (
            <div className="flex items-center justify-between text-[#8EBA9A]">
              <span className="flex items-center gap-1.5">
                <CheckSquare className="w-3 h-3 text-[#A7D8B5]" />
                Checklist
              </span>
              <span className="font-mono font-medium text-[#F5F5F5]">
                {checklistStats.completedCount}/{checklistStats.total}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 3. Learning Intelligence & Concept Insights (#181A24, Accent #B7B9E2) */}
      <div className="p-4 rounded-2xl bg-[#181A24] border border-[#25283B] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#B7B9E2]">
            <Brain className="w-3.5 h-3.5" />
            <span className="text-[10px] font-semibold uppercase tracking-wider">
              Concept Retention
            </span>
          </div>
          {analytics.improvementSummary && (
            <span className="font-mono text-[10px] text-[#A5A8DA] flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {analytics.improvementSummary.deltaPercentage >= 0 ? '+' : ''}
              {analytics.improvementSummary.deltaPercentage}%
            </span>
          )}
        </div>

        {/* Weak Concepts or Status */}
        {analytics.hasEnoughData ? (
          <div className="space-y-2">
            {analytics.frequentlyMissedConcepts.length > 0 ? (
              <div className="space-y-1.5">
                <div className="text-[10px] text-[#8B8EB4] font-medium uppercase tracking-wider">
                  Needs Focus:
                </div>
                {analytics.frequentlyMissedConcepts.slice(0, 3).map((concept, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-xl bg-[#13141C] border border-[#232638] text-[11px] text-[#E0E2F5] flex items-center justify-between gap-2"
                  >
                    <span className="truncate">{concept}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#2D1A1A] text-[#FCA5A5] border border-[#482020] shrink-0 font-medium">
                      Review
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-2.5 rounded-xl bg-[#13141C] border border-[#232638] flex items-center gap-2 text-[#B7B9E2] text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#B7B9E2] shrink-0" />
                <span>All concepts performing on track.</span>
              </div>
            )}

            {/* Recommendation snippet */}
            <p className="text-[11px] text-[#9799BF] leading-relaxed pt-1 border-t border-[#25283B]/70">
              {analytics.pedagogicalRecommendation}
            </p>
          </div>
        ) : (
          <div className="p-2.5 rounded-xl bg-[#13141C] border border-[#232638] text-[11px] text-[#9799BF] space-y-1">
            <p className="leading-relaxed">
              Take the quiz or flip flashcards to unlock granular retention insights.
            </p>
          </div>
        )}

        {/* Retest action if applicable */}
        {quizStats && quizStats.incorrectQuestionIds.length > 0 && onStartRetest && !isRetesting && (
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={onStartRetest}
            className="w-full text-[11px] py-1.5 mt-2 font-medium"
            rightIcon={<ArrowRight className="w-3 h-3" />}
          >
            Retest {quizStats.incorrectQuestionIds.length} Missed Question
            {quizStats.incorrectQuestionIds.length > 1 ? 's' : ''}
          </Button>
        )}
      </div>

      {/* 4. Quick Section Navigation (#121212) */}
      <div className="p-4 rounded-2xl bg-[#121212] border border-[#222222] space-y-2.5">
        <span className="text-[10px] font-semibold tracking-wider uppercase text-[#737373] block">
          Quick Navigation
        </span>

        <nav className="space-y-1" aria-label="Section navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleScrollTo(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all text-[11px] text-left group ${
                  isActive
                    ? 'bg-[#1C1C1C] text-white font-medium shadow-sm'
                    : 'text-[#A3A3A3] hover:text-[#F5F5F5] hover:bg-[#171717]'
                }`}
                style={{
                  borderLeft: isActive ? `3px solid ${item.accent}` : '3px solid transparent',
                }}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon
                    className="w-3.5 h-3.5 shrink-0 transition-colors"
                    style={{ color: isActive ? item.accent : '#737373' }}
                  />
                  <span className="truncate">{item.label}</span>
                </div>
                <span
                  className="w-1.5 h-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ backgroundColor: item.accent }}
                />
              </button>
            );
          })}
        </nav>
      </div>

      {/* 5. Study Session Actions */}
      <div className="p-3.5 rounded-2xl bg-[#101010] border border-[#222222] space-y-2">
        <span className="text-[10px] font-semibold tracking-wider uppercase text-[#737373] block px-1">
          Quick Actions
        </span>

        <div className="flex flex-col gap-1.5">
          {session.progress.quiz.submitted && onResetQuiz && (
            <button
              type="button"
              onClick={onResetQuiz}
              className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#141414] hover:bg-[#1A1A1A] border border-[#252525] text-[11px] text-[#A3A3A3] hover:text-[#F5F5F5] transition-colors"
            >
              <RotateCcw className="w-3 h-3 text-[#737373]" />
              <span>Retake Complete Quiz</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => handleScrollTo('refine-block')}
            className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#141414] hover:bg-[#1A1A1A] border border-[#252525] text-[11px] text-[#A3A3A3] hover:text-[#D8BD91] transition-colors"
          >
            <Sparkles className="w-3 h-3 text-[#D8BD91]" />
            <span>Refine Material with AI</span>
          </button>
        </div>
      </div>
    </div>
  );
};
