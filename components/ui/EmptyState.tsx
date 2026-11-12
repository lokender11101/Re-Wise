'use client';

import React from 'react';
import { BookOpen, Sparkles, CheckCircle2, RotateCw, Lightbulb, Play } from 'lucide-react';
import { Button } from './Button';

export interface EmptyStateProps {
  onSelectSampleTopic: (topic: string) => void;
  onLoadDemoSession: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  onSelectSampleTopic,
  onLoadDemoSession,
}) => {
  const sampleTopics = [
    {
      title: 'CPU Scheduling & Synchronization',
      desc: 'FCFS, Round Robin, convoy effect, and race conditions',
    },
    {
      title: 'React Fiber Architecture',
      desc: 'Virtual DOM, reconciliation, scheduling, and hooks internals',
    },
    {
      title: 'CAP Theorem & Distributed Consensus',
      desc: 'Consistency vs availability, partition tolerance, and Paxos/Raft',
    },
  ];

  return (
    <div className="py-10 px-4 max-w-3xl mx-auto text-center space-y-7 animate-fade-in">
      {/* Hero Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#141414] border border-[#252525] text-[#A3A3A3] text-xs font-medium">
        <Sparkles className="w-3.5 h-3.5 text-[#F5F5F5]" />
        <span>Active Recall & Pedagogical Retention</span>
      </div>

      {/* Main Title */}
      <div className="space-y-2.5">
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-[#F5F5F5]">
          Transform Notes into Interactive Knowledge
        </h2>
        <p className="text-[#A3A3A3] text-sm md:text-base max-w-xl mx-auto leading-relaxed">
          Paste lecture notes, textbook excerpts, or any topic above. ReWise generates
          structured summaries, flashcards, quizzes with explanations, and wrong-answer retests.
        </p>
      </div>

      {/* Value pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left pt-1">
        <div className="p-4 rounded-xl bg-[#101010] border border-[#252525] space-y-2">
          <div className="p-2 w-fit rounded-lg bg-[#181818] border border-[#252525] text-[#F5F5F5]">
            <BookOpen className="w-4 h-4" />
          </div>
          <h4 className="font-medium text-[#F5F5F5] text-sm">Flip Flashcards</h4>
          <p className="text-xs text-[#737373] leading-relaxed">
            Active recall with keyboard controls (Space to flip, arrows to navigate, mastery tagging).
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#101010] border border-[#252525] space-y-2">
          <div className="p-2 w-fit rounded-lg bg-[#181818] border border-[#252525] text-[#F5F5F5]">
            <RotateCw className="w-4 h-4" />
          </div>
          <h4 className="font-medium text-[#F5F5F5] text-sm">Wrong-Answer Retest</h4>
          <p className="text-xs text-[#737373] leading-relaxed">
            Isolate and retry questions you missed until you achieve 100% mastery.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#101010] border border-[#252525] space-y-2">
          <div className="p-2 w-fit rounded-lg bg-[#181818] border border-[#252525] text-[#F5F5F5]">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <h4 className="font-medium text-[#F5F5F5] text-sm">Revision Checklists</h4>
          <p className="text-xs text-[#737373] leading-relaxed">
            Actionable learning milestones with persistent progress calculation.
          </p>
        </div>
      </div>

      {/* Sample Topics & Instant Demo */}
      <div className="pt-3 space-y-3.5">
        <div className="flex items-center justify-center gap-2 text-xs font-medium text-[#737373] uppercase tracking-wider">
          <Lightbulb className="w-3.5 h-3.5 text-[#A3A3A3]" />
          <span>Or test with a sample topic</span>
        </div>

        <div className="flex flex-wrap justify-center gap-2.5">
          {sampleTopics.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectSampleTopic(item.title)}
              className="text-left px-3.5 py-2.5 rounded-xl bg-[#101010] border border-[#252525] hover:border-[#444444] hover:bg-[#141414] transition-all text-xs text-[#A3A3A3] hover:text-[#F5F5F5] group"
            >
              <div className="font-medium text-[#F5F5F5] group-hover:text-white">
                {item.title}
              </div>
              <div className="text-[11px] text-[#737373] line-clamp-1">{item.desc}</div>
            </button>
          ))}
        </div>

        <div className="pt-1">
          <Button
            variant="secondary"
            size="sm"
            onClick={onLoadDemoSession}
            leftIcon={<Play className="w-3.5 h-3.5 text-[#F5F5F5]" />}
          >
            Instant Demo (Load Pre-generated Session)
          </Button>
        </div>
      </div>
    </div>
  );
};
