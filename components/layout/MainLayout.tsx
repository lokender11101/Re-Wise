'use client';

import React, { useState, useEffect } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { SavedSessionsModal } from '@/components/history/SavedSessionsModal';
import { getSavedSessions, deleteSession } from '@/lib/storage';
import type { StudySession } from '@/types/study';

export interface MainLayoutProps {
  children: React.ReactNode;
  activeSessionId?: string;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  sessionTrigger?: number; // Counter to re-sync sessions when updated
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  activeSessionId,
  onSelectSession,
  onNewSession,
  sessionTrigger = 0,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSavedModalOpen, setIsSavedModalOpen] = useState(false);
  const [sessions, setSessions] = useState<StudySession[]>([]);

  useEffect(() => {
    setSessions(getSavedSessions());
  }, [sessionTrigger, activeSessionId]);

  const handleDeleteSession = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteSession(id);
    setSessions((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#F5F5F5] flex flex-col md:flex-row font-sans selection:bg-[#333333] selection:text-white">
      {/* Sidebar for Desktop & Mobile drawer */}
      <Sidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onNewSession={onNewSession}
        onSelectSession={onSelectSession}
        onDeleteSession={handleDeleteSession}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onOpenSavedSessions={() => setIsSavedModalOpen(true)}
          onNewSession={onNewSession}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          savedCount={sessions.length}
        />

        <main className="flex-1 px-4 sm:px-6 md:px-8 py-6 max-w-5xl mx-auto w-full">
          {children}
        </main>
      </div>

      {/* Saved Sessions Modal */}
      <SavedSessionsModal
        isOpen={isSavedModalOpen}
        activeSessionId={activeSessionId}
        onClose={() => setIsSavedModalOpen(false)}
        onSelectSession={onSelectSession}
      />
    </div>
  );
};
