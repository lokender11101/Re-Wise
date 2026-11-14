'use client';

import React from 'react';
import {
  Brain,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  HelpCircle,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import type { StudySession } from '@/types/study';
import { calculateDetailedAnalytics } from '@/lib/studyLogic';
import { THEME } from '@/lib/designTokens';

export interface LearningIntelligenceProps {
  session: StudySession;
  onStartRetest?: () => void;
  isRetesting?: boolean;
}

export const LearningIntelligence: React.FC<LearningIntelligenceProps> = ({
  session,
  onStartRetest,
  isRetesting = false,
}) => {
  const analytics = calculateDetailedAnalytics(session);

  return (
    <div
      id="intelligence-block"
      className="p-6 sm:p-8 rounded-3xl border space-y-6 scroll-mt-24 shadow-xl"
      style={{
        backgroundColor: THEME.sections.analytics.surface,
        borderColor: THEME.sections.analytics.border,
      }}
    >
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#202336] pb-5">
        <div className="flex items-center gap-3">
          <div
            className="p-2.5 rounded-2xl border"
            style={{
              backgroundColor: `${THEME.sections.analytics.accent}15`,
              borderColor: `${THEME.sections.analytics.accent}30`,
              color: THEME.sections.analytics.accent,
            }}
          >
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#8B8FB8]">
              Cognitive Retention Engine
            </span>
            <h3 className="text-base sm:text-lg font-bold text-[#F5F5F5]">
              Learning Intelligence & Concept Analytics
            </h3>
          </div>
        </div>

        {analytics.improvementSummary && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#8B8FB8]">Score Improvement:</span>
            <Badge variant="success" size="md">
              +{analytics.improvementSummary.deltaPercentage}% Delta
            </Badge>
          </div>
        )}
      </div>

      {/* Pedagogical Guidance Banner */}
      <div className="p-4 rounded-2xl bg-[#0B0C12] border border-[#1A1C2C] flex items-start gap-3.5">
        <div className="p-1.5 rounded-xl bg-[#161826] border border-[#262A40] text-[#B7B9E2] shrink-0 mt-0.5">
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="space-y-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8B8FB8]">
            Pedagogical Guidance
          </span>
          <p className="text-xs sm:text-sm text-[#E2E4F5] leading-relaxed">
            {analytics.pedagogicalRecommendation}
          </p>
        </div>
      </div>

      {/* Attempt Progression History (if user attempted quiz multiple times) */}
      {analytics.improvementSummary && (
        <div className="p-4 rounded-2xl bg-[#0B0C12] border border-[#1A1C2C] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <TrendingUp className="w-4 h-4 text-[#B7B9E2]" />
            <span className="text-[#8B8FB8]">
              Quiz Progression ({analytics.improvementSummary.totalAttempts} total attempts):
            </span>
            <span className="font-mono text-[#737373]">
              Initial {analytics.improvementSummary.firstAttemptPercentage}%
            </span>
            <span className="text-[#444444]">→</span>
            <span className="font-mono font-semibold text-white">
              Latest {analytics.improvementSummary.latestAttemptPercentage}%
            </span>
          </div>

          <span className="text-[11px] font-mono text-[#A7D8B5]">
            +{analytics.improvementSummary.deltaPercentage}% mastery gain
          </span>
        </div>
      )}

      {/* Concept Mastery Breakdown */}
      {analytics.hasEnoughData ? (
        analytics.conceptMasteryList.length > 0 ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-[#8B8FB8] px-1">
              <span className="font-medium uppercase tracking-wider text-[10px]">
                Concept Accuracy Breakdown
              </span>
              <span>
                {analytics.frequentlyMissedConcepts.length > 0 ? (
                  <span className="text-[#FCA5A5] font-medium">
                    {analytics.frequentlyMissedConcepts.length} concept(s) require review
                  </span>
                ) : (
                  <span className="text-[#B7B9E2] font-medium">All concepts on track</span>
                )}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {analytics.conceptMasteryList.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-[#0B0C12] border border-[#1A1C2C] space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-xs text-[#F5F5F5] truncate">
                      {item.concept}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${
                        item.status === 'mastered'
                          ? 'bg-[#151C18] text-[#A7D8B5] border-[#1F3325]'
                          : item.status === 'needs_practice'
                          ? 'bg-[#1F1010] text-[#FCA5A5] border-[#441E1E]'
                          : 'bg-[#161826] text-[#B7B9E2] border-[#252A40]'
                      }`}
                    >
                      {item.status === 'mastered'
                        ? 'Mastered'
                        : item.status === 'needs_practice'
                        ? 'Needs Practice'
                        : 'Review Recommended'}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-[#737373]">
                      <span>Quiz Accuracy</span>
                      <span className="font-mono text-[#D4D4D4]">
                        {item.accuracyPercentage}% ({item.correctQuestions}/{item.totalQuestions})
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-[#141624] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          item.status === 'mastered'
                            ? 'bg-[#A7D8B5]'
                            : item.status === 'needs_practice'
                            ? 'bg-[#EF4444]'
                            : 'bg-[#B7B9E2]'
                        }`}
                        style={{ width: `${item.accuracyPercentage}%` }}
                      />
                    </div>
                  </div>

                  {item.cardsNeedingReview > 0 && (
                    <div className="text-[10px] text-[#A3A3A3] flex items-center gap-1.5 pt-0.5">
                      <AlertCircle className="w-3 h-3 text-[#EF4444]" />
                      <span>{item.cardsNeedingReview} flashcard(s) marked for review</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : null
      ) : (
        <div className="p-6 rounded-2xl bg-[#0B0C12] border border-[#1A1C2C] text-center space-y-2">
          <Brain className="w-6 h-6 mx-auto text-[#555877]" />
          <h4 className="text-xs font-semibold text-[#A5A8C8]">
            Not Enough Attempt Data for Granular Diagnostics
          </h4>
          <p className="text-[11px] text-[#737373] max-w-md mx-auto">
            Answer the comprehension quiz or grade flashcards to unlock concept-level retention
            diagnostics and mistake isolation.
          </p>
        </div>
      )}

      {/* Retest CTA if questions were missed */}
      {analytics.quizStats &&
        analytics.quizStats.incorrectQuestions.length > 0 &&
        onStartRetest &&
        !isRetesting && (
          <div className="pt-2 flex justify-end">
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={onStartRetest}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              className="font-medium text-xs shadow-md"
            >
              Retest {analytics.quizStats.incorrectQuestions.length} Missed Question
              {analytics.quizStats.incorrectQuestions.length > 1 ? 's' : ''}
            </Button>
          </div>
        )}
    </div>
  );
};
