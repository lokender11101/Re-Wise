'use client';

import React from 'react';
import {
  Layers,
  HelpCircle,
  Brain,
  CheckSquare,
  BarChart3,
  BookOpen,
  ArrowRight,
  RotateCw,
  Sparkles,
  TrendingUp,
  CheckCircle2,
} from 'lucide-react';
import { THEME } from '@/lib/designTokens';

export const FeatureShowcase: React.FC = () => {
  return (
    <section className="pt-12 sm:pt-16 pb-8 space-y-8 text-left">
      {/* Editorial Header */}
      <div className="space-y-2 max-w-2xl">
        <span className="text-[11px] font-mono uppercase tracking-widest text-[#737373]">
          Engineered for Retention
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F5F5F5]">
          A unified cognitive system for deep learning.
        </h2>
        <p className="text-sm text-[#A3A3A3] leading-relaxed">
          ReWise replaces passive re-reading with active recall, instant formative feedback,
          and concept diagnostics based on established cognitive science.
        </p>
      </div>

      {/* Asymmetric Editorial Grid (Apple Store / Zomato inspired) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Feature 1: Active Recall & 3D Flashcards (Large 7-col hero card) */}
        <div
          className="md:col-span-7 rounded-3xl p-6 sm:p-8 border flex flex-col justify-between gap-6 relative overflow-hidden"
          style={{
            backgroundColor: THEME.sections.flashcards.surface,
            borderColor: `${THEME.sections.flashcards.accent}33`,
          }}
        >
          <div className="space-y-3">
            <div
              className="w-fit p-2.5 rounded-2xl border"
              style={{
                backgroundColor: `${THEME.sections.flashcards.accent}15`,
                borderColor: `${THEME.sections.flashcards.accent}30`,
                color: THEME.sections.flashcards.accent,
              }}
            >
              <Layers className="w-5 h-5" />
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-[#F5F5F5]">
              Active Recall via 3D Flashcards
            </h3>
            <p className="text-xs sm:text-sm text-[#A3A3A3] leading-relaxed max-w-md">
              Engage the testing effect with perspective-tilted cards. Flip with Space, navigate with
              arrows, and tag cards as Mastered (1) or Needs Review (2) with zero mouse dependency.
            </p>
          </div>

          {/* Mini Interactive Preview Graphic */}
          <div className="p-4 rounded-2xl bg-[#09070A] border border-[#201524] flex items-center justify-between text-xs text-[#888888]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#C8ADD9]" />
              <span className="font-mono text-[11px] text-[#C8ADD9]">3D Card Flip</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-[#737373]">
              <kbd className="px-1.5 py-0.5 rounded bg-[#1A1A1A] border border-[#2A2A2A] text-[#A3A3A3]">Space</kbd> Flip
              <kbd className="px-1.5 py-0.5 rounded bg-[#1A1A1A] border border-[#2A2A2A] text-[#A3A3A3] ml-1">1</kbd> Master
            </div>
          </div>
        </div>

        {/* Feature 2: Intelligent Assessments (5-col card) */}
        <div
          className="md:col-span-5 rounded-3xl p-6 sm:p-8 border flex flex-col justify-between gap-6 relative overflow-hidden"
          style={{
            backgroundColor: THEME.sections.quiz.surface,
            borderColor: `${THEME.sections.quiz.accent}33`,
          }}
        >
          <div className="space-y-3">
            <div
              className="w-fit p-2.5 rounded-2xl border"
              style={{
                backgroundColor: `${THEME.sections.quiz.accent}15`,
                borderColor: `${THEME.sections.quiz.accent}30`,
                color: THEME.sections.quiz.accent,
              }}
            >
              <HelpCircle className="w-5 h-5" />
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-[#F5F5F5]">
              Intelligent Assessments
            </h3>
            <p className="text-xs sm:text-sm text-[#A3A3A3] leading-relaxed">
              Multiple-choice questions with full rationale. Isolate mistakes and run targeted
              wrong-answer retests without repeating questions you already mastered.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#0F0808] border border-[#281515] flex items-center gap-2.5 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-[#E0AAAA] font-medium text-[11px]">
              Wrong-Answer Retest Loop Enabled
            </span>
          </div>
        </div>

        {/* Feature 3: Adaptive Revision & Concept Intelligence (5-col card) */}
        <div
          className="md:col-span-5 rounded-3xl p-6 sm:p-8 border flex flex-col justify-between gap-6 relative overflow-hidden"
          style={{
            backgroundColor: THEME.sections.analytics.surface,
            borderColor: `${THEME.sections.analytics.accent}33`,
          }}
        >
          <div className="space-y-3">
            <div
              className="w-fit p-2.5 rounded-2xl border"
              style={{
                backgroundColor: `${THEME.sections.analytics.accent}15`,
                borderColor: `${THEME.sections.analytics.accent}30`,
                color: THEME.sections.analytics.accent,
              }}
            >
              <Brain className="w-5 h-5" />
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-[#F5F5F5]">
              Concept Retention Analytics
            </h3>
            <p className="text-xs sm:text-sm text-[#A3A3A3] leading-relaxed">
              Authentic diagnostic algorithms identify frequently missed concepts, compute attempt
              improvement deltas, and produce actionable pedagogical guidance.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#090A10] border border-[#1A1C2C] flex items-center justify-between text-xs font-mono">
            <span className="text-[#8B8FB8] text-[11px] flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-[#B7B9E2]" /> Diagnostic Metric
            </span>
            <span className="text-[#B7B9E2] font-semibold text-[11px]">Attempt Improvement Tracking</span>
          </div>
        </div>

        {/* Feature 4: Structured Synthesis (7-col card) */}
        <div
          className="md:col-span-7 rounded-3xl p-6 sm:p-8 border flex flex-col justify-between gap-6 relative overflow-hidden"
          style={{
            backgroundColor: THEME.sections.summary.surface,
            borderColor: `${THEME.sections.summary.accent}33`,
          }}
        >
          <div className="space-y-3">
            <div
              className="w-fit p-2.5 rounded-2xl border"
              style={{
                backgroundColor: `${THEME.sections.summary.accent}15`,
                borderColor: `${THEME.sections.summary.accent}30`,
                color: THEME.sections.summary.accent,
              }}
            >
              <BookOpen className="w-5 h-5" />
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-[#F5F5F5]">
              Structured Synthesis & Quantitative Charts
            </h3>
            <p className="text-xs sm:text-sm text-[#A3A3A3] leading-relaxed max-w-md">
              Typeset executive summaries with key takeaway extraction, actionable revision
              checklists, and comparative benchmark visualizations for complex data.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-[#0C0B08] border border-[#221B10] text-[#D9C69D] flex items-center gap-2">
              <CheckSquare className="w-3.5 h-3.5" />
              <span className="text-[11px]">Milestone Checklist</span>
            </div>
            <div className="p-3 rounded-xl bg-[#0C0B08] border border-[#221B10] text-[#A8CDBB] flex items-center gap-2">
              <BarChart3 className="w-3.5 h-3.5" />
              <span className="text-[11px]">Quantitative Charts</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
