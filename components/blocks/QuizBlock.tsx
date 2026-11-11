'use client';

import React, { useState } from 'react';
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  Trophy,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import type { QuizBlock as QuizBlockType } from '@/types/study';
import { calculateQuizScore } from '@/lib/studyLogic';

export interface QuizBlockProps {
  block: QuizBlockType;
  answers?: { [questionId: string]: number };
  submitted?: boolean;
  onRecordAnswer?: (questionId: string, optionIndex: number) => void;
  onSubmitQuiz?: () => void;
  onResetQuiz?: () => void;
  onStartRetest?: () => void;
}

export const QuizBlock: React.FC<QuizBlockProps> = ({
  block,
  answers = {},
  submitted = false,
  onRecordAnswer,
  onSubmitQuiz,
  onResetQuiz,
  onStartRetest,
}) => {
  const [validationWarning, setValidationWarning] = useState<string | null>(null);

  const questions = block.questions;
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;

  const scoreResult = calculateQuizScore(questions, answers);
  const isAllAnswered = answeredCount >= totalQuestions;

  const handleSubmit = () => {
    if (!isAllAnswered) {
      setValidationWarning(
        `You have answered ${answeredCount} of ${totalQuestions} questions. Answer all questions to submit.`
      );
      return;
    }
    setValidationWarning(null);
    onSubmitQuiz?.();

    // If perfect score, trigger celebration confetti!
    if (scoreResult.score === totalQuestions) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // Safe fallback if canvas-confetti is not loaded
      }
    }
  };

  const optionLetters = ['A', 'B', 'C', 'D', 'E', 'F'];

  return (
    <Card className="space-y-6 animate-fadeIn border-indigo-900/30">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-card-border/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary-500/10 text-primary-400 border border-primary-500/20">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold tracking-wider text-primary-400 uppercase">
              Comprehension Check
            </span>
            <h3 className="text-lg md:text-xl font-bold text-slate-100">
              Multiple-Choice Quiz
            </h3>
          </div>
        </div>

        {/* Status / Count badge */}
        <div className="flex items-center gap-2">
          {submitted ? (
            <Badge
              variant={scoreResult.percentage >= 70 ? 'success' : 'warning'}
              size="md"
            >
              Score: {scoreResult.score}/{totalQuestions} ({scoreResult.percentage}%)
            </Badge>
          ) : (
            <span className="text-xs text-slate-400">
              Answered: <strong className="text-slate-200">{answeredCount}</strong> / {totalQuestions}
            </span>
          )}
        </div>
      </div>

      {/* Submitted Score Summary Banner */}
      {submitted && (
        <div
          className={`p-5 rounded-2xl border transition-all ${
            scoreResult.percentage === 100
              ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
              : scoreResult.percentage >= 70
              ? 'bg-primary-950/30 border-primary-500/40 text-primary-200'
              : 'bg-amber-950/30 border-amber-500/40 text-amber-200'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/60">
                {scoreResult.percentage === 100 ? (
                  <Trophy className="w-6 h-6 text-emerald-400" />
                ) : (
                  <Sparkles className="w-6 h-6 text-primary-400" />
                )}
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-100">
                  {scoreResult.percentage === 100
                    ? 'Flawless Mastery! 100% Score'
                    : scoreResult.percentage >= 70
                    ? 'Great Comprehension!'
                    : 'Targeted Review Recommended'}
                </h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  You answered {scoreResult.score} out of {totalQuestions} questions correctly.
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-2.5">
              {scoreResult.incorrectQuestionIds.length > 0 && onStartRetest && (
                <Button
                  size="sm"
                  variant="primary"
                  onClick={onStartRetest}
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                  className="bg-indigo-600 hover:bg-indigo-500"
                >
                  Retest {scoreResult.incorrectQuestionIds.length} Wrong Question
                  {scoreResult.incorrectQuestionIds.length > 1 ? 's' : ''}
                </Button>
              )}

              {onResetQuiz && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onResetQuiz}
                  leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                >
                  Retake All
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Validation warning */}
      {validationWarning && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-xs text-amber-200">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
          <span>{validationWarning}</span>
        </div>
      )}

      {/* Questions list */}
      <div className="space-y-6">
        {questions.map((q, qIdx) => {
          const selectedOption = answers[q.id];
          const isCorrect = selectedOption === q.correctAnswerIndex;
          const isAnswered = selectedOption !== undefined;

          return (
            <div
              key={q.id}
              className={`p-5 rounded-2xl border transition-all duration-200 ${
                submitted
                  ? isCorrect
                    ? 'bg-slate-900/60 border-emerald-900/40'
                    : 'bg-slate-900/60 border-rose-900/40'
                  : 'bg-slate-900/40 border-card-border/80 hover:border-slate-700'
              }`}
            >
              {/* Question title */}
              <div className="flex items-start gap-3 mb-4">
                <span className="text-xs font-mono font-semibold px-2 py-1 rounded bg-slate-800 text-slate-400 border border-slate-700">
                  Q{qIdx + 1}
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
                        <XCircle className="w-4 h-4" /> Incorrect
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
                      'border-primary-500 bg-primary-950/40 text-primary-200 shadow-sm shadow-primary-500/20';
                  }

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      disabled={submitted}
                      onClick={() => onRecordAnswer?.(q.id, optIdx)}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all text-xs md:text-sm flex items-center gap-3 select-none ${optionStyle}`}
                    >
                      <span
                        className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-mono font-bold shrink-0 transition-colors ${
                          submitted && isThisCorrect
                            ? 'bg-emerald-500 text-slate-950'
                            : submitted && isThisSelected && !isCorrect
                            ? 'bg-rose-500 text-white'
                            : isThisSelected
                            ? 'bg-primary-500 text-white'
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

              {/* Explanation Reveal */}
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

      {/* Submit button at bottom */}
      {!submitted && (
        <div className="flex justify-end pt-2 border-t border-card-border/60">
          <Button
            variant="primary"
            size="md"
            onClick={handleSubmit}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Submit Quiz ({answeredCount}/{totalQuestions} Answered)
          </Button>
        </div>
      )}
    </Card>
  );
};
