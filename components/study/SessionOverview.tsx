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
    <div className="p-6 md:p-8 rounded-2xl bg-[#101010] border border-[#252525] space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Title & Metadata */}
        <div className="space-y-2 flex-1 min-w-0">
          <div className="flex items-center gap-2.5">
            <Badge variant="neutral" size="sm">
              {session.difficulty}
            </Badge>

            <span className="flex items-center gap-1.5 text-xs text-[#737373]">
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
                className="text-lg md:text-2xl font-bold tracking-tight bg-[#0A0A0A] border border-[#444444] rounded-xl px-3.5 py-1.5 text-white focus:outline-none w-full max-w-lg"
                autoFocus
              />
              <button
                type="button"
                onClick={handleSaveTitle}
                className="p-2 rounded-xl bg-white text-black hover:bg-[#E5E5E5] transition-colors"
              >
                <Check className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 group">
              <h2 className="text-xl md:text-2xl font-bold tracking-tight text-[#F5F5F5] truncate">
                {session.title}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setEditedTitle(session.title);
                  setIsEditingTitle(true);
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-[#181818] text-[#737373] hover:text-[#F5F5F5]"
                title="Rename study session"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Button
            size="sm"
            variant="outline"
            onClick={handleExportJSON}
            leftIcon={<Download className="w-3.5 h-3.5" />}
            title="Export session data as JSON"
          >
            Export JSON
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={onDeleteSession}
            leftIcon={<Trash2 className="w-3.5 h-3.5 text-[#737373]" />}
            className="hover:border-[#331F1F] hover:bg-[#141010] hover:text-[#FCA5A5]"
            title="Delete this study session"
          >
            Delete
          </Button>

          <Button
            size="sm"
            variant="primary"
            onClick={onNewSession}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            className="font-semibold"
          >
            New Session
          </Button>
        </div>
      </div>
    </div>
  );
};
