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
    <Card id="summary-block" className="space-y-6 animate-fade-in border-[#2C241B] bg-[#191713] p-6 md:p-8 scroll-mt-20">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 border-b border-[#2C241B] pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#252018] border border-[#3D3224] text-[#D9C69D]">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-semibold tracking-wider text-[#A6977D] uppercase">
              Core Concept Summary
            </span>
            <h3 className="text-base md:text-lg font-semibold text-[#F5F1E8]">{block.title}</h3>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#C2B59D] hover:text-[#F5F1E8] bg-[#201D17] hover:bg-[#28241D] rounded-lg border border-[#352D21] hover:border-[#4D402E] transition-colors"
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
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Main Content */}
      <div className="text-[#DCD5C8] text-sm md:text-base leading-relaxed whitespace-pre-line font-normal space-y-3">
        {block.content}
      </div>

      {/* Key Takeaways */}
      {block.keyPoints && block.keyPoints.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-[#2C241B]">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[#A6977D]">
            Key Takeaways
          </h4>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {block.keyPoints.map((point, idx) => (
              <li
                key={idx}
                className="flex items-start gap-3 p-3.5 rounded-xl bg-[#13110E] border border-[#241E16] text-xs md:text-sm text-[#DCD5C8] leading-relaxed"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-[#D9C69D] mt-2 shrink-0" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
};
