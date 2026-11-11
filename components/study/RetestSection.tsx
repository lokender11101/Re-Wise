'use client';

import React from 'react';
import {
  RotateCcw,
  CheckCircle2,
  XCircle,
  Trophy,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import type { QuizQuestion } from '@/types/study';

export interface RetestSectionProps {
  questionsToRetest: QuizQuestion[];
  retestAnswers: { [questionId: string]: number };
  submitted: boolean;
  scoreResult: {
    score: number;
    total: number;
    percentage: number;
  } | null;
  previousQuizScore?: {
    score: number;
    total: number;
  };
  onRecordRetestAnswer: (questionId: string, optionIndex: number) => void;
  onSubmitRetest: () => void;
  onExitRetest: () => void;
}

export const RetestSection: React.FC<RetestSectionProps> = ({
  questionsToRetest,
  retestAnswers,
  submitted,
  scoreResult,
  previousQuizScore,
  onRecordRetestAnswer,
  onSubmitRetest,
  onExitRetest,
}) => {
  const totalRetest = questionsToRetest.length;
  const answeredCount = Object.keys(retestAnswers).length;
  const isAllAnswered = answeredCount >= totalRetest;

  const handleSubmit = () => {
    onSubmitRetest();
    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {
      // Safe fallback
    }
  };

  const optionLetters = ['A', 'B', 'C', 'D', 'E', 'F'];

  return (
    <Card className="space-y-6 animate-fadeIn border-indigo-500/40 bg-gradient-to-b from-card to-card-elevated shadow-2xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-card-border/80 pb-4">
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="ghost"
            onClick={onExitRetest}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            className="text-slate-400 hover:text-white"
          >
            Back
          </Button>
          <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <RotateCcw className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold tracking-wider text-indigo-400 uppercase">
              Targeted Correction
            </span>
            <h3 className="text-lg md:text-xl font-bold text-slate-100">
              Wrong-Answer Retest
            </h3>
          </div>
        </div>

        <Badge variant="warning" size="md">
          {totalRetest} Question{totalRetest > 1 ? 's' : ''} to Retry
        </Badge>
      </div>

      {/* Retest Performance Banner */}
      {submitted && scoreResult && (
        <div className="p-5 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 text-emerald-200 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/60">
                <Trophy className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-100">
                  Retest Score: {scoreResult.score} / {scoreResult.total} ({scoreResult.percentage}%)
                </h4>
                {previousQuizScore && (
                  <p className="text-xs text-slate-300 mt-0.5">
                    Your previous quiz score was {previousQuizScore.score}/{previousQuizScore.total}.
                    Corrections are now merged into your study session!
                  </p>
                )}
              </div>
            </div>

            <Button size="sm" variant="success" onClick={onExitRetest}>
              Return to Study Dashboard
            </Button>
          </div>
        </div>
      )}

      {/* Retest Questions List */}
      <div className="space-y-6">
        {questionsToRetest.map((q, qIdx) => {
          const selectedOption = retestAnswers[q.id];
          const isCorrect = selectedOption === q.correctAnswerIndex;

          return (
            <div
              key={q.id}
              className={`p-5 rounded-2xl border transition-all ${
                submitted
                  ? isCorrect
                    ? 'bg-slate-900/60 border-emerald-900/50'
                    : 'bg-slate-900/60 border-rose-900/50'
                  : 'bg-slate-900/40 border-card-border/80'
              }`}
            >
              {/* Question title */}
              <div className="flex items-start gap-3 mb-4">
                <span className="text-xs font-mono font-semibold px-2 py-1 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                  Retest #{qIdx + 1}
                </span>
                <p className="text-sm md:text-base font-semibold text-slate-100 flex-1 leading-snug">
                  {q.question}
                </p>

                {submitted && (
                  <div>
                    {isCorrect ? (
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-medium">
                        <CheckCircle2 className="w-4 h-4" /> Correct
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-rose-400 font-medium">
                        <XCircle className="w-4 h-4" /> Still Incorrect
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Options */}
              <div className="space-y-2.5">
                {q.options.map((option, optIdx) => {
                  const isThisSelected = selectedOption === optIdx;
                  const isThisCorrect = optIdx === q.correctAnswerIndex;

                  let optionStyle =
                    'border-slate-800 bg-slate-950/60 hover:bg-slate-800/60 text-slate-300';

                  if (submitted) {
                    if (isThisCorrect) {
                      optionStyle =
                        'border-emerald-500/80 bg-emerald-950/40 text-emerald-200 font-medium';
                    } else if (isThisSelected && !isCorrect) {
                      optionStyle =
                        'border-rose-500/80 bg-rose-950/40 text-rose-200 line-through';
                    } else {
                      optionStyle = 'border-slate-800/40 bg-slate-950/20 text-slate-500';
                    }
                  } else if (isThisSelected) {
                    optionStyle =
                      'border-indigo-500 bg-indigo-950/40 text-indigo-200 shadow-sm shadow-indigo-500/20';
                  }

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      disabled={submitted}
                      onClick={() => onRecordRetestAnswer(q.id, optIdx)}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all text-xs md:text-sm flex items-center gap-3 select-none ${optionStyle}`}
                    >
                      <span
                        className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-mono font-bold shrink-0 transition-colors ${
                          submitted && isThisCorrect
                            ? 'bg-emerald-500 text-slate-950'
                            : submitted && isThisSelected && !isCorrect
                            ? 'bg-rose-500 text-white'
                            : isThisSelected
                            ? 'bg-indigo-500 text-white'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {optionLetters[optIdx] || optIdx + 1}
                      </span>
                      <span className="flex-1 leading-relaxed">{option}</span>

                      {submitted && isThisCorrect && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      )}
                      {submitted && isThisSelected && !isCorrect && (
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation */}
              {submitted && (
                <div className="mt-4 p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1 text-xs animate-fadeIn">
                  <div className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-primary-400" />
                    <span>Explanation</span>
                  </div>
                  <p className="text-slate-400 leading-relaxed">{q.explanation}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Retest Submit Action */}
      {!submitted && (
        <div className="flex items-center justify-between pt-2 border-t border-card-border/80">
          <Button variant="ghost" size="sm" onClick={onExitRetest}>
            Cancel Retest
          </Button>

          <Button
            variant="primary"
            size="md"
            disabled={!isAllAnswered}
            onClick={handleSubmit}
            className="bg-indigo-600 hover:bg-indigo-500"
          >
            Submit Retest ({answeredCount}/{totalRetest} Answered)
          </Button>
        </div>
      )}
    </Card>
  );
};
