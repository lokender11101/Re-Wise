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
  const answeredCount = questions.filter((q) => answers[q.id] !== undefined).length;

  const scoreResult = calculateQuizScore(questions, answers);
  const isAllAnswered = scoreResult.allAnswered;

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
    <Card className="space-y-6 animate-fade-in border-[#252525] bg-[#101010] p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1F1F1F] pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#181818] border border-[#252525] text-[#F5F5F5]">
            <HelpCircle className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-semibold tracking-wider text-[#737373] uppercase">
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
            <Badge variant={scoreResult.percentage >= 70 ? 'success' : 'neutral'} size="md">
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
      <div className="space-y-6">
        {questions.map((q, qIdx) => {
          const selectedOption = answers[q.id];
          const isCorrect = selectedOption === q.correctAnswerIndex;

          return (
            <div
              key={q.id}
              tabIndex={0}
              onKeyDown={(e) => {
                if (submitted) return;
                const num = parseInt(e.key, 10);
                if (!isNaN(num) && num >= 1 && num <= q.options.length) {
                  e.preventDefault();
                  e.stopPropagation();
                  onRecordAnswer?.(q.id, num - 1);
                }
              }}
              className={`p-5 md:p-6 rounded-2xl border transition-all focus:outline-none focus:ring-1 focus:ring-[#555555] ${
                submitted
                  ? isCorrect
                    ? 'bg-[#0E1410] border-[#1E3825]'
                    : 'bg-[#150F0F] border-[#3D1E1E]'
                  : 'bg-[#121212] border-[#222222]'
              }`}
            >
              {/* Question title */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-start gap-3 flex-1">
                  <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-[#181818] text-[#737373] border border-[#252525] shrink-0 mt-0.5">
                    Q{qIdx + 1}
                  </span>
                  <p className="text-sm md:text-base font-medium text-[#F5F5F5] leading-snug">
                    {q.question}
                  </p>
                </div>

                {submitted && (
                  <div className="shrink-0">
                    {isCorrect ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-[#14291B] text-[#4ADE80] border border-[#1F4028]">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-[#2A1414] text-[#F87171] border border-[#441C1C]">
                        <XCircle className="w-3.5 h-3.5" /> Incorrect
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

                  let optionContainerStyle =
                    'border-[#252525] bg-[#0A0A0A] hover:bg-[#141414] hover:border-[#383838] text-[#D4D4D4]';
                  let letterBadgeStyle = 'bg-[#181818] text-[#737373] border border-[#252525]';

                  if (submitted) {
                    if (isThisCorrect) {
                      // Correct answer: subtle dark green surface, clear green border, fully readable text
                      optionContainerStyle =
                        'border-[#1F4028] bg-[#0F1D13] text-[#E8F8ED] font-medium';
                      letterBadgeStyle = 'bg-[#22C55E] text-black font-semibold border-transparent';
                    } else if (isThisSelected && !isCorrect) {
                      // User's wrong selection: subtle dark red surface, clear red border, FULLY READABLE TEXT, NO STRIKETHROUGH
                      optionContainerStyle =
                        'border-[#4A1E1E] bg-[#1B0F0F] text-[#FCDADA] font-medium';
                      letterBadgeStyle = 'bg-[#EF4444] text-black font-semibold border-transparent';
                    } else {
                      // Other unselected options: muted, readable
                      optionContainerStyle = 'border-[#1C1C1C] bg-[#080808] text-[#666666] opacity-60';
                      letterBadgeStyle = 'bg-[#141414] text-[#555555] border border-[#222222]';
                    }
                  } else if (isThisSelected) {
                    optionContainerStyle =
                      'border-[#555555] bg-[#1A1A1A] text-white font-medium';
                    letterBadgeStyle = 'bg-white text-black font-semibold border-white';
                  }

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      disabled={submitted}
                      onClick={() => onRecordAnswer?.(q.id, optIdx)}
                      className={`w-full text-left p-3.5 md:p-4 rounded-xl border transition-all text-xs md:text-sm flex items-center justify-between gap-3 select-none ${optionContainerStyle}`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <span
                          className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-mono shrink-0 transition-colors ${letterBadgeStyle}`}
                        >
                          {optionLetters[optIdx] || optIdx + 1}
                        </span>
                        <span className="leading-relaxed break-words">{option}</span>
                      </div>

                      {/* Submitted status badges */}
                      {submitted && isThisCorrect && (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#142B1A] text-[#4ADE80] border border-[#1F4028] shrink-0">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Correct Answer</span>
                        </span>
                      )}

                      {submitted && isThisSelected && !isCorrect && (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#2E1414] text-[#F87171] border border-[#4A1E1E] shrink-0">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Your Choice (Incorrect)</span>
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation Reveal */}
              {submitted && (
                <div className="mt-4 p-4 rounded-xl bg-[#0A0A0A] border border-[#222222] space-y-1.5 text-xs animate-fade-in">
                  <div className="font-semibold text-[#D4D4D4] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                    <span>Explanation & Key Concept</span>
                  </div>
                  <p className="text-[#888888] leading-relaxed text-xs md:text-sm">{q.explanation}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Submit button at bottom */}
      {!submitted && (
        <div className="flex justify-end pt-3 border-t border-[#1F1F1F]">
          <Button
            variant="primary"
            size="md"
            onClick={handleSubmit}
            rightIcon={<ArrowRight className="w-4 h-4" />}
            className="font-semibold px-6"
          >
            Submit Quiz ({answeredCount}/{totalQuestions} Answered)
          </Button>
        </div>
      )}
    </Card>
  );
};
