'use client';

import React, { useState } from 'react';
import { CornerDownLeft, Undo2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ReWiseMark } from '@/components/brand/ReWiseMark';

export interface RefineBarProps {
  onRefine: (instruction: string) => void;
  isLoading?: boolean;
  onUndo?: () => void;
  canUndo?: boolean;
  undoCount?: number;
}

export const RefineBar: React.FC<RefineBarProps> = ({
  onRefine,
  isLoading = false,
  onUndo,
  canUndo = false,
  undoCount = 0,
}) => {
  const [instruction, setInstruction] = useState('');

  const suggestedPrompts = [
    'Make quiz questions harder',
    'Add 4 more flashcards on edge cases',
    'Add a quantitative comparison chart',
    'Simplify summary with real-world analogies',
    'Generate scenario-based application questions',
    'Focus on concepts answered incorrectly',
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
    <div id="refine-block" className="p-6 sm:p-8 md:p-10 rounded-3xl bg-[#14110C] border border-[#282015] space-y-6 scroll-mt-24 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-2xl bg-[#201A12] border border-[#3A2D1B] flex items-center justify-center text-[#D8BD91]">
            <ReWiseMark size={20} animated={isLoading} isLoading={isLoading} />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#A68F68]">
              Iterative Adaptation
            </span>
            <h3 className="text-base sm:text-lg font-bold text-[#FAF5ED]">
              Adaptive Content Refinement Studio
            </h3>
            <p className="text-xs text-[#8A7960]">
              Evolve and tailor this study session with natural instructions while preserving your learning state
            </p>
          </div>
        </div>

        {canUndo && onUndo && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onUndo}
            disabled={isLoading}
            leftIcon={<Undo2 className="w-3.5 h-3.5 text-[#B8A68D]" />}
            className="shrink-0 text-xs text-[#FAF5ED] border-[#3D3025] hover:border-[#D8BD91] bg-[#201A12] hover:bg-[#2A2218]"
            title="Revert to pre-refinement snapshot"
          >
            Undo Refinement {undoCount > 0 ? `(${undoCount})` : ''}
          </Button>
        )}
      </div>

      {/* Suggested prompt chips */}
      <div className="space-y-2">
        <span className="text-[11px] text-[#8A7960] font-medium block">
          Quick Refinement Presets:
        </span>
        <div className="flex flex-wrap gap-2">
          {suggestedPrompts.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              disabled={isLoading}
              onClick={() => handleSelectChip(prompt)}
              className="text-xs px-3 py-1.5 rounded-xl bg-[#1C1710] border border-[#2D2316] text-[#B8A68D] hover:text-[#FAF5ED] hover:border-[#4D3C25] hover:bg-[#251E14] transition-colors disabled:opacity-40"
            >
              + {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Custom input bar */}
      <form onSubmit={handleSubmit} className="flex gap-2.5">
        <div className="relative flex-1">
          <input
            type="text"
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            disabled={isLoading}
            placeholder="Type a refinement instruction (e.g., 'Add questions testing priority inversion', 'Include edge cases on mutex deadlocks')..."
            className="w-full rounded-2xl bg-[#0C0A07] border border-[#2D2316] px-4 sm:px-5 py-3.5 text-xs sm:text-sm text-[#FAF5ED] placeholder-[#665540] focus:outline-none focus:border-[#D8BD91] focus:ring-1 focus:ring-[#D8BD91]/20 transition-all"
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          size="md"
          isLoading={isLoading}
          disabled={instruction.trim().length < 3 || isLoading}
          rightIcon={<CornerDownLeft className="w-3.5 h-3.5" />}
          className="shrink-0 font-semibold px-6 shadow-md"
        >
          Refine
        </Button>
      </form>
    </div>
  );
};
