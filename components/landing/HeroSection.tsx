'use client';

import React from 'react';
import { ArrowRight, Play, Sparkles, Layers, BookOpen, Target } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Hero3DComposition } from './Hero3DComposition';

export interface HeroSectionProps {
  onLoadDemo: () => void;
  onScrollToInput: () => void;
  onSelectSampleTopic: (topic: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onLoadDemo,
  onScrollToInput,
  onSelectSampleTopic,
}) => {
  return (
    <section className="relative pt-6 pb-12 sm:pt-10 sm:pb-16 overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Column: Editorial Headline & Actions (Apple / Zomato inspired) */}
        <div className="lg:col-span-7 space-y-6 text-left">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#101010] border border-[#252525] shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-medium text-[#A3A3A3]">
              AI-Powered Active Learning Platform
            </span>
          </div>

          {/* Main Headline */}
          <div className="space-y-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-bold tracking-tight text-[#F5F5F5] leading-[1.12]">
              Turn your notes into{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#E5E5E5] to-[#888888]">
                knowledge that lasts.
              </span>
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-[#A3A3A3] max-w-xl leading-relaxed font-normal">
              Your personal AI learning workspace. Transform study material into structured
              summaries, interactive flashcards, intelligent quizzes and guided revision.
            </p>
          </div>

          {/* Primary CTA Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button
              size="lg"
              variant="primary"
              onClick={onScrollToInput}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="font-semibold px-6 shadow-lg"
            >
              Start Study Session
            </Button>

            <Button
              size="lg"
              variant="secondary"
              onClick={onLoadDemo}
              leftIcon={<Play className="w-4 h-4 text-[#E5E5E5]" />}
              className="font-medium px-5 border-[#2A2A2A] bg-[#121212] hover:bg-[#1A1A1A]"
            >
              Explore Instant Demo
            </Button>
          </div>

          {/* Quick Value Metrics & Sample Pills */}
          <div className="pt-4 border-t border-[#1C1C1C] flex flex-wrap items-center gap-3 text-xs text-[#737373]">
            <span className="text-[#888888] font-medium">Popular Topics:</span>
            {[
              'CPU Scheduling & Mutex',
              'React Fiber Internals',
              'Distributed Consensus (Raft)',
            ].map((topic, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectSampleTopic(topic)}
                className="px-2.5 py-1 rounded-lg bg-[#0F0F0F] border border-[#222222] hover:border-[#383838] hover:text-[#E5E5E5] hover:bg-[#161616] text-[#A3A3A3] transition-colors"
              >
                + {topic}
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Bespoke 3D Educational Visual Composition */}
        <div className="lg:col-span-5 flex justify-center lg:justify-end">
          <Hero3DComposition />
        </div>
      </div>
    </section>
  );
};
