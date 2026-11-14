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
    <Card id="checklist-block" className="space-y-6 animate-fade-in border-[#18262A] bg-[#0E1517] p-6 sm:p-8 md:p-10 rounded-3xl scroll-mt-24 shadow-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#18262A] pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#172529] border border-[#22393F] text-[#A5C7CC]">
            <CheckSquare className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-semibold tracking-wider text-[#7A9EA3] uppercase">
              Mastery Verification
            </span>
            <h3 className="text-base md:text-lg font-semibold text-[#F0F7F7]">{block.title}</h3>
          </div>
        </div>

        {/* Counter */}
        <div className="text-xs text-[#7A9EA3]">
          Completed:{' '}
          <strong className="text-[#F0F7F7] font-mono text-sm font-semibold">
            {stats.completedCount}
          </strong>{' '}
          / {stats.total} ({stats.percentage}%)
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="h-1.5 w-full bg-[#0B1112] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#A5C7CC] transition-all duration-300 rounded-full"
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
                  ? 'bg-[#0C1214] border-[#1D2A2E]'
                  : 'bg-[#101718] border-[#1A2629] hover:border-[#273B40] hover:bg-[#141C1E]'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 mt-0.5 border transition-colors ${
                  isChecked
                    ? 'bg-[#A5C7CC] border-[#A5C7CC] text-[#0B1112]'
                    : 'border-[#273B40] bg-[#172529] text-transparent'
                }`}
              >
                {isChecked ? <Check className="w-3 h-3 stroke-[3]" /> : <Square className="w-2.5 h-2.5" />}
              </div>

              <span
                className={`flex-1 leading-relaxed transition-all ${
                  isChecked ? 'text-[#D4E2E4] font-normal' : 'text-[#F0F7F7] font-normal'
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
