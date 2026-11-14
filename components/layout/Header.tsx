'use client';

import React from 'react';
import { Menu, Plus, History, Brain, Layers, Cpu, Compass } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ReWiseLogo } from '@/components/brand/ReWiseLogo';

export interface HeaderProps {
  onOpenSavedSessions: () => void;
  onNewSession: () => void;
  onNavigateToInsights?: () => void;
  onToggleSidebar?: () => void;
  savedCount?: number;
  hasActiveSession?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSavedSessions,
  onNewSession,
  onNavigateToInsights,
  onToggleSidebar,
  savedCount = 0,
  hasActiveSession = false,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full max-w-full bg-[#050505]/95 backdrop-blur-md border-b border-[#1A1A1A] px-4 sm:px-6 md:px-8 py-3 flex items-center justify-between">
      {/* Left: ReWise Signature Brand & Identity */}
      <div className="flex items-center gap-3 md:gap-4 shrink-0">
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            className="lg:hidden p-1.5 text-[#737373] hover:text-[#F5F5F5] rounded-lg hover:bg-[#141414] transition-colors"
            aria-label="Toggle navigation drawer"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}

        <div className="flex items-center gap-3">
          <ReWiseLogo
            variant="horizontal"
            size="sm"
            showBadge={true}
            badgeText="Active Learning"
            subtitle="Study smarter. Remember longer."
            onClick={onNewSession}
          />
        </div>
      </div>

      {/* Center: Commercial Navigation Links (Swiggy / Apple inspired, visible on desktop >= 1024px) */}
      <nav className="hidden lg:flex items-center gap-1 bg-[#0A0A0A] p-1 rounded-full border border-[#1F1F1F]">
        <button
          type="button"
          onClick={onNewSession}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
            !hasActiveSession
              ? 'bg-[#181818] text-white shadow-sm'
              : 'text-[#8A8A8A] hover:text-[#E5E5E5] hover:bg-[#121212]'
          }`}
        >
          <Compass className="w-3.5 h-3.5 text-[#A3A3A3]" />
          <span>Workspace</span>
        </button>

        {hasActiveSession && (
          <button
            type="button"
            onClick={onNavigateToInsights}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium text-[#8A8A8A] hover:text-[#E5E5E5] hover:bg-[#121212] transition-all"
          >
            <Brain className="w-3.5 h-3.5 text-[#B7B9E2]" />
            <span>Insights</span>
          </button>
        )}

        <button
          type="button"
          onClick={onOpenSavedSessions}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium text-[#8A8A8A] hover:text-[#E5E5E5] hover:bg-[#121212] transition-all"
        >
          <Layers className="w-3.5 h-3.5 text-[#A3A3A3]" />
          <span>Library</span>
          {savedCount > 0 && (
            <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-[#181818] text-[10px] font-mono text-[#D4D4D4] border border-[#2A2A2A]">
              {savedCount}
            </span>
          )}
        </button>
      </nav>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* DeepSeek Flash Engine Status */}
        <div className="hidden xl:flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-[#0E0E0E] border border-[#1F1F1F] text-[11px] text-[#A3A3A3]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-mono text-[#D4D4D4]">DeepSeek V3</span>
        </div>

        {/* Saved Sessions Drawer Trigger */}
        <Button
          size="sm"
          variant="outline"
          onClick={onOpenSavedSessions}
          leftIcon={<History className="w-3.5 h-3.5 text-[#888888]" />}
          className="text-xs border-[#222222] bg-[#0A0A0A] hover:bg-[#141414] hover:border-[#333333]"
        >
          <span>Sessions</span>
          {savedCount > 0 && (
            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-[#161616] text-[10px] font-mono text-[#E5E5E5] border border-[#282828]">
              {savedCount}
            </span>
          )}
        </Button>

        {/* Primary New Session Action */}
        <Button
          size="sm"
          variant="primary"
          onClick={onNewSession}
          leftIcon={<Plus className="w-3.5 h-3.5" />}
          className="text-xs font-semibold px-3.5 shadow-sm"
        >
          <span className="hidden sm:inline">New Session</span>
          <span className="sm:hidden">New</span>
        </Button>
      </div>
    </header>
  );
};
