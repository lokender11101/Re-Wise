'use client';

import React from 'react';
import { CheckSquare, Check, Square } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import type { ChecklistBlock as ChecklistBlockType } from '@/types/study';
import { calculateChecklistStats } from '@/lib/studyLogic';

export interface ChecklistBlockProps {
  block: ChecklistBlockType;
  progressMap?: { [itemId: string]: boolean };
  onToggleItem?: (itemId: string) => void;
}

export const ChecklistBlock: React.FC<ChecklistBlockProps> = ({
  block,
  progressMap = {},
  onToggleItem,
}) => {
  const items = block.items;
  const stats = calculateChecklistStats(items, progressMap);

  return (
    <Card className="space-y-6 animate-fade-in border-[#252525] bg-[#101010] p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1F1F1F] pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#181818] border border-[#252525] text-[#F5F5F5]">
            <CheckSquare className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-semibold tracking-wider text-[#737373] uppercase">
              Mastery Verification
            </span>
            <h3 className="text-base md:text-lg font-semibold text-[#F5F5F5]">{block.title}</h3>
          </div>
        </div>

        {/* Counter */}
        <div className="text-xs text-[#737373]">
          Completed:{' '}
          <strong className="text-[#F5F5F5] font-mono text-sm font-semibold">
            {stats.completedCount}
          </strong>{' '}
          / {stats.total} ({stats.percentage}%)
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="h-1.5 w-full bg-[#181818] rounded-full overflow-hidden">
          <div
            className="h-full bg-white transition-all duration-300 rounded-full"
            style={{ width: `${stats.percentage}%` }}
          />
        </div>
      </div>

      {/* Checklist items */}
      <div className="space-y-2.5">
        {items.map((item) => {
          const isChecked = progressMap[item.id] === true;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onToggleItem?.(item.id)}
              className={`w-full text-left p-4 rounded-xl border transition-all text-xs md:text-sm flex items-start gap-3.5 select-none ${
                isChecked
                  ? 'bg-[#0B0B0B] border-[#1C1C1C] text-[#555555]'
                  : 'bg-[#121212] border-[#222222] hover:border-[#383838] hover:bg-[#151515] text-[#F5F5F5]'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 mt-0.5 border transition-colors ${
                  isChecked
                    ? 'bg-white border-white text-black'
                    : 'border-[#333333] bg-[#181818] text-transparent'
                }`}
              >
                {isChecked ? <Check className="w-3 h-3 stroke-[3]" /> : <Square className="w-2.5 h-2.5" />}
              </div>

              <span
                className={`flex-1 leading-relaxed transition-all ${
                  isChecked ? 'line-through text-[#666666]' : 'text-[#E5E5E5] font-normal'
                }`}
              >
                {item.text}
              </span>
            </button>
          );
        })}
      </div>
    </Card>
  );
};
