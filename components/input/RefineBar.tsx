'use client';

import React, { useState } from 'react';
import { Sparkles, ArrowRight, CornerDownLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export interface RefineBarProps {
  onRefine: (instruction: string) => void;
  isLoading?: boolean;
}

export const RefineBar: React.FC<RefineBarProps> = ({ onRefine, isLoading = false }) => {
  const [instruction, setInstruction] = useState('');

  const suggestedPrompts = [
    'Make the quiz questions more challenging',
    'Add 4 more flashcards on edge cases',
    'Simplify the summary with real-world analogies',
    'Add application-based scenario questions',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = instruction.trim();
    if (trimmed.length < 3) return;
    onRefine(trimmed);
    setInstruction('');
  };

  const handleSelectChip = (chip: string) => {
    onRefine(chip);
  };

  return (
    <div className="p-5 md:p-6 rounded-2xl bg-card border border-indigo-900/40 shadow-xl space-y-4">
      <div className="flex items-center gap-2">
        <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm md:text-base font-bold text-slate-100">
            AI Content Refinement Loop
          </h3>
          <p className="text-xs text-slate-400">
            Iterate and adapt this session with follow-up instructions without starting over
          </p>
        </div>
      </div>

      {/* Suggested chips */}
      <div className="flex flex-wrap gap-2 pt-1">
        {suggestedPrompts.map((prompt, idx) => (
          <button
            key={idx}
            type="button"
            disabled={isLoading}
            onClick={() => handleSelectChip(prompt)}
            className="text-[11px] px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-indigo-500/50 hover:bg-slate-850 transition-colors disabled:opacity-50"
          >
            + {prompt}
          </button>
        ))}
      </div>

      {/* Custom input bar */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            disabled={isLoading}
            placeholder="Type a refinement instruction (e.g., 'Add questions testing priority inversion')..."
            className="w-full rounded-xl bg-slate-950 border border-slate-700/80 px-4 py-2.5 text-xs md:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          size="sm"
          isLoading={isLoading}
          disabled={instruction.trim().length < 3 || isLoading}
          rightIcon={<CornerDownLeft className="w-3.5 h-3.5" />}
          className="bg-indigo-600 hover:bg-indigo-500 shrink-0"
        >
          Refine
        </Button>
      </form>
    </div>
  );
};
