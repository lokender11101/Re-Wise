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
    <div id="refine-block" className="p-6 md:p-8 rounded-2xl bg-[#191714] border border-[#2E241E] space-y-5 scroll-mt-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-xl bg-[#241F1A] border border-[#3D3025] flex items-center justify-center">
            <ReWiseMark size={20} animated={isLoading} isLoading={isLoading} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-[#F7F2EA]">
              AI Content Refinement Loop
            </h3>
            <p className="text-xs text-[#9E8B72]">
              Iterate and adapt this session with follow-up instructions without starting over
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
            className="shrink-0 text-xs text-[#F7F2EA] border-[#3D3025] hover:border-[#D8BD91] bg-[#241F1A] hover:bg-[#2D261F]"
            title="Revert to pre-refinement snapshot"
          >
            Undo Refinement {undoCount > 0 ? `(${undoCount})` : ''}
          </Button>
        )}
      </div>

      {/* Suggested chips */}
      <div className="flex flex-wrap gap-2 pt-1">
        {suggestedPrompts.map((prompt, idx) => (
          <button
            key={idx}
            type="button"
            disabled={isLoading}
            onClick={() => handleSelectChip(prompt)}
            className="text-xs px-3 py-1.5 rounded-lg bg-[#201B16] border border-[#33281E] text-[#B8A68D] hover:text-[#F7F2EA] hover:border-[#4D3C2D] hover:bg-[#28211A] transition-colors disabled:opacity-40"
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
            className="w-full rounded-xl bg-[#13100D] border border-[#33281E] px-4 py-3 text-xs md:text-sm text-[#F7F2EA] placeholder-[#6E5D4A] focus:outline-none focus:border-[#D8BD91] focus:ring-1 focus:ring-[#D8BD91]/20 transition-all"
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
