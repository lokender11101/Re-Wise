'use client';

import React from 'react';
import {
  Plus,
  BookOpen,
  Trash2,
  Cpu,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ReWiseLogo } from '@/components/brand/ReWiseLogo';
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
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen w-64 bg-[#101010] border-r border-[#1F1F1F] flex flex-col justify-between transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Header — ReWise Signature 3D Brand */}
        <div className="p-4 border-b border-[#1F1F1F] flex items-center justify-between">
          <ReWiseLogo
            variant="compact"
            size="sm"
            subtitle="Active Learning Engine"
            onClick={onNewSession}
          />

          <button
            type="button"
            onClick={onClose}
            className="md:hidden p-1.5 text-[#737373] hover:text-[#F5F5F5] rounded-lg hover:bg-[#141414] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* CTA: New Study Session */}
        <div className="p-3 border-b border-[#1F1F1F]">
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              onNewSession();
              onClose();
            }}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            className="w-full text-xs font-semibold py-2"
          >
            New Session
          </Button>
        </div>

        {/* Middle: Recent Sessions */}
        <div className="flex-1 overflow-y-auto p-2.5 space-y-1">
          <div className="px-2 py-1.5 text-[10px] font-medium text-[#737373] uppercase tracking-wider flex items-center justify-between">
            <span>Recent Sessions</span>
            <span className="font-mono text-[10px] text-[#525252]">{sessions.length}</span>
          </div>

          {sessions.length === 0 ? (
            <div className="p-4 text-center text-xs text-[#525252] space-y-1">
              <BookOpen className="w-5 h-5 mx-auto text-[#333333]" />
              <p>No saved sessions</p>
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
                  className={`group px-3 py-2 rounded-xl text-xs flex items-center justify-between gap-2 cursor-pointer transition-all border ${
                    isActive
                      ? 'bg-[#181818] border-[#333333] text-white font-medium'
                      : 'border-transparent text-[#A3A3A3] hover:text-[#F5F5F5] hover:bg-[#121212]'
                  }`}
                >
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <p className="truncate text-xs">{item.title}</p>
                    <div className="flex items-center gap-2 text-[10px] text-[#737373]">
                      <span className="capitalize">{item.difficulty}</span>
                      <span>•</span>
                      <span className="font-mono text-[#A3A3A3]">{mastery}%</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => onDeleteSession(e, item.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-[#737373] hover:text-[#FCA5A5] rounded transition-all"
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
        <div className="p-3 border-t border-[#1F1F1F] space-y-2 bg-[#0C0C0C]">
          <div className="p-2 rounded-xl bg-[#151515] border border-[#1F1F1F] flex items-center gap-2.5 text-xs">
            <Cpu className="w-3.5 h-3.5 text-[#A3A3A3] shrink-0" />
            <div className="min-w-0 flex-1">
              <span className="font-medium text-[#F5F5F5] block text-[11px]">
                DeepSeek Flash
              </span>
              <span className="text-[10px] text-[#737373] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
                Structured JSON Engine
              </span>
            </div>
          </div>

          <div className="text-[10px] text-[#525252] text-center">
            ReWise • Active Learning
          </div>
        </div>
      </aside>
    </>
  );
};
