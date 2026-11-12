'use client';

import React from 'react';
import { clsx } from 'clsx';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral' | 'cyan';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'neutral',
  size = 'sm',
  children,
  ...props
}) => {
  const sizeStyles = {
    sm: 'text-[11px] px-2.5 py-0.5 rounded-full font-medium tracking-wide',
    md: 'text-xs px-3 py-1 rounded-full font-medium tracking-wide',
  };

  const variantStyles = {
    neutral: 'bg-[#181818] text-[#A3A3A3] border border-[#252525]',
    primary: 'bg-[#202020] text-[#F5F5F5] border border-[#383838]',
    cyan: 'bg-[#181818] text-[#E5E5E5] border border-[#2B2B2B]',
    success: 'bg-[#101411] text-[#86EFAC] border border-[#1F3325]',
    warning: 'bg-[#141210] text-[#FDE047] border border-[#332A1F]',
    danger: 'bg-[#141010] text-[#FCA5A5] border border-[#331F1F]',
  };

  return (
    <span
      className={clsx('inline-flex items-center gap-1.5 uppercase', sizeStyles[size], variantStyles[variant], className)}
      {...props}
    >
      {children}
    </span>
  );
};
