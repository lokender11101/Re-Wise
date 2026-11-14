'use client';

import React, { useRef, useEffect } from 'react';
import {
  Compass,
  BookOpen,
  Layers,
  HelpCircle,
  CheckSquare,
  BarChart3,
  Brain,
  Sparkles,
} from 'lucide-react';
import type { StudySession } from '@/types/study';
import { THEME } from '@/lib/designTokens';

export interface CategoryNavStripProps {
  session: StudySession | null;
  activeSection: string;
  onNavigate: (sectionId: string) => void;
  isRetesting?: boolean;
}

export const CategoryNavStrip: React.FC<CategoryNavStripProps> = ({
  session,
  activeSection,
  onNavigate,
  isRetesting = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  if (!session) return null;

  // Dynamically determine available categories based on session blocks
  const categories = [
    {
      id: 'overview-block',
      label: 'Overview',
      icon: Compass,
      accent: '#E5E5E5',
      available: true,
    },
    {
      id: 'summary-block',
      label: 'Summary',
      icon: BookOpen,
      accent: THEME.sections.summary.accent,
      available: session.blocks.some((b) => b.type === 'summary'),
    },
    {
      id: 'flashcards-block',
      label: 'Flashcards',
      icon: Layers,
      accent: THEME.sections.flashcards.accent,
      available: session.blocks.some((b) => b.type === 'flashcards'),
    },
    {
      id: 'quiz-block',
      label: 'Quiz',
      icon: HelpCircle,
      accent: THEME.sections.quiz.accent,
      available: session.blocks.some((b) => b.type === 'quiz'),
    },
    {
      id: 'checklist-block',
      label: 'Checklist',
      icon: CheckSquare,
      accent: THEME.sections.checklist.accent,
      available: session.blocks.some((b) => b.type === 'checklist'),
    },
    {
      id: 'chart-block',
      label: 'Charts',
      icon: BarChart3,
      accent: THEME.sections.chart.accent,
      available: session.blocks.some((b) => b.type === 'chart'),
    },
    {
      id: 'intelligence-block',
      label: 'Insights',
      icon: Brain,
      accent: THEME.sections.analytics.accent,
      available: true,
    },
    {
      id: 'refine-block',
      label: 'Refine',
      icon: Sparkles,
      accent: THEME.sections.refine.accent,
      available: !isRetesting,
    },
  ].filter((c) => c.available);

  // Auto-scroll active item into view on mobile
  useEffect(() => {
    if (!containerRef.current) return;
    const activeBtn = containerRef.current.querySelector<HTMLButtonElement>(`[data-id="${activeSection}"]`);
    if (activeBtn) {
      activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [activeSection]);

  return (
    <div className="sticky top-[57px] z-20 w-full bg-[#050505]/95 backdrop-blur-md border-b border-[#1A1A1A] py-2 px-4 sm:px-6 md:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 min-w-0">
        {/* Horizontal Category Strip (Flipkart inspired icon-based category navigation) */}
        <div
          ref={containerRef}
          className="flex-1 min-w-0 flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar scroll-smooth py-0.5"
          role="tablist"
          aria-label="Study session learning categories"
        >
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeSection === cat.id;

            return (
              <button
                key={cat.id}
                data-id={cat.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => onNavigate(cat.id)}
                className={`group flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 select-none ${
                  isActive
                    ? 'bg-[#181818] text-[#F5F5F5] border shadow-sm'
                    : 'text-[#8A8A8A] hover:text-[#E5E5E5] hover:bg-[#121212] border border-transparent'
                }`}
                style={{
                  borderColor: isActive ? `${cat.accent}55` : 'transparent',
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full transition-transform duration-200"
                  style={{
                    backgroundColor: cat.accent,
                    transform: isActive ? 'scale(1.2)' : 'scale(1)',
                  }}
                />
                <Icon
                  className="w-3.5 h-3.5 transition-colors"
                  style={{ color: isActive ? cat.accent : undefined }}
                />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Session Indicator */}
        <div className="hidden lg:flex items-center gap-2 text-xs text-[#737373] shrink-0 font-mono">
          <span className="truncate max-w-[220px] text-[#A3A3A3] font-sans text-[11px]">
            {session.title}
          </span>
          <span>•</span>
          <span className="capitalize text-[#E5E5E5] text-[10px] px-2 py-0.5 rounded bg-[#141414] border border-[#222222]">
            {session.difficulty}
          </span>
        </div>
      </div>
    </div>
  );
};
