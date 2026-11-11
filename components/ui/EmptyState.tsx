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
    <div className="py-12 px-4 max-w-3xl mx-auto text-center space-y-8 animate-fadeIn">
      {/* Hero Badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-950/60 border border-primary-800/50 text-primary-300 text-xs font-medium">
        <Sparkles className="w-3.5 h-3.5 text-primary-400" />
        <span>Active Recall & Pedagogical Retention</span>
      </div>

      {/* Main Title */}
      <div className="space-y-3">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-100">
          Transform Notes into Interactive Knowledge
        </h2>
        <p className="text-slate-400 text-base md:text-lg max-w-xl mx-auto leading-relaxed">
          Paste lecture notes, textbook excerpts, or any topic above. ReWise generates
          structured summaries, 3D flashcards, quizzes with instant explanations, and wrong-answer retests.
        </p>
      </div>

      {/* Value pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left pt-2">
        <div className="p-4 rounded-xl bg-card border border-card-border/80 space-y-2">
          <div className="p-2 w-fit rounded-lg bg-indigo-500/10 text-indigo-400">
            <BookOpen className="w-4 h-4" />
          </div>
          <h4 className="font-semibold text-slate-200 text-sm">3D Flip Flashcards</h4>
          <p className="text-xs text-slate-400">
            Active recall with keyboard controls (Space to flip, arrows to navigate, mastery tagging).
          </p>
        </div>

        <div className="p-4 rounded-xl bg-card border border-card-border/80 space-y-2">
          <div className="p-2 w-fit rounded-lg bg-emerald-500/10 text-emerald-400">
            <RotateCw className="w-4 h-4" />
          </div>
          <h4 className="font-semibold text-slate-200 text-sm">Wrong-Answer Retest</h4>
          <p className="text-xs text-slate-400">
            Isolate and retry questions you missed until you achieve 100% mastery.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-card border border-card-border/80 space-y-2">
          <div className="p-2 w-fit rounded-lg bg-cyan-500/10 text-cyan-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <h4 className="font-semibold text-slate-200 text-sm">Revision Checklists</h4>
          <p className="text-xs text-slate-400">
            Actionable learning milestones with persistent progress calculation.
          </p>
        </div>
      </div>

      {/* Sample Topics & Instant Demo */}
      <div className="pt-4 space-y-4">
        <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
          <span>Or test with a sample topic</span>
        </div>

        <div className="flex flex-wrap justify-center gap-2.5">
          {sampleTopics.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectSampleTopic(item.title)}
              className="text-left px-3.5 py-2.5 rounded-xl bg-card border border-card-border hover:border-primary-500/60 hover:bg-slate-800/60 transition-all text-xs text-slate-300 hover:text-white group"
            >
              <div className="font-medium text-slate-200 group-hover:text-primary-300">
                {item.title}
              </div>
              <div className="text-[11px] text-slate-500 line-clamp-1">{item.desc}</div>
            </button>
          ))}
        </div>

        <div className="pt-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={onLoadDemoSession}
            leftIcon={<Play className="w-3.5 h-3.5 text-cyan-400" />}
          >
            Instant Demo (Load Pre-generated Session)
          </Button>
        </div>
      </div>
    </div>
  );
};
