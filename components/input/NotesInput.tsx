'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Layers,
  HelpCircle,
  CheckSquare,
  BookOpen,
  ArrowRight,
  SlidersHorizontal,
  Flame,
  BarChart3,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { DifficultyLevel, ContentBlockType } from '@/types/study';
import { SAMPLE_STUDY_MATERIAL } from '@/lib/mockData';

export interface NotesInputProps {
  onGenerate: (payload: {
    notes: string;
    difficulty: DifficultyLevel;
    selectedTypes: ContentBlockType[];
  }) => void;
  isLoading?: boolean;
}

export const NotesInput: React.FC<NotesInputProps> = ({ onGenerate, isLoading = false }) => {
  const [notes, setNotes] = useState('');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('intermediate');
  const [selectedTypes, setSelectedTypes] = useState<ContentBlockType[]>([
    'summary',
    'flashcards',
    'quiz',
    'checklist',
  ]);
  const [validationError, setValidationError] = useState<string | null>(null);

  const toggleType = (type: ContentBlockType) => {
    setSelectedTypes((prev) => {
      if (prev.includes(type)) {
        if (prev.length === 1) return prev; // Keep at least one selected
        return prev.filter((t) => t !== type);
      } else {
        return [...prev, type];
      }
    });
  };

  const selectAllTypes = () => {
    setSelectedTypes(['summary', 'flashcards', 'quiz', 'checklist', 'chart']);
  };

  const handleFillSample = () => {
    setNotes(SAMPLE_STUDY_MATERIAL);
    setDifficulty('intermediate');
    selectAllTypes();
    setValidationError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = notes.trim();

    if (trimmed.length < 3) {
      setValidationError('Please enter at least a few words, a topic, or paste lecture notes.');
      return;
    }

    if (selectedTypes.length === 0) {
      setValidationError('Please select at least one learning block type to generate.');
      return;
    }

    setValidationError(null);
    onGenerate({
      notes: trimmed,
      difficulty,
      selectedTypes,
    });
  };

  const blockTypeOptions: { id: ContentBlockType; label: string; icon: React.ReactNode }[] = [
    { id: 'summary', label: 'Summary', icon: <BookOpen className="w-3.5 h-3.5" /> },
    { id: 'flashcards', label: 'Flashcards', icon: <Layers className="w-3.5 h-3.5" /> },
    { id: 'quiz', label: 'Quiz', icon: <HelpCircle className="w-3.5 h-3.5" /> },
    { id: 'checklist', label: 'Checklist', icon: <CheckSquare className="w-3.5 h-3.5" /> },
    { id: 'chart', label: 'Chart', icon: <BarChart3 className="w-3.5 h-3.5" /> },
  ];

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 md:p-8 rounded-2xl bg-[#101010] border border-[#252525] space-y-6 shadow-xl"
    >
      {/* Top Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#181818] border border-[#252525] text-[#F5F5F5]">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base md:text-lg font-semibold text-[#F5F5F5]">
              Study Material & Lecture Notes
            </h3>
            <p className="text-xs text-[#737373]">
              Paste study material, lecture notes, or enter any topic to transform
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleFillSample}
          className="text-xs text-[#A3A3A3] hover:text-[#F5F5F5] flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#141414] border border-[#252525] hover:bg-[#181818] hover:border-[#383838] transition-colors"
        >
          <Flame className="w-3.5 h-3.5 text-[#F5F5F5]" />
          <span>Load OS Scheduling Sample</span>
        </button>
      </div>

      {/* Main Textarea */}
      <div className="space-y-1.5">
        <div className="relative">
          <textarea
            rows={6}
            value={notes}
            onChange={(e) => {
              setNotes(e.target.value);
              if (validationError) setValidationError(null);
            }}
            placeholder="Paste lecture notes, textbook passages, or enter a topic (e.g. 'Operating Systems: CPU Scheduling & Mutex Locks', 'Cellular Respiration & Krebs Cycle')..."
            className="w-full rounded-xl bg-[#070707] border border-[#252525] p-4 md:p-5 text-sm text-[#F5F5F5] placeholder-[#525252] focus:outline-none focus:border-[#444444] focus:ring-1 focus:ring-[#444444] transition-all resize-y leading-relaxed font-normal"
            maxLength={25000}
          />
        </div>
        <div className="flex justify-between items-center px-1 text-[11px] text-[#737373]">
          <span>{notes.length.toLocaleString()} / 25,000 characters</span>
          {notes.length > 0 && (
            <button
              type="button"
              onClick={() => setNotes('')}
              className="hover:text-[#F5F5F5] transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-[#1C1C1C] pt-1" />

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Difficulty Level Selector */}
        <div className="space-y-2.5">
          <label className="text-xs font-semibold text-[#737373] flex items-center gap-1.5 uppercase tracking-wider">
            <SlidersHorizontal className="w-3 h-3 text-[#737373]" />
            <span>Target Difficulty</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['beginner', 'intermediate', 'advanced'] as DifficultyLevel[]).map((level) => {
              const isSelected = difficulty === level;
              return (
                <button
                  key={level}
                  type="button"
                  onClick={() => setDifficulty(level)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-medium capitalize border transition-all text-center ${
                    isSelected
                      ? 'bg-white border-white text-black font-semibold'
                      : 'bg-[#141414] border-[#252525] text-[#737373] hover:text-[#A3A3A3] hover:border-[#383838]'
                  }`}
                >
                  {level}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Block Selection */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-[#737373] uppercase tracking-wider">
              Learning Blocks
            </label>
            <button
              type="button"
              onClick={selectAllTypes}
              className="text-[11px] text-[#A3A3A3] hover:text-white underline underline-offset-2"
            >
              Select All
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {blockTypeOptions.map((opt) => {
              const isSelected = selectedTypes.includes(opt.id);
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => toggleType(opt.id)}
                  className={`py-2.5 px-2.5 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 transition-all ${
                    isSelected
                      ? 'bg-[#202020] border-[#444444] text-white font-semibold'
                      : 'bg-[#141414] border-[#252525] text-[#737373] hover:text-[#A3A3A3]'
                  }`}
                >
                  {opt.icon}
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Validation alert */}
      {validationError && (
        <p className="text-xs text-[#F87171] bg-[#1E0F0F] border border-[#441C1C] p-3 rounded-xl">
          {validationError}
        </p>
      )}

      {/* Submit Action */}
      <div className="flex justify-end pt-3 border-t border-[#1F1F1F]">
        <Button
          type="submit"
          size="lg"
          variant="primary"
          isLoading={isLoading}
          rightIcon={<ArrowRight className="w-4 h-4" />}
          className="w-full sm:w-auto font-semibold px-6"
        >
          Transform into Study Blocks
        </Button>
      </div>
    </form>
  );
};
