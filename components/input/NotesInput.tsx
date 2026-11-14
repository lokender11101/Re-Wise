'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Layers,
  HelpCircle,
  CheckSquare,
  BookOpen,
  ArrowRight,
  Flame,
  BarChart3,
  Check,
  AlertCircle,
  GraduationCap,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ReWiseMark } from '@/components/brand/ReWiseMark';
import type { DifficultyLevel, ContentBlockType } from '@/types/study';
import { SAMPLE_STUDY_MATERIAL } from '@/lib/mockData';
import { THEME } from '@/lib/designTokens';

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
    'chart',
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

  const handleFillSample = () => {
    setNotes(SAMPLE_STUDY_MATERIAL);
    setDifficulty('intermediate');
    setSelectedTypes(['summary', 'flashcards', 'quiz', 'checklist', 'chart']);
    setValidationError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = notes.trim();

    if (trimmed.length < 3) {
      setValidationError('Please enter at least a few words, a topic, or paste your lecture notes.');
      return;
    }

    if (selectedTypes.length === 0) {
      setValidationError('Please select at least one learning format to generate.');
      return;
    }

    setValidationError(null);
    onGenerate({
      notes: trimmed,
      difficulty,
      selectedTypes,
    });
  };

  // Learning Format Cards with custom accent tokens
  const formatCards: {
    id: ContentBlockType;
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
    accent: string;
    surface: string;
    border: string;
  }[] = [
    {
      id: 'summary',
      label: 'Core Summary',
      description: 'Typeset editorial synthesis & key takeaways',
      icon: BookOpen,
      accent: THEME.sections.summary.accent,
      surface: THEME.sections.summary.surface,
      border: THEME.sections.summary.border,
    },
    {
      id: 'flashcards',
      label: '3D Flashcards',
      icon: Layers,
      description: 'Active recall cards with realistic 3D perspective',
      accent: THEME.sections.flashcards.accent,
      surface: THEME.sections.flashcards.surface,
      border: THEME.sections.flashcards.border,
    },
    {
      id: 'quiz',
      label: 'Adaptive Quiz',
      icon: HelpCircle,
      description: 'Multiple-choice test with immediate feedback & retesting',
      accent: THEME.sections.quiz.accent,
      surface: THEME.sections.quiz.surface,
      border: THEME.sections.quiz.border,
    },
    {
      id: 'checklist',
      label: 'Checklist',
      icon: CheckSquare,
      description: 'Progress-tracked revision & verification milestones',
      accent: THEME.sections.checklist.accent,
      surface: THEME.sections.checklist.surface,
      border: THEME.sections.checklist.border,
    },
    {
      id: 'chart',
      label: 'Quantitative Chart',
      icon: BarChart3,
      description: 'Benchmark comparisons & metric breakdowns',
      accent: THEME.sections.chart.accent,
      surface: THEME.sections.chart.surface,
      border: THEME.sections.chart.border,
    },
  ];

  // Difficulty tier cards
  const difficultyTiers: {
    id: DifficultyLevel;
    label: string;
    subtitle: string;
  }[] = [
    {
      id: 'beginner',
      label: 'Beginner',
      subtitle: 'Foundational concepts & straightforward definitions',
    },
    {
      id: 'intermediate',
      label: 'Intermediate',
      subtitle: 'Applied scenarios, trade-offs & synthesis',
    },
    {
      id: 'advanced',
      label: 'Advanced',
      subtitle: 'Edge cases, architectural depth & rigorous reasoning',
    },
  ];

  return (
    <form
      id="study-input-form"
      onSubmit={handleSubmit}
      className="p-6 sm:p-8 md:p-10 rounded-3xl bg-[#0B0B0B] border border-[#222222] shadow-2xl space-y-8"
    >
      {/* SECTION 1: Study Material Input */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#141414] border border-[#282828] text-white">
              <ReWiseMark size={20} interactive animated />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-[#F5F5F5]">
                1. Study Material & Lecture Notes
              </h2>
              <p className="text-xs text-[#737373]">
                Paste your notes, textbook passages, or enter a topic to transform
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleFillSample}
            className="self-start sm:self-auto text-xs text-[#A3A3A3] hover:text-[#F5F5F5] flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#141414] border border-[#262626] hover:bg-[#1A1A1A] hover:border-[#383838] transition-colors"
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Load OS Scheduling Sample</span>
          </button>
        </div>

        {/* Expansive Input Surface */}
        <div className="relative">
          <textarea
            rows={7}
            value={notes}
            onChange={(e) => {
              setNotes(e.target.value);
              if (validationError) setValidationError(null);
            }}
            placeholder="Paste study material, lecture notes, textbook excerpts, or enter any subject (e.g., 'Operating Systems: CPU Scheduling & Mutex Locks', 'React Fiber Reconciliation', 'Distributed Consensus & Raft')..."
            className="w-full rounded-2xl bg-[#050505] border border-[#222222] p-4 sm:p-5 text-sm md:text-base text-[#F5F5F5] placeholder-[#555555] focus:outline-none focus:border-[#444444] focus:ring-1 focus:ring-[#444444] transition-all resize-y leading-relaxed"
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

      {/* SECTION 2: Difficulty Configuration */}
      <div className="space-y-3 pt-6 border-t border-[#1C1C1C]">
        <div className="space-y-0.5">
          <h3 className="text-sm font-semibold text-[#F5F5F5]">2. Target Cognitive Difficulty</h3>
          <p className="text-xs text-[#737373]">Select the depth and rigor for questions, summaries and flashcards</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {difficultyTiers.map((tier) => {
            const isSelected = difficulty === tier.id;
            return (
              <button
                key={tier.id}
                type="button"
                onClick={() => setDifficulty(tier.id)}
                className={`text-left p-3.5 rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-[#181818] border-white/60 text-white shadow-md'
                    : 'bg-[#0E0E0E] border-[#1E1E1E] hover:border-[#2E2E2E] hover:bg-[#121212] text-[#888888]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-semibold ${isSelected ? 'text-white' : 'text-[#D4D4D4]'}`}>
                    {tier.label}
                  </span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isSelected ? 'bg-white' : 'bg-transparent border border-neutral-700'
                    }`}
                  />
                </div>
                <p className="text-[11px] text-[#737373] leading-relaxed line-clamp-2">
                  {tier.subtitle}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: Learning Format Selector (Flipkart-inspired segmented category tiles) */}
      <div className="space-y-3 pt-6 border-t border-[#1C1C1C]">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="text-sm font-semibold text-[#F5F5F5]">3. Learning Block Formats</h3>
            <p className="text-xs text-[#737373]">Select which interactive structures to synthesize</p>
          </div>
          <button
            type="button"
            onClick={() => setSelectedTypes(['summary', 'flashcards', 'quiz', 'checklist', 'chart'])}
            className="text-[11px] text-[#A3A3A3] hover:text-white underline underline-offset-4"
          >
            Select All
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {formatCards.map((format) => {
            const isSelected = selectedTypes.includes(format.id);
            const Icon = format.icon;

            return (
              <button
                key={format.id}
                type="button"
                onClick={() => toggleType(format.id)}
                className={`text-left p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between gap-3 ${
                  isSelected
                    ? 'shadow-md'
                    : 'bg-[#0C0C0C] border-[#1C1C1C] hover:border-[#2C2C2C] hover:bg-[#101010] opacity-60'
                }`}
                style={{
                  backgroundColor: isSelected ? format.surface : undefined,
                  borderColor: isSelected ? `${format.accent}55` : undefined,
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div
                    className="p-2 rounded-xl flex items-center justify-center shrink-0 border"
                    style={{
                      backgroundColor: `${format.accent}15`,
                      borderColor: `${format.accent}30`,
                      color: format.accent,
                    }}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div
                    className={`w-4 h-4 rounded-md flex items-center justify-center border transition-colors ${
                      isSelected ? 'bg-white text-black border-white' : 'border-neutral-700 bg-transparent'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-[#F5F5F5]">{format.label}</h4>
                  <p className="text-[11px] text-[#737373] mt-0.5 leading-snug">{format.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Validation Warning */}
      {validationError && (
        <div className="p-3.5 rounded-xl bg-[#1C0E0E] border border-[#3E1C1C] flex items-center gap-2 text-xs text-[#FCA5A5] animate-fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 text-[#FCA5A5]" />
          <span>{validationError}</span>
        </div>
      )}

      {/* SECTION 4: Primary Generate Action */}
      <div className="pt-6 border-t border-[#1C1C1C] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-[#737373] hidden sm:block">
          DeepSeek V3 Structured Reasoning • Instant Active Recall Assembly
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isLoading}
          disabled={isLoading}
          rightIcon={<ArrowRight className="w-4 h-4" />}
          className="w-full sm:w-auto font-semibold px-8 py-3.5 text-sm shadow-xl"
        >
          Create Learning Experience
        </Button>
      </div>
    </form>
  );
};
