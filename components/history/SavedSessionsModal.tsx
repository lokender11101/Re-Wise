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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#101010] border border-[#252525] rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#1F1F1F]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#181818] border border-[#252525] text-[#F5F5F5]">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#F5F5F5]">
                Saved Study Sessions
              </h3>
              <p className="text-xs text-[#737373]">
                {sessions.length} session{sessions.length !== 1 ? 's' : ''} stored locally in browser
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#737373] hover:text-[#F5F5F5] rounded-lg hover:bg-[#181818] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sessions list */}
        <div className="p-5 overflow-y-auto space-y-2.5 flex-1">
          {sessions.length === 0 ? (
            <div className="text-center py-12 space-y-3 text-[#737373]">
              <Layers className="w-8 h-8 mx-auto text-[#333333]" />
              <p className="text-sm">No saved study sessions found yet.</p>
              <p className="text-xs text-[#525252]">
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
                      ? 'bg-[#181818] border-[#444444]'
                      : 'bg-[#121212] border-[#1F1F1F] hover:border-[#333333] hover:bg-[#161616]'
                  }`}
                >
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-[#F5F5F5] text-sm group-hover:text-white transition-colors truncate">
                        {item.title}
                      </h4>
                      {isActive && (
                        <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-white text-black shrink-0">
                          Active
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-[#737373]">
                      <Badge size="sm" variant="neutral">
                        {item.difficulty}
                      </Badge>
                      <span className="flex items-center gap-1 text-[11px]">
                        <Calendar className="w-3 h-3" /> {formattedDate}
                      </span>
                      <span className="text-[#A3A3A3] font-mono text-[11px] font-medium">
                        {mastery}% mastery
                      </span>
                    </div>
                  </div>

                  {/* Right actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => handleDelete(e, item.id)}
                      className="p-2 text-[#737373] hover:text-[#FCA5A5] rounded-lg hover:bg-[#1C1414] transition-colors"
                      title="Delete session"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <div className="p-1.5 text-[#525252] group-hover:text-white transition-colors">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#1F1F1F] flex justify-end bg-[#101010]">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
