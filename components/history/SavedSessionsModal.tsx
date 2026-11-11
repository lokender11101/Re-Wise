'use client';

import React, { useState, useEffect } from 'react';
import { X, BookOpen, Trash2, Calendar, ArrowRight, Layers } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { getSavedSessions, deleteSession } from '@/lib/storage';
import { calculateOverallMastery } from '@/lib/studyLogic';
import type { StudySession } from '@/types/study';

export interface SavedSessionsModalProps {
  isOpen: boolean;
  activeSessionId?: string;
  onClose: () => void;
  onSelectSession: (sessionId: string) => void;
}

export const SavedSessionsModal: React.FC<SavedSessionsModalProps> = ({
  isOpen,
  activeSessionId,
  onClose,
  onSelectSession,
}) => {
  const [sessions, setSessions] = useState<StudySession[]>([]);

  useEffect(() => {
    if (isOpen) {
      setSessions(getSavedSessions());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteSession(id);
    setSessions((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-card-elevated border border-card-border rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-card-border/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base md:text-lg font-bold text-slate-100">
                Saved Study Sessions
              </h3>
              <p className="text-xs text-slate-400">
                {sessions.length} session{sessions.length !== 1 ? 's' : ''} stored locally in browser
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sessions list */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1">
          {sessions.length === 0 ? (
            <div className="text-center py-12 space-y-3 text-slate-400">
              <Layers className="w-8 h-8 mx-auto text-slate-600" />
              <p className="text-sm">No saved study sessions found yet.</p>
              <p className="text-xs text-slate-500">
                Generate your first study session to automatically persist it here.
              </p>
            </div>
          ) : (
            sessions.map((item) => {
              const isActive = item.id === activeSessionId;
              const mastery = calculateOverallMastery(item);
              const formattedDate = new Date(item.updatedAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelectSession(item.id);
                    onClose();
                  }}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-4 group ${
                    isActive
                      ? 'bg-indigo-950/40 border-indigo-500/80 shadow-md'
                      : 'bg-card border-card-border hover:border-slate-600 hover:bg-slate-850'
                  }`}
                >
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-slate-200 text-sm group-hover:text-primary-300 transition-colors truncate">
                        {item.title}
                      </h4>
                      {isActive && (
                        <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-indigo-500 text-white shrink-0">
                          Active
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                      <Badge size="sm" variant={item.difficulty === 'beginner' ? 'success' : item.difficulty === 'intermediate' ? 'primary' : 'danger'}>
                        {item.difficulty}
                      </Badge>
                      <span className="flex items-center gap-1 text-[11px]">
                        <Calendar className="w-3 h-3" /> {formattedDate}
                      </span>
                      <span className="text-emerald-400 font-mono text-[11px] font-semibold">
                        {mastery}% mastery
                      </span>
                    </div>
                  </div>

                  {/* Right actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => handleDelete(e, item.id)}
                      className="p-2 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-950/30 transition-colors"
                      title="Delete session"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="p-2 text-slate-400 group-hover:text-primary-400 transition-colors">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-card-border/80 flex justify-end bg-card">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
