'use client';

import React, { useState } from 'react';
import { Calendar, Download, Trash2, Plus, Edit2, Check, Sparkles, Layers } from 'lucide-react';
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
    <div
      id="overview-block"
      className="p-6 sm:p-8 rounded-3xl bg-[#0D0D0D] border border-[#222222] space-y-6 scroll-mt-24 shadow-xl"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Title & Metadata */}
        <div className="space-y-3 flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#141414] border border-[#262626] text-[11px] text-[#A3A3A3]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Active Study Session</span>
            </span>

            <span className="px-2.5 py-1 rounded-full bg-[#141414] border border-[#262626] text-[11px] font-medium text-[#E5E5E5] capitalize">
              {session.difficulty} Level
            </span>

            <span className="flex items-center gap-1.5 text-xs text-[#737373]">
              <Calendar className="w-3.5 h-3.5 text-[#555555]" />
              {formattedDate}
            </span>

            <span className="text-xs text-[#555555]">•</span>

            <span className="text-xs text-[#737373]">
              {session.blocks.length} Generated Blocks
            </span>
          </div>

          {/* Editable Title */}
          {isEditingTitle ? (
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle()}
                className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight bg-[#050505] border border-[#444444] rounded-xl px-4 py-2 text-white focus:outline-none w-full max-w-2xl"
                autoFocus
              />
              <button
                type="button"
                onClick={handleSaveTitle}
                className="p-2.5 rounded-xl bg-white text-black hover:bg-[#E5E5E5] transition-colors"
                title="Save title"
              >
                <Check className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 group pt-1">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[#F5F5F5] truncate leading-tight">
                {session.title}
              </h1>
              <button
                type="button"
                onClick={() => {
                  setEditedTitle(session.title);
                  setIsEditingTitle(true);
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-[#1A1A1A] text-[#737373] hover:text-[#F5F5F5]"
                title="Rename study session"
              >
                <Edit2 className="w-4 h-4" />
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
            className="text-xs border-[#262626] bg-[#121212] hover:bg-[#1A1A1A] hover:border-[#383838]"
            title="Export session data as JSON"
          >
            Export JSON
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={onDeleteSession}
            leftIcon={<Trash2 className="w-3.5 h-3.5 text-[#737373]" />}
            className="text-xs border-[#262626] bg-[#121212] hover:border-[#3E1C1C] hover:bg-[#1A0E0E] hover:text-[#FCA5A5]"
            title="Delete this study session"
          >
            Delete
          </Button>

          <Button
            size="sm"
            variant="primary"
            onClick={onNewSession}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            className="text-xs font-semibold px-4"
          >
            New Session
          </Button>
        </div>
      </div>
    </div>
  );
};
