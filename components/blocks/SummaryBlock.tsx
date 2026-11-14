'use client';

import React, { useState } from 'react';
import { BookOpen, Check, Copy, Sparkles } from 'lucide-react';
import type { SummaryBlock as SummaryBlockType } from '@/types/study';
import { THEME } from '@/lib/designTokens';

export interface SummaryBlockProps {
  block: SummaryBlockType;
}

export const SummaryBlock: React.FC<SummaryBlockProps> = ({ block }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const textToCopy = `${block.title}\n\n${block.content}\n\nKey Takeaways:\n${block.keyPoints.map((p) => `• ${p}`).join('\n')}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <article
      id="summary-block"
      className="p-6 sm:p-8 md:p-10 rounded-3xl border space-y-8 scroll-mt-24 shadow-xl"
      style={{
        backgroundColor: THEME.sections.summary.surface,
        borderColor: THEME.sections.summary.border,
      }}
    >
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#282218] pb-5">
        <div className="flex items-center gap-3.5">
          <div
            className="p-2.5 rounded-2xl border"
            style={{
              backgroundColor: `${THEME.sections.summary.accent}15`,
              borderColor: `${THEME.sections.summary.accent}30`,
              color: THEME.sections.summary.accent,
            }}
          >
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#A89775]">
              Executive Synthesis
            </span>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#FAF6ED]">
              {block.title}
            </h2>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#C2B59D] hover:text-[#FAF6ED] bg-[#1E1A14] hover:bg-[#282218] rounded-xl border border-[#352D21] hover:border-[#4D402E] transition-colors"
          title="Copy summary to clipboard"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-[#D9C69D]" />
              <span className="text-[#D9C69D] font-medium">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Synthesis</span>
            </>
          )}
        </button>
      </div>

      {/* Editorial Typeset Body with Comfortable Line Length */}
      <div className="max-w-4xl text-[#E2DDD3] text-sm sm:text-base leading-[1.8] whitespace-pre-line font-normal space-y-4">
        {block.content}
      </div>

      {/* Key Takeaways Collection */}
      {block.keyPoints && block.keyPoints.length > 0 && (
        <div className="space-y-4 pt-6 border-t border-[#282218]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#D9C69D]" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#A89775]">
              Core Cognitive Takeaways
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {block.keyPoints.map((point, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3.5 p-4 rounded-2xl bg-[#0F0D0A] border border-[#221B10] text-xs sm:text-sm text-[#E2DDD3] leading-relaxed"
              >
                <div className="w-2 h-2 rounded-full bg-[#D9C69D] mt-1.5 shrink-0 shadow-[0_0_8px_rgba(217,198,157,0.4)]" />
                <span>{point}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </article>
  );
};
