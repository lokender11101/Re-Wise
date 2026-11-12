'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ReWiseMark } from './ReWiseMark';

export interface LogoLoaderProps {
  message?: string;
  submessage?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * LogoLoader — Sophisticated 3D Branded Loader
 *
 * Displays the 3D ReWise monogram with subtle metallic light shimmer,
 * gentle breathing elevation, and informative pedagogical status typography.
 * Fully compliant with `prefers-reduced-motion`.
 */
export const LogoLoader: React.FC<LogoLoaderProps> = ({
  message = 'Structuring your learning material...',
  submessage,
  size = 'md',
  className = '',
}) => {
  const shouldReduceMotion = useReducedMotion();

  const markSize = size === 'sm' ? 36 : size === 'lg' ? 64 : 48;

  return (
    <div
      className={`flex flex-col items-center justify-center p-6 md:p-8 rounded-2xl bg-[#0D0D0D] border border-[#222222] text-center space-y-4 shadow-2xl animate-fade-in ${className}`}
      role="status"
      aria-live="polite"
    >
      {/* 3D Animated Mark with Glow */}
      <div className="relative">
        <ReWiseMark
          size={markSize}
          animated={!shouldReduceMotion}
          interactive={false}
          isLoading={true}
          glow={true}
        />
      </div>

      {/* Status Messages */}
      <div className="space-y-1.5 max-w-sm">
        <motion.p
          animate={
            shouldReduceMotion
              ? {}
              : {
                  opacity: [0.75, 1, 0.75],
                }
          }
          transition={{
            duration: 2.4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="text-sm font-medium text-[#F5F5F5] tracking-tight"
        >
          {message}
        </motion.p>

        {submessage && (
          <p className="text-xs text-[#737373] leading-relaxed">
            {submessage}
          </p>
        )}
      </div>
    </div>
  );
};
