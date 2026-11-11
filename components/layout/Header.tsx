'use client';

import React from 'react';
import { Sparkles, Menu, Plus, History } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export interface HeaderProps {
  onOpenSavedSessions: () => void;
  onNewSession: () => void;
  onToggleSidebar?: () => void;
  savedCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSavedSessions,
  onNewSession,
  onToggleSidebar,
  savedCount = 0,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full bg-background/80 backdrop-blur-md border-b border-card-border/80 px-4 md:px-8 py-3.5 flex items-center justify-between">
      {/* Left: Mobile hamburger & Logo */}
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-600 to-indigo-400 flex items-center justify-center text-white shadow-md shadow-primary-600/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base md:text-lg tracking-tight text-white">
                ReWise
              </span>
              <span className="hidden sm:inline-block text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary-950 text-primary-300 border border-primary-800/60">
                AI Active Learning
              </span>
            </div>
            <p className="hidden md:block text-[11px] text-slate-400 -mt-0.5">
              Study smarter. Remember longer.
            </p>
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2.5">
        <Button
          size="sm"
          variant="outline"
          onClick={onOpenSavedSessions}
          leftIcon={<History className="w-4 h-4 text-slate-400" />}
          className="text-xs"
        >
          <span>Sessions</span>
          {savedCount > 0 && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] font-mono font-bold text-slate-300 border border-slate-700">
              {savedCount}
            </span>
          )}
        </Button>

        <Button
          size="sm"
          variant="primary"
          onClick={onNewSession}
          leftIcon={<Plus className="w-4 h-4" />}
          className="text-xs hidden sm:inline-flex"
        >
          New Session
        </Button>
      </div>
    </header>
  );
};
