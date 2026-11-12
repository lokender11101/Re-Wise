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
    <header className="sticky top-0 z-30 w-full bg-[#050505]/90 backdrop-blur-md border-b border-[#1F1F1F] px-4 md:px-8 py-3.5 flex items-center justify-between">
      {/* Left: Mobile hamburger & Logo */}
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            className="md:hidden p-1.5 text-[#737373] hover:text-[#F5F5F5] rounded-lg hover:bg-[#141414] transition-colors"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}

        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#141414] border border-[#252525] flex items-center justify-center text-white">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm md:text-base tracking-tight text-[#F5F5F5]">
                ReWise
              </span>
              <span className="hidden sm:inline-block text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#141414] text-[#A3A3A3] border border-[#252525]">
                Active Learning
              </span>
            </div>
            <p className="hidden md:block text-[11px] text-[#737373] -mt-0.5">
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
          leftIcon={<History className="w-3.5 h-3.5 text-[#737373]" />}
          className="text-xs"
        >
          <span>Sessions</span>
          {savedCount > 0 && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full bg-[#181818] text-[10px] font-mono text-[#A3A3A3] border border-[#252525]">
              {savedCount}
            </span>
          )}
        </Button>

        <Button
          size="sm"
          variant="primary"
          onClick={onNewSession}
          leftIcon={<Plus className="w-3.5 h-3.5" />}
          className="text-xs hidden sm:inline-flex"
        >
          New Session
        </Button>
      </div>
    </header>
  );
};
