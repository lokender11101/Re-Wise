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
    <Card className="space-y-5 animate-fadeIn border-emerald-900/30">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-card-border/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold tracking-wider text-emerald-400 uppercase">
              Mastery Verification
            </span>
            <h3 className="text-lg md:text-xl font-bold text-slate-100">{block.title}</h3>
          </div>
        </div>

        {/* Counter */}
        <div className="text-xs text-slate-400">
          Completed:{' '}
          <strong className="text-emerald-400 font-mono text-sm">
            {stats.completedCount}
          </strong>{' '}
          / {stats.total} ({stats.percentage}%)
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
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
              className={`w-full text-left p-3.5 rounded-xl border transition-all text-xs md:text-sm flex items-start gap-3 select-none ${
                isChecked
                  ? 'bg-emerald-950/20 border-emerald-900/40 text-slate-400'
                  : 'bg-slate-900/40 border-card-border/80 hover:border-slate-700 text-slate-200'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 border transition-colors ${
                  isChecked
                    ? 'bg-emerald-500 border-emerald-500 text-slate-950'
                    : 'border-slate-600 bg-slate-800/80 text-transparent'
                }`}
              >
                {isChecked ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Square className="w-3 h-3" />}
              </div>

              <span
                className={`flex-1 leading-relaxed transition-all ${
                  isChecked ? 'line-through text-slate-500' : 'text-slate-200 font-medium'
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
