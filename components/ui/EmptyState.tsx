'use client';

import React from 'react';
import { BookOpen, CheckCircle2, RotateCw, Lightbulb, Play } from 'lucide-react';
import { Button } from './Button';
import { ReWiseMark } from '@/components/brand/ReWiseMark';

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
    <div className="py-8 px-4 max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
      {/* 3D Brand Emblem & Hero Badge */}
      <div className="flex flex-col items-center justify-center gap-4">
        <div className="p-3.5 rounded-3xl bg-[#0F0F0F] border border-[#252525] shadow-2xl">
          <ReWiseMark size={64} glow interactive animated />
        </div>
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#141414] border border-[#252525] text-[#A3A3A3] text-xs font-medium">
          <span>Active Recall & Pedagogical Retention</span>
        </div>
      </div>

      {/* Main Title */}
      <div className="space-y-3">
        <h2 className="text-2xl md:text-4xl font-bold tracking-tight text-[#F5F5F5]">
          Transform Notes into Interactive Knowledge
        </h2>
        <p className="text-[#A3A3A3] text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
          Paste lecture notes, textbook excerpts, or any topic above. ReWise generates
          structured summaries, flashcards, quizzes with explanations, and wrong-answer retests.
        </p>
      </div>

      {/* Value pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left pt-2">
        <div className="p-5 rounded-2xl bg-[#101010] border border-[#252525] space-y-3">
          <div className="p-2.5 w-fit rounded-xl bg-[#181818] border border-[#252525] text-[#F5F5F5]">
            <BookOpen className="w-4 h-4" />
          </div>
          <h4 className="font-semibold text-[#F5F5F5] text-sm md:text-base">Flip Flashcards</h4>
          <p className="text-xs text-[#737373] leading-relaxed">
            Active recall with keyboard controls (<kbd className="px-1 py-0.5 rounded bg-[#181818] text-[#A3A3A3]">Space</kbd> to flip, arrows to navigate, mastery tagging).
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#101010] border border-[#252525] space-y-3">
          <div className="p-2.5 w-fit rounded-xl bg-[#181818] border border-[#252525] text-[#F5F5F5]">
            <RotateCw className="w-4 h-4" />
          </div>
          <h4 className="font-semibold text-[#F5F5F5] text-sm md:text-base">Wrong-Answer Retest</h4>
          <p className="text-xs text-[#737373] leading-relaxed">
            Isolate and retry questions you missed with immediate option rationale until full concept mastery is achieved.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#101010] border border-[#252525] space-y-3">
          <div className="p-2.5 w-fit rounded-xl bg-[#181818] border border-[#252525] text-[#F5F5F5]">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <h4 className="font-semibold text-[#F5F5F5] text-sm md:text-base">Revision Checklists</h4>
          <p className="text-xs text-[#737373] leading-relaxed">
            Actionable learning milestones with persistent progress calculation and mastery score tracking.
          </p>
        </div>
      </div>

      {/* Sample Topics & Instant Demo */}
      <div className="pt-4 space-y-4">
        <div className="flex items-center justify-center gap-2 text-xs font-semibold text-[#737373] uppercase tracking-wider">
          <Lightbulb className="w-3.5 h-3.5 text-[#A3A3A3]" />
          <span>Or test with a sample topic</span>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          {sampleTopics.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectSampleTopic(item.title)}
              className="text-left px-4 py-3 rounded-xl bg-[#101010] border border-[#252525] hover:border-[#444444] hover:bg-[#141414] transition-all text-xs text-[#A3A3A3] hover:text-[#F5F5F5] group max-w-xs"
            >
              <div className="font-semibold text-[#F5F5F5] group-hover:text-white mb-0.5">
                {item.title}
              </div>
              <div className="text-[11px] text-[#737373] line-clamp-1">{item.desc}</div>
            </button>
          ))}
        </div>

        <div className="pt-2">
          <Button
            variant="secondary"
            size="md"
            onClick={onLoadDemoSession}
            leftIcon={<Play className="w-3.5 h-3.5 text-[#F5F5F5]" />}
            className="font-medium px-5"
          >
            Instant Demo (Load Pre-generated Session)
          </Button>
        </div>
      </div>
    </div>
  );
};
