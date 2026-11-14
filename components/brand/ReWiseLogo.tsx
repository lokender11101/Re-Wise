'use client';

import React from 'react';
import { ReWiseMark, ReWiseMarkSize } from './ReWiseMark';
import { ReWiseWordmark, ReWiseWordmarkSize } from './ReWiseWordmark';

export type ReWiseLogoVariant = 'compact' | 'horizontal' | 'stacked' | 'icon-only';

export interface ReWiseLogoProps {
  variant?: ReWiseLogoVariant;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  subtitle?: string | boolean;
  showBadge?: boolean;
  badgeText?: string;
  animated?: boolean;
  interactive?: boolean;
  className?: string;
  onClick?: () => void;
}

const markSizeMap: Record<'sm' | 'md' | 'lg' | 'xl', ReWiseMarkSize> = {
  sm: 'sm',
  md: 'md',
  lg: 'lg',
  xl: 'xl',
};

const wordmarkSizeMap: Record<'sm' | 'md' | 'lg' | 'xl', ReWiseWordmarkSize> = {
  sm: 'sm',
  md: 'md',
  lg: 'lg',
  xl: 'xl',
};

/**
 * ReWiseLogo — Unified Brand Identity Component
 *
 * Supports horizontal, compact, stacked, and icon-only configurations with
 * consistent alignment, typography, and responsive scaling across desktop & mobile.
 */
export const ReWiseLogo: React.FC<ReWiseLogoProps> = ({
  variant = 'horizontal',
  size = 'md',
  subtitle,
  showBadge = false,
  badgeText = 'Active Learning',
  animated = true,
  interactive = true,
  className = '',
  onClick,
}) => {
  const markSize = markSizeMap[size];
  const wordmarkSize = wordmarkSizeMap[size];

  // Resolve subtitle string
  const resolvedSubtitle =
    typeof subtitle === 'string'
      ? subtitle
      : subtitle === true
      ? 'Active Learning Engine'
      : undefined;

  const content = (
    <>
      {variant === 'icon-only' && (
        <ReWiseMark
          size={markSize}
          animated={animated}
          interactive={interactive}
        />
      )}

      {variant === 'compact' && (
        <div className="flex items-center gap-2.5">
          <div className="shrink-0 flex items-center justify-center p-1 rounded-xl bg-[#121212] border border-[#252525] shadow-inner">
            <ReWiseMark
              size={markSize}
              animated={animated}
              interactive={interactive}
            />
          </div>
          <div className="flex flex-col text-left">
            <ReWiseWordmark size={wordmarkSize} />
            {resolvedSubtitle && (
              <span className="text-[10px] text-[#737373] tracking-normal font-medium mt-0.5">
                {resolvedSubtitle}
              </span>
            )}
          </div>
        </div>
      )}

      {variant === 'horizontal' && (
        <div className="flex items-center gap-2.5">
          <div className="shrink-0 flex items-center justify-center p-1 rounded-xl bg-[#121212] border border-[#252525] shadow-inner">
            <ReWiseMark
              size={markSize}
              animated={animated}
              interactive={interactive}
            />
          </div>
          <div className="flex flex-col text-left">
            <div className="flex items-center gap-2">
              <ReWiseWordmark size={wordmarkSize} />
              {showBadge && (
                <span className="hidden sm:inline-block text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#141414] text-[#A3A3A3] border border-[#252525]">
                  {badgeText}
                </span>
              )}
            </div>
            {resolvedSubtitle && (
              <p className="hidden xl:block text-[11px] text-[#737373] mt-0.5">
                {resolvedSubtitle}
              </p>
            )}
          </div>
        </div>
      )}

      {variant === 'stacked' && (
        <div className="flex flex-col items-center text-center gap-3">
          <div className="p-3 rounded-2xl bg-[#121212] border border-[#252525] shadow-xl">
            <ReWiseMark
              size={markSize}
              animated={animated}
              interactive={interactive}
              glow
            />
          </div>
          <div className="space-y-1">
            <ReWiseWordmark size={wordmarkSize} />
            {resolvedSubtitle && (
              <p className="text-xs text-[#737373] font-medium">
                {resolvedSubtitle}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`focus:outline-none focus-visible:ring-1 focus-visible:ring-[#555555] rounded-xl text-left transition-opacity hover:opacity-90 ${className}`}
        aria-label="ReWise Brand Navigation"
      >
        {content}
      </button>
    );
  }

  return <div className={`inline-flex items-center ${className}`}>{content}</div>;
};
