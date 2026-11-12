'use client';

import React, { useState } from 'react';
import { Sparkles, CornerDownLeft } from 'lucide-react';
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
    <div className="p-6 md:p-8 rounded-2xl bg-[#101010] border border-[#252525] space-y-5">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-[#181818] border border-[#252525] text-[#F5F5F5]">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-[#F5F5F5]">
            AI Content Refinement Loop
          </h3>
          <p className="text-xs text-[#737373]">
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
            className="text-xs px-3 py-1.5 rounded-lg bg-[#141414] border border-[#252525] text-[#A3A3A3] hover:text-[#F5F5F5] hover:border-[#444444] hover:bg-[#181818] transition-colors disabled:opacity-40"
          >
            + {prompt}
          </button>
        ))}
      </div>

      {/* Custom input bar */}
      <form onSubmit={handleSubmit} className="flex gap-2.5">
        <div className="relative flex-1">
          <input
            type="text"
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            disabled={isLoading}
            placeholder="Type a refinement instruction (e.g., 'Add questions testing priority inversion')..."
            className="w-full rounded-xl bg-[#080808] border border-[#252525] px-4 py-3 text-xs md:text-sm text-[#F5F5F5] placeholder-[#525252] focus:outline-none focus:border-[#444444] focus:ring-1 focus:ring-[#444444] transition-all"
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          size="md"
          isLoading={isLoading}
          disabled={instruction.trim().length < 3 || isLoading}
          rightIcon={<CornerDownLeft className="w-3.5 h-3.5" />}
          className="shrink-0 font-semibold px-5"
        >
          Refine
        </Button>
      </form>
    </div>
  );
};
