'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  BookOpen,
  Trash2,
  Cpu,
  Calendar,
  CheckCircle2,
  Target,
  Edit2,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import type { StudySession } from '@/types/study';
import { calculateOverallMastery } from '@/lib/studyLogic';
import { renameSession } from '@/lib/storage';

export interface SessionHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: StudySession[];
  activeSessionId?: string;
  onSelectSession: (id: string) => void;
  onDeleteSession: (e: React.MouseEvent, id: string) => void;
  onNewSession: () => void;
  onSessionRenamed?: () => void;
}

export const SessionHistoryDrawer: React.FC<SessionHistoryDrawerProps> = ({
  isOpen,
  onClose,
  sessions,
  activeSessionId,
  onSelectSession,
  onDeleteSession,
  onNewSession,
  onSessionRenamed,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  // Accessible Escape key handler to close drawer
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleStartRename = (e: React.MouseEvent, session: StudySession) => {
    e.stopPropagation();
    setEditingId(session.id);
    setEditingTitle(session.title);
  };

  const handleSaveRename = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (editingTitle.trim()) {
      renameSession(id, editingTitle.trim());
      onSessionRenamed?.();
    }
    setEditingId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-fade-in" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over panel */}
      <aside className="relative w-full max-w-md h-full bg-[#0A0A0A] border-l border-[#202020] shadow-2xl flex flex-col justify-between z-10">
        {/* Drawer Header */}
        <div className="p-5 border-b border-[#1F1F1F] flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#A3A3A3]" />
              <h3 className="text-sm font-semibold text-[#F5F5F5]">Study Session Library</h3>
            </div>
            <p className="text-[11px] text-[#737373]">
              {sessions.length} saved learning session{sessions.length === 1 ? '' : 's'}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#737373] hover:text-[#F5F5F5] rounded-lg hover:bg-[#151515] transition-colors"
            aria-label="Close session history"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* CTA: New Study Session */}
        <div className="p-4 border-b border-[#1A1A1A] bg-[#0E0E0E]">
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              onNewSession();
              onClose();
            }}
            leftIcon={<Plus className="w-4 h-4" />}
            className="w-full font-semibold py-2.5 text-xs justify-center"
          >
            Create New Study Session
          </Button>
        </div>

        {/* Session List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {sessions.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="p-3 w-fit mx-auto rounded-2xl bg-[#141414] border border-[#222222] text-[#555555]">
                <BookOpen className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-[#A3A3A3]">No saved sessions yet</p>
                <p className="text-xs text-[#666666] max-w-xs mx-auto">
                  Transform any notes or lecture topic to generate an interactive active recall session.
                </p>
              </div>
            </div>
          ) : (
            sessions.map((item) => {
              const isActive = item.id === activeSessionId;
              const mastery = calculateOverallMastery(item);
              const formattedDate = new Date(item.updatedAt || item.createdAt).toLocaleDateString(
                undefined,
                { month: 'short', day: 'numeric', year: 'numeric' }
              );

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelectSession(item.id);
                    onClose();
                  }}
                  className={`group p-3.5 rounded-xl border transition-all cursor-pointer space-y-2 ${
                    isActive
                      ? 'bg-[#151515] border-[#383838] shadow-md'
                      : 'bg-[#0E0E0E] border-[#1C1C1C] hover:border-[#2C2C2C] hover:bg-[#131313]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    {editingId === item.id ? (
                      <div className="flex items-center gap-1.5 flex-1 min-w-0" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSaveRename(e as unknown as React.MouseEvent, item.id)}
                          className="w-full text-xs bg-[#050505] border border-[#383838] rounded-lg px-2 py-1 text-white focus:outline-none"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={(e) => handleSaveRename(e, item.id)}
                          className="p-1 text-white bg-[#222222] rounded hover:bg-[#333333]"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-xs text-[#F5F5F5] truncate leading-snug">
                            {item.title}
                          </p>
                          {isActive && (
                            <span className="shrink-0 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-emerald-950" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-[#737373]">
                          <span className="capitalize">{item.difficulty}</span>
                          <span>•</span>
                          <span>{item.blocks.length} blocks</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-2.5 h-2.5" />
                            {formattedDate}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => handleStartRename(e, item)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-[#737373] hover:text-[#E5E5E5] rounded transition-all"
                        title="Rename session"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => onDeleteSession(e, item.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-[#737373] hover:text-[#FCA5A5] rounded transition-all"
                        title="Delete session"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1 pt-1 border-t border-[#181818]">
                    <div className="flex items-center justify-between text-[10px] text-[#737373]">
                      <span className="flex items-center gap-1">
                        <Target className="w-2.5 h-2.5 text-[#A7D8B5]" />
                        Mastery
                      </span>
                      <span className="font-mono text-[#D4D4D4] font-medium">{mastery}%</span>
                    </div>
                    <div className="h-1 w-full bg-[#1A1A1A] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#A7D8B5] transition-all duration-300 rounded-full"
                        style={{ width: `${mastery}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Drawer Bottom Status */}
        <div className="p-4 border-t border-[#1F1F1F] bg-[#070707] space-y-2">
          <div className="p-2.5 rounded-xl bg-[#0F0F0F] border border-[#1C1C1C] flex items-center gap-2.5 text-xs">
            <Cpu className="w-3.5 h-3.5 text-[#888888] shrink-0" />
            <div className="min-w-0 flex-1">
              <span className="font-medium text-[#F5F5F5] block text-[11px]">
                DeepSeek Flash V3
              </span>
              <span className="text-[10px] text-[#737373] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Structured JSON Engine • Active
              </span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};
