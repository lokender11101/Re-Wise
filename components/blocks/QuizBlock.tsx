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
        // Safe fallback
      }
    }
  };

  const optionLetters = ['A', 'B', 'C', 'D', 'E', 'F'];

  return (
    <Card className="space-y-6 animate-fade-in border-[#252525] bg-[#101010]">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1F1F1F] pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#181818] border border-[#252525] text-[#F5F5F5]">
            <HelpCircle className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-medium tracking-wider text-[#737373] uppercase">
              Comprehension Check
            </span>
            <h3 className="text-base md:text-lg font-semibold text-[#F5F5F5]">
              Multiple-Choice Quiz
            </h3>
          </div>
        </div>

        {/* Status / Count badge */}
        <div className="flex items-center gap-2">
          {submitted ? (
            <Badge variant="neutral" size="md">
              Score: {scoreResult.score}/{totalQuestions} ({scoreResult.percentage}%)
            </Badge>
          ) : (
            <span className="text-xs text-[#737373]">
              Answered: <strong className="text-[#F5F5F5] font-mono">{answeredCount}</strong> / {totalQuestions}
            </span>
          )}
        </div>
      </div>

      {/* Submitted Score Summary Banner */}
      {submitted && (
        <div className="p-5 rounded-2xl bg-[#141414] border border-[#252525] text-[#F5F5F5]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 rounded-xl bg-[#181818] border border-[#252525] text-white">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="text-sm md:text-base font-semibold text-[#F5F5F5]">
                  {scoreResult.percentage === 100
                    ? '100% Score — Complete Mastery'
                    : scoreResult.percentage >= 70
                    ? 'Great Comprehension'
                    : 'Targeted Review Recommended'}
                </h4>
                <p className="text-xs text-[#A3A3A3] mt-0.5">
                  Answered {scoreResult.score} out of {totalQuestions} questions correctly.
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
                  className="font-semibold"
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
        <div className="flex items-center gap-2 p-3 rounded-xl bg-[#141210] border border-[#332A1F] text-xs text-[#FDE047]">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{validationWarning}</span>
        </div>
      )}

      {/* Questions list */}
      <div className="space-y-5">
        {questions.map((q, qIdx) => {
          const selectedOption = answers[q.id];
          const isCorrect = selectedOption === q.correctAnswerIndex;

          return (
            <div
              key={q.id}
              className={`p-5 rounded-2xl border transition-all ${
                submitted
                  ? isCorrect
                    ? 'bg-[#121212] border-[#1F3325]'
                    : 'bg-[#121212] border-[#331F1F]'
                  : 'bg-[#121212] border-[#1F1F1F]'
              }`}
            >
              {/* Question title */}
              <div className="flex items-start gap-3 mb-4">
                <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-[#181818] text-[#737373] border border-[#252525]">
                  Q{qIdx + 1}
                </span>
                <p className="text-sm md:text-base font-medium text-[#F5F5F5] flex-1 leading-snug">
                  {q.question}
                </p>

                {submitted && (
                  <div>
                    {isCorrect ? (
                      <span className="inline-flex items-center gap-1 text-xs text-[#86EFAC] font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-[#FCA5A5] font-medium">
                        <XCircle className="w-3.5 h-3.5" /> Incorrect
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Options */}
              <div className="space-y-2">
                {q.options.map((option, optIdx) => {
                  const isThisSelected = selectedOption === optIdx;
                  const isThisCorrect = optIdx === q.correctAnswerIndex;

                  let optionStyle =
                    'border-[#252525] bg-[#0A0A0A] hover:bg-[#141414] text-[#A3A3A3]';

                  if (submitted) {
                    if (isThisCorrect) {
                      optionStyle =
                        'border-[#1F3325] bg-[#101411] text-[#86EFAC] font-medium';
                    } else if (isThisSelected && !isCorrect) {
                      optionStyle =
                        'border-[#331F1F] bg-[#141010] text-[#FCA5A5] line-through';
                    } else {
                      optionStyle = 'border-[#1A1A1A] bg-[#080808] text-[#525252]';
                    }
                  } else if (isThisSelected) {
                    optionStyle =
                      'border-[#444444] bg-[#1A1A1A] text-white';
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
                            ? 'bg-[#86EFAC] text-black'
                            : submitted && isThisSelected && !isCorrect
                            ? 'bg-[#FCA5A5] text-black'
                            : isThisSelected
                            ? 'bg-white text-black'
                            : 'bg-[#181818] text-[#737373]'
                        }`}
                      >
                        {optionLetters[optIdx] || optIdx + 1}
                      </span>
                      <span className="flex-1 leading-relaxed">{option}</span>

                      {submitted && isThisCorrect && (
                        <CheckCircle2 className="w-4 h-4 text-[#86EFAC] shrink-0" />
                      )}
                      {submitted && isThisSelected && !isCorrect && (
                        <XCircle className="w-4 h-4 text-[#FCA5A5] shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation Reveal */}
              {submitted && (
                <div className="mt-3.5 p-3 rounded-xl bg-[#080808] border border-[#1F1F1F] space-y-1 text-xs animate-fade-in">
                  <div className="font-medium text-[#A3A3A3] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                    <span>Explanation</span>
                  </div>
                  <p className="text-[#737373] leading-relaxed">{q.explanation}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Submit button at bottom */}
      {!submitted && (
        <div className="flex justify-end pt-2 border-t border-[#1F1F1F]">
          <Button
            variant="primary"
            size="md"
            onClick={handleSubmit}
            rightIcon={<ArrowRight className="w-4 h-4" />}
            className="font-semibold"
          >
            Submit Quiz ({answeredCount}/{totalQuestions} Answered)
          </Button>
        </div>
      )}
    </Card>
  );
};
