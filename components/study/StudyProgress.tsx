'use client';

import React, { useState } from 'react';
import {
  Layers,
  HelpCircle,
  CheckSquare,
  Target,
  Brain,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import type { StudySession, FlashcardBlock, QuizBlock, ChecklistBlock } from '@/types/study';
import {
  calculateFlashcardStats,
  calculateQuizScore,
  calculateChecklistStats,
  calculateOverallMastery,
  calculateDetailedAnalytics,
} from '@/lib/studyLogic';

export interface StudyProgressProps {
  session: StudySession;
}

export const StudyProgress: React.FC<StudyProgressProps> = ({ session }) => {
  const [showDetailedAnalytics, setShowDetailedAnalytics] = useState(false);

  const overallMastery = calculateOverallMastery(session);
  const analytics = calculateDetailedAnalytics(session);

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

  return (
    <Card className="p-5 md:p-6 bg-[#101010] border border-[#252525] space-y-4">
      {/* Top row: Overall Mastery Gauge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#181818] border border-[#252525] text-[#F5F5F5]">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#737373]">
              Active Learning Progress
            </span>
            <h4 className="text-base font-semibold text-[#F5F5F5]">Session Mastery Score</h4>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-xl md:text-2xl font-bold font-mono text-[#F5F5F5]">
              {overallMastery}%
            </span>
          </div>
          <div className="w-28 h-2 bg-[#181818] rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-300 rounded-full"
              style={{ width: `${overallMastery}%` }}
            />
          </div>
        </div>
      </div>

      {/* Sub-metrics cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-[#1F1F1F] text-xs">
        {/* Flashcards metric */}
        {flashcardStats && (
          <div className="p-3 rounded-xl bg-[#141414] border border-[#1F1F1F] flex items-center justify-between">
            <span className="text-[#A3A3A3] flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-[#737373]" />
              Cards Mastered
            </span>
            <span className="font-mono font-semibold text-[#F5F5F5]">
              {flashcardStats.knownCount}/{flashcardStats.total}
            </span>
          </div>
        )}

        {/* Quiz metric */}
        {quizBlock && (
          <div className="p-3 rounded-xl bg-[#141414] border border-[#1F1F1F] flex items-center justify-between">
            <span className="text-[#A3A3A3] flex items-center gap-2">
              <HelpCircle className="w-3.5 h-3.5 text-[#737373]" />
              Quiz Score
            </span>
            <span className="font-mono font-semibold text-[#F5F5F5]">
              {session.progress.quiz.submitted && quizStats
                ? `${quizStats.score}/${quizStats.total} (${quizStats.percentage}%)`
                : 'Not taken'}
            </span>
          </div>
        )}

        {/* Checklist metric */}
        {checklistStats && (
          <div className="p-3 rounded-xl bg-[#141414] border border-[#1F1F1F] flex items-center justify-between">
            <span className="text-[#A3A3A3] flex items-center gap-2">
              <CheckSquare className="w-3.5 h-3.5 text-[#737373]" />
              Checklist Done
            </span>
            <span className="font-mono font-semibold text-[#F5F5F5]">
              {checklistStats.completedCount}/{checklistStats.total} ({checklistStats.percentage}%)
            </span>
          </div>
        )}
      </div>

      {/* Toggle button for Learning Intelligence Drawer */}
      <div className="pt-2 flex justify-end">
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => setShowDetailedAnalytics((prev) => !prev)}
          leftIcon={<Brain className="w-3.5 h-3.5 text-[#A3A3A3]" />}
          rightIcon={
            showDetailedAnalytics ? (
              <ChevronUp className="w-3.5 h-3.5 text-[#737373]" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-[#737373]" />
            )
          }
          className="text-xs text-[#A3A3A3] hover:text-[#F5F5F5] border border-[#1F1F1F] bg-[#141414] hover:bg-[#181818]"
        >
          {showDetailedAnalytics ? 'Hide Learning Intelligence' : 'View Learning Intelligence & Concept Insights'}
        </Button>
      </div>

      {/* Expanded Learning Intelligence Panel */}
      {showDetailedAnalytics && (
        <div className="pt-4 border-t border-[#1F1F1F] space-y-4">
          {/* Pedagogical Guidance Banner */}
          <div className="p-3.5 rounded-xl bg-[#141414] border border-[#252525] flex items-start gap-3">
            <div className="p-1.5 rounded-lg bg-[#181818] border border-[#2A2A2A] text-white shrink-0 mt-0.5">
              <Brain className="w-3.5 h-3.5" />
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#737373]">
                Pedagogical Recommendation
              </span>
              <p className="text-xs text-[#E5E5E5] leading-relaxed">
                {analytics.pedagogicalRecommendation}
              </p>
            </div>
          </div>

          {/* Attempt Progression History (if multiple attempts exist) */}
          {analytics.improvementSummary && (
            <div className="p-3.5 rounded-xl bg-[#141414] border border-[#252525] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <TrendingUp className="w-4 h-4 text-white" />
                <span className="text-[#A3A3A3]">
                  Quiz Improvement ({analytics.improvementSummary.totalAttempts} attempts):
                </span>
                <span className="font-mono text-[#737373]">
                  Initial {analytics.improvementSummary.firstAttemptPercentage}%
                </span>
                <span className="text-[#525252]">→</span>
                <span className="font-mono font-semibold text-white">
                  Latest {analytics.improvementSummary.latestAttemptPercentage}%
                </span>
              </div>
              <Badge
                variant={analytics.improvementSummary.deltaPercentage >= 0 ? 'success' : 'neutral'}
                size="sm"
              >
                {analytics.improvementSummary.deltaPercentage >= 0
                  ? `+${analytics.improvementSummary.deltaPercentage}% score delta`
                  : `${analytics.improvementSummary.deltaPercentage}% score delta`}
              </Badge>
            </div>
          )}

          {/* Concept Mastery Breakdown */}
          {analytics.hasEnoughData ? (
            analytics.conceptMasteryList.length > 0 ? (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs text-[#737373] px-1">
                  <span className="font-medium uppercase tracking-wider text-[10px]">
                    Concept Accuracy Breakdown
                  </span>
                  <span>
                    {analytics.frequentlyMissedConcepts.length > 0 ? (
                      <span className="text-[#FF8080] font-medium">
                        {analytics.frequentlyMissedConcepts.length} concept(s) need practice
                      </span>
                    ) : (
                      <span className="text-white font-medium">All concepts on track</span>
                    )}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {analytics.conceptMasteryList.map((conceptItem, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-[#141414] border border-[#1F1F1F] space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium text-xs text-[#F5F5F5] truncate">
                          {conceptItem.concept}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${
                            conceptItem.status === 'mastered'
                              ? 'bg-[#181818] text-[#F5F5F5] border-[#383838]'
                              : conceptItem.status === 'needs_practice'
                              ? 'bg-[#1F1010] text-[#FCA5A5] border-[#4A1E1E]'
                              : 'bg-[#181818] text-[#A3A3A3] border-[#252525]'
                          }`}
                        >
                          {conceptItem.status === 'mastered'
                            ? 'Mastered'
                            : conceptItem.status === 'needs_practice'
                            ? 'Needs Practice'
                            : 'Review Recommended'}
                        </span>
                      </div>

                      {/* Accuracy bar */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-[#737373]">
                          <span>Quiz Accuracy</span>
                          <span className="font-mono text-[#A3A3A3]">
                            {conceptItem.accuracyPercentage}% ({conceptItem.correctQuestions}/
                            {conceptItem.totalQuestions})
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-[#1F1F1F] rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              conceptItem.status === 'mastered'
                                ? 'bg-white'
                                : conceptItem.status === 'needs_practice'
                                ? 'bg-[#EF4444]'
                                : 'bg-[#A3A3A3]'
                            }`}
                            style={{ width: `${conceptItem.accuracyPercentage}%` }}
                          />
                        </div>
                      </div>

                      {conceptItem.cardsNeedingReview > 0 && (
                        <div className="text-[10px] text-[#A3A3A3] flex items-center gap-1.5 pt-0.5">
                          <AlertCircle className="w-3 h-3 text-[#EF4444]" />
                          <span>{conceptItem.cardsNeedingReview} flashcard(s) marked for review</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : null
          ) : (
            <div className="p-4 rounded-xl bg-[#141414] border border-[#1F1F1F] text-center space-y-1">
              <Brain className="w-5 h-5 mx-auto text-[#525252]" />
              <p className="text-xs text-[#A3A3A3] font-medium">
                Not Enough Activity for Concept Analytics
              </p>
              <p className="text-[11px] text-[#737373]">
                Submit a quiz attempt or flag flashcards to generate authentic concept mastery
                diagnostics.
              </p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};
