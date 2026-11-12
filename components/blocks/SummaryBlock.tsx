'use client';

import React, { useState } from 'react';
import { BookOpen, Check, Copy } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import type { SummaryBlock as SummaryBlockType } from '@/types/study';

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
    <Card className="space-y-5 animate-fade-in border-[#252525] bg-[#101010]">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 border-b border-[#1F1F1F] pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#181818] border border-[#252525] text-[#F5F5F5]">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-medium tracking-wider text-[#737373] uppercase">
              Core Concept Summary
            </span>
            <h3 className="text-base md:text-lg font-semibold text-[#F5F5F5]">{block.title}</h3>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#A3A3A3] hover:text-[#F5F5F5] bg-[#141414] hover:bg-[#181818] rounded-lg border border-[#252525] hover:border-[#383838] transition-colors"
          title="Copy summary to clipboard"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-[#F5F5F5]" />
              <span className="text-[#F5F5F5]">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Main Content */}
      <div className="text-[#A3A3A3] text-sm md:text-base leading-relaxed whitespace-pre-line">
        {block.content}
      </div>

      {/* Key Takeaways */}
      {block.keyPoints && block.keyPoints.length > 0 && (
        <div className="space-y-3 pt-3 border-t border-[#1F1F1F]">
          <h4 className="text-xs font-medium uppercase tracking-wider text-[#737373]">
            Key Takeaways
          </h4>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {block.keyPoints.map((point, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2.5 p-3 rounded-xl bg-[#141414] border border-[#1F1F1F] text-xs md:text-sm text-[#D4D4D4]"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-[#737373] mt-2 shrink-0" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
};
