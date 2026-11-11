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
    <Card className="space-y-5 animate-fadeIn border-indigo-900/30 bg-gradient-to-br from-card to-card-elevated">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 border-b border-card-border/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold tracking-wider text-indigo-400 uppercase">
              Core Concept Summary
            </span>
            <h3 className="text-lg md:text-xl font-bold text-slate-100">{block.title}</h3>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 bg-slate-800/80 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors"
          title="Copy summary to clipboard"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
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
      <div className="text-slate-300 text-sm md:text-base leading-relaxed whitespace-pre-line">
        {block.content}
      </div>

      {/* Key Takeaways */}
      {block.keyPoints && block.keyPoints.length > 0 && (
        <div className="space-y-3 pt-3 border-t border-card-border/60">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Key Takeaways
          </h4>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {block.keyPoints.map((point, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-900/50 border border-slate-800 text-xs md:text-sm text-slate-300"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 shrink-0" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
};
