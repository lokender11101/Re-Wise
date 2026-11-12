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
    setSelectedTypes(['summary', 'flashcards', 'quiz', 'checklist']);
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
  ];

  return (
    <form
      onSubmit={handleSubmit}
      className="p-5 md:p-6 rounded-2xl bg-[#101010] border border-[#252525] space-y-5"
    >
      {/* Top row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-[#181818] border border-[#252525] text-[#F5F5F5]">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm md:text-base font-semibold text-[#F5F5F5]">Study Material & Topic</h3>
            <p className="text-xs text-[#737373]">Paste lecture notes, articles, or a topic name</p>
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
      <div className="relative">
        <textarea
          rows={5}
          value={notes}
          onChange={(e) => {
            setNotes(e.target.value);
            if (validationError) setValidationError(null);
          }}
          placeholder="Paste lecture notes, textbook passages, or enter a topic (e.g. 'Operating Systems: CPU Scheduling & Mutex Locks')..."
          className="w-full rounded-xl bg-[#080808] border border-[#252525] p-4 text-sm text-[#F5F5F5] placeholder-[#525252] focus:outline-none focus:border-[#444444] focus:ring-1 focus:ring-[#444444] transition-all resize-y leading-relaxed"
          maxLength={25000}
        />
        <div className="flex justify-between items-center px-1 text-[11px] text-[#737373] pt-1">
          <span>{notes.length} / 25,000 characters</span>
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

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
        {/* Difficulty Level Selector */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-[#737373] flex items-center gap-1.5 uppercase tracking-wider">
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
                  className={`py-2 px-3 rounded-xl text-xs font-medium capitalize border transition-all text-center ${
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
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-[#737373] uppercase tracking-wider">
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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {blockTypeOptions.map((opt) => {
              const isSelected = selectedTypes.includes(opt.id);
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => toggleType(opt.id)}
                  className={`py-2 px-2.5 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 transition-all ${
                    isSelected
                      ? 'bg-[#1E1E1E] border-[#444444] text-white font-medium'
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
        <p className="text-xs text-[#FCA5A5] bg-[#141010] border border-[#331F1F] p-2.5 rounded-lg">
          {validationError}
        </p>
      )}

      {/* Submit Action */}
      <div className="flex justify-end pt-2 border-t border-[#1F1F1F]">
        <Button
          type="submit"
          size="lg"
          variant="primary"
          isLoading={isLoading}
          rightIcon={<ArrowRight className="w-4 h-4" />}
          className="w-full sm:w-auto font-semibold"
        >
          Generate Active Learning Experience
        </Button>
      </div>
    </form>
  );
};
