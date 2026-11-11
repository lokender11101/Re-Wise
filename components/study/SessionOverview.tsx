'use client';

import React, { useState } from 'react';
import { Calendar, Download, Trash2, Plus, Edit2, Check } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import type { StudySession } from '@/types/study';
import { renameSession } from '@/lib/storage';

export interface SessionOverviewProps {
  session: StudySession;
  onNewSession: () => void;
  onDeleteSession: () => void;
  onSessionRenamed?: (updated: StudySession) => void;
}

export const SessionOverview: React.FC<SessionOverviewProps> = ({
  session,
  onNewSession,
  onDeleteSession,
  onSessionRenamed,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(session.title);

  const handleSaveTitle = () => {
    if (editedTitle.trim()) {
      const updated = renameSession(session.id, editedTitle.trim());
      if (updated && onSessionRenamed) {
        onSessionRenamed(updated);
      }
    }
    setIsEditingTitle(false);
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(session, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${session.title.replace(/[^a-zA-Z0-9]/g, '_')}_rewise.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const formattedDate = new Date(session.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="p-5 md:p-6 rounded-2xl bg-gradient-to-r from-card to-card-elevated border border-card-border/80 shadow-lg space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Title & Metadata */}
        <div className="space-y-2 flex-1 min-w-0">
          <div className="flex items-center gap-2.5">
            <Badge
              variant={
                session.difficulty === 'beginner'
                  ? 'success'
                  : session.difficulty === 'intermediate'
                  ? 'primary'
                  : 'danger'
              }
            >
              {session.difficulty}
            </Badge>

            <span className="flex items-center gap-1 text-xs text-slate-400">
              <Calendar className="w-3.5 h-3.5" />
              {formattedDate}
            </span>
          </div>

          {/* Editable Title */}
          {isEditingTitle ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle()}
                className="text-xl font-bold bg-slate-900 border border-primary-500 rounded-lg px-3 py-1 text-white focus:outline-none w-full max-w-lg"
                autoFocus
              />
              <button
                type="button"
                onClick={handleSaveTitle}
                className="p-1.5 rounded-lg bg-primary-600 text-white hover:bg-primary-500"
              >
                <Check className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 group">
              <h2 className="text-xl md:text-2xl font-bold text-slate-100 truncate">
                {session.title}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setEditedTitle(session.title);
                  setIsEditingTitle(true);
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate-400 hover:text-slate-200"
                title="Rename study session"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Button
            size="sm"
            variant="outline"
            onClick={handleExportJSON}
            leftIcon={<Download className="w-3.5 h-3.5" />}
            title="Export session data as JSON"
          >
            Export
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={onDeleteSession}
            leftIcon={<Trash2 className="w-3.5 h-3.5 text-rose-400" />}
            className="hover:border-rose-500/50 hover:bg-rose-950/20"
            title="Delete this study session"
          >
            Delete
          </Button>

          <Button
            size="sm"
            variant="primary"
            onClick={onNewSession}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            New Session
          </Button>
        </div>
      </div>
    </div>
  );
};
