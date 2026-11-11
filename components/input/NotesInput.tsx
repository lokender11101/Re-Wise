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
      className="p-5 md:p-6 rounded-2xl bg-card border border-card-border shadow-xl space-y-5"
    >
      {/* Top row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary-500/10 text-primary-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">Study Material & Topic</h3>
            <p className="text-xs text-slate-400">Paste lecture notes, articles, or a topic name</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleFillSample}
          className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-950/40 border border-primary-900/60 hover:bg-primary-900/40 transition-colors"
        >
          <Flame className="w-3.5 h-3.5 text-amber-400" />
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
          className="w-full rounded-xl bg-slate-950/70 border border-slate-700/80 p-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all resize-y leading-relaxed"
          maxLength={25000}
        />
        <div className="flex justify-between items-center px-1 text-[11px] text-slate-500 pt-1">
          <span>{notes.length} / 25,000 characters</span>
          {notes.length > 0 && (
            <button
              type="button"
              onClick={() => setNotes('')}
              className="hover:text-slate-300 transition-colors"
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
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
            <SlidersHorizontal className="w-3 h-3 text-slate-400" />
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
                      ? 'bg-primary-600/90 border-primary-500 text-white shadow-sm shadow-primary-600/30'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
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
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Learning Blocks
            </label>
            <button
              type="button"
              onClick={selectAllTypes}
              className="text-[11px] text-primary-400 hover:text-primary-300 underline underline-offset-2"
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
                      ? 'bg-slate-800 border-indigo-500 text-slate-100 shadow-sm'
                      : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
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
        <p className="text-xs text-rose-400 bg-rose-950/30 border border-rose-900/50 p-2.5 rounded-lg">
          {validationError}
        </p>
      )}

      {/* Submit Action */}
      <div className="flex justify-end pt-2 border-t border-card-border/60">
        <Button
          type="submit"
          size="lg"
          variant="primary"
          isLoading={isLoading}
          rightIcon={<ArrowRight className="w-4 h-4" />}
          className="w-full sm:w-auto"
        >
          Generate Active Learning Experience
        </Button>
      </div>
    </form>
  );
};
