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
    <Card id="progress-block" className="p-5 md:p-6 bg-[#14201A] border border-[#1E3328] space-y-4 scroll-mt-20">
      {/* Top row: Overall Mastery Gauge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#1A2E24] border border-[#2B4B3A] text-[#A7D8B5]">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#7FA68B]">
              Active Learning Progress
            </span>
            <h4 className="text-base font-semibold text-[#E8F5ED]">Session Mastery Score</h4>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-xl md:text-2xl font-bold font-mono text-[#A7D8B5]">
              {overallMastery}%
            </span>
          </div>
          <div className="w-28 h-2 bg-[#0F1713] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#A7D8B5] transition-all duration-300 rounded-full"
              style={{ width: `${overallMastery}%` }}
            />
          </div>
        </div>
      </div>

      {/* Sub-metrics cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-[#1E3328] text-xs">
        {/* Flashcards metric */}
        {flashcardStats && (
          <div className="p-3 rounded-xl bg-[#0F1713] border border-[#1A2E24] flex items-center justify-between">
            <span className="text-[#8EBA9A] flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-[#A7D8B5]" />
              Cards Mastered
            </span>
            <span className="font-mono font-semibold text-[#F5F5F5]">
              {flashcardStats.knownCount}/{flashcardStats.total}
            </span>
          </div>
        )}

        {/* Quiz metric */}
        {quizBlock && (
          <div className="p-3 rounded-xl bg-[#0F1713] border border-[#1A2E24] flex items-center justify-between">
            <span className="text-[#8EBA9A] flex items-center gap-2">
              <HelpCircle className="w-3.5 h-3.5 text-[#A7D8B5]" />
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
          <div className="p-3 rounded-xl bg-[#0F1713] border border-[#1A2E24] flex items-center justify-between">
            <span className="text-[#8EBA9A] flex items-center gap-2">
              <CheckSquare className="w-3.5 h-3.5 text-[#A7D8B5]" />
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
          leftIcon={<Brain className="w-3.5 h-3.5 text-[#A7D8B5]" />}
          rightIcon={
            showDetailedAnalytics ? (
              <ChevronUp className="w-3.5 h-3.5 text-[#7FA68B]" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-[#7FA68B]" />
            )
          }
          className="text-xs text-[#A7D8B5] hover:text-[#C8ECD3] border border-[#1E3328] bg-[#0F1713] hover:bg-[#1A2E24]"
        >
          {showDetailedAnalytics ? 'Hide Learning Intelligence' : 'View Learning Intelligence & Concept Insights'}
        </Button>
      </div>

      {/* Expanded Learning Intelligence Panel */}
      {showDetailedAnalytics && (
        <div className="pt-4 border-t border-[#1E3328] space-y-4">
          <div className="p-4 rounded-2xl bg-[#181A24] border border-[#25283B] space-y-4">
            {/* Pedagogical Guidance Banner */}
            <div className="p-3.5 rounded-xl bg-[#13141C] border border-[#232638] flex items-start gap-3">
              <div className="p-1.5 rounded-lg bg-[#1E2133] border border-[#2F3452] text-[#B7B9E2] shrink-0 mt-0.5">
                <Brain className="w-3.5 h-3.5" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8A8DAE]">
                  Pedagogical Recommendation
                </span>
                <p className="text-xs text-[#D8DAED] leading-relaxed">
                  {analytics.pedagogicalRecommendation}
                </p>
              </div>
            </div>

            {/* Attempt Progression History (if multiple attempts exist) */}
            {analytics.improvementSummary && (
              <div className="p-3.5 rounded-xl bg-[#13141C] border border-[#232638] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <TrendingUp className="w-4 h-4 text-[#B7B9E2]" />
                  <span className="text-[#9FA2C5]">
                    Quiz Improvement ({analytics.improvementSummary.totalAttempts} attempts):
                  </span>
                  <span className="font-mono text-[#74779C]">
                    Initial {analytics.improvementSummary.firstAttemptPercentage}%
                  </span>
                  <span className="text-[#555877]">→</span>
                  <span className="font-mono font-semibold text-[#B7B9E2]">
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
                  <div className="flex items-center justify-between text-xs text-[#8A8DAE] px-1">
                    <span className="font-medium uppercase tracking-wider text-[10px]">
                      Concept Accuracy Breakdown
                    </span>
                    <span>
                      {analytics.frequentlyMissedConcepts.length > 0 ? (
                        <span className="text-[#FCA5A5] font-medium">
                          {analytics.frequentlyMissedConcepts.length} concept(s) need practice
                        </span>
                      ) : (
                        <span className="text-[#B7B9E2] font-medium">All concepts on track</span>
                      )}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {analytics.conceptMasteryList.map((conceptItem, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-[#13141C] border border-[#232638] space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium text-xs text-[#E5E7F5] truncate">
                            {conceptItem.concept}
                          </span>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${
                              conceptItem.status === 'mastered'
                                ? 'bg-[#1C2033] text-[#B7B9E2] border-[#2D3352]'
                                : conceptItem.status === 'needs_practice'
                                ? 'bg-[#291717] text-[#FCA5A5] border-[#4A2020]'
                                : 'bg-[#1C2033] text-[#A5A8C8] border-[#252A42]'
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
                          <div className="flex items-center justify-between text-[10px] text-[#74779C]">
                            <span>Quiz Accuracy</span>
                            <span className="font-mono text-[#B7B9E2]">
                              {conceptItem.accuracyPercentage}% ({conceptItem.correctQuestions}/
                              {conceptItem.totalQuestions})
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-[#0F1017] rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                conceptItem.status === 'mastered'
                                  ? 'bg-[#B7B9E2]'
                                  : conceptItem.status === 'needs_practice'
                                  ? 'bg-[#EF4444]'
                                  : 'bg-[#74779C]'
                              }`}
                              style={{ width: `${conceptItem.accuracyPercentage}%` }}
                            />
                          </div>
                        </div>

                        {conceptItem.cardsNeedingReview > 0 && (
                          <div className="text-[10px] text-[#FCA5A5] flex items-center gap-1.5 pt-0.5">
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
              <div className="p-4 rounded-xl bg-[#13141C] border border-[#232638] text-center space-y-1">
                <Brain className="w-5 h-5 mx-auto text-[#555877]" />
                <p className="text-xs text-[#A5A8C8] font-medium">
                  Not Enough Activity for Concept Analytics
                </p>
                <p className="text-[11px] text-[#74779C]">
                  Submit a quiz attempt or flag flashcards to generate authentic concept mastery
                  diagnostics.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
};
