'use client';

import React from 'react';
import {
  Sparkles,
  Plus,
  BookOpen,
  Trash2,
  Cpu,
  Layers,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { StudySession } from '@/types/study';
import { calculateOverallMastery } from '@/lib/studyLogic';

export interface SidebarProps {
  sessions: StudySession[];
  activeSessionId?: string;
  isOpen: boolean;
  onClose: () => void;
  onNewSession: () => void;
  onSelectSession: (id: string) => void;
  onDeleteSession: (e: React.MouseEvent, id: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  sessions,
  activeSessionId,
  isOpen,
  onClose,
  onNewSession,
  onSelectSession,
  onDeleteSession,
}) => {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen w-72 bg-card border-r border-card-border flex flex-col justify-between transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Header */}
        <div className="p-4 border-b border-card-border/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-primary-600/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-white block">
                ReWise
              </span>
              <span className="text-[10px] text-slate-400 block -mt-1">
                Active Learning Engine
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="md:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* CTA: New Study Session */}
        <div className="p-4 border-b border-card-border/60">
          <Button
            variant="primary"
            size="md"
            onClick={() => {
              onNewSession();
              onClose();
            }}
            leftIcon={<Plus className="w-4 h-4" />}
            className="w-full text-xs shadow-md shadow-primary-600/25"
          >
            New Study Session
          </Button>
        </div>

        {/* Middle: Recent Sessions */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Recent Sessions</span>
            <span className="font-mono text-[10px]">{sessions.length}</span>
          </div>

          {sessions.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-500 space-y-1">
              <BookOpen className="w-6 h-6 mx-auto text-slate-600" />
              <p>No study sessions yet</p>
            </div>
          ) : (
            sessions.map((item) => {
              const isActive = item.id === activeSessionId;
              const mastery = calculateOverallMastery(item);

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelectSession(item.id);
                    onClose();
                  }}
                  className={`group px-3 py-2.5 rounded-xl text-xs flex items-center justify-between gap-2 cursor-pointer transition-all border ${
                    isActive
                      ? 'bg-indigo-950/50 border-indigo-500/60 text-white font-medium shadow-sm'
                      : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <p className="truncate text-xs">{item.title}</p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500">
                      <span className="capitalize">{item.difficulty}</span>
                      <span>•</span>
                      <span className="text-emerald-400 font-mono">{mastery}%</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => onDeleteSession(e, item.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 rounded transition-all"
                    title="Delete session"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Engine Status */}
        <div className="p-4 border-t border-card-border/80 space-y-3 bg-slate-950/40">
          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80 flex items-center gap-2.5 text-xs">
            <Cpu className="w-4 h-4 text-cyan-400 shrink-0" />
            <div className="min-w-0 flex-1">
              <span className="font-semibold text-slate-200 block text-[11px]">
                Gemini 2.5 Flash
              </span>
              <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Structured JSON Engine
              </span>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 text-center">
            Frontend Internship Assignment
          </div>
        </div>
      </aside>
    </>
  );
};
