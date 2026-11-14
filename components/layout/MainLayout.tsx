'use client';

import React, { useState, useEffect } from 'react';
import { Header } from './Header';
import { CategoryNavStrip } from './CategoryNavStrip';
import { SessionHistoryDrawer } from './SessionHistoryDrawer';
import { getSavedSessions, deleteSession } from '@/lib/storage';
import type { StudySession } from '@/types/study';

export interface MainLayoutProps {
  children: React.ReactNode;
  activeSessionId?: string;
  session?: StudySession | null;
  activeSection?: string;
  onNavigate?: (sectionId: string) => void;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  sessionTrigger?: number;
  isRetesting?: boolean;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  activeSessionId,
  session = null,
  activeSection = 'overview-block',
  onNavigate,
  onSelectSession,
  onNewSession,
  sessionTrigger = 0,
  isRetesting = false,
}) => {
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);
  const [sessions, setSessions] = useState<StudySession[]>([]);

  useEffect(() => {
    setSessions(getSavedSessions());
  }, [sessionTrigger, activeSessionId]);

  const handleDeleteSession = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteSession(id);
    setSessions((prev) => prev.filter((s) => s.id !== id));
  };

  const handleNavigateToInsights = () => {
    if (onNavigate) {
      onNavigate('intelligence-block');
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#F5F5F5] flex flex-col font-sans selection:bg-[#333333] selection:text-white overflow-x-hidden">
      {/* Global Top Header (Swiggy / Apple commercial website style) */}
      <Header
        onOpenSavedSessions={() => setIsHistoryDrawerOpen(true)}
        onNewSession={onNewSession}
        onNavigateToInsights={handleNavigateToInsights}
        onToggleSidebar={() => setIsHistoryDrawerOpen((prev) => !prev)}
        savedCount={sessions.length}
        hasActiveSession={!!session}
      />

      {/* Horizontal Category Navigation Strip (Flipkart icon-based strip, active when session exists) */}
      {session && onNavigate && (
        <CategoryNavStrip
          session={session}
          activeSection={activeSection}
          onNavigate={onNavigate}
          isRetesting={isRetesting}
        />
      )}

      {/* Main Spacious Content Canvas */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-8">
        {children}
      </main>

      {/* Slide-out Session History Drawer */}
      <SessionHistoryDrawer
        isOpen={isHistoryDrawerOpen}
        onClose={() => setIsHistoryDrawerOpen(false)}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={onSelectSession}
        onDeleteSession={handleDeleteSession}
        onNewSession={onNewSession}
        onSessionRenamed={() => setSessions(getSavedSessions())}
      />
    </div>
  );
};
