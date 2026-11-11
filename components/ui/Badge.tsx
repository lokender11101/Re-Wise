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
    sm: 'text-xs px-2.5 py-0.5 rounded-full font-medium',
    md: 'text-sm px-3 py-1 rounded-full font-medium',
  };

  const variantStyles = {
    neutral: 'bg-slate-800 text-slate-300 border border-slate-700',
    primary: 'bg-primary-950/80 text-primary-300 border border-primary-800/60',
    success: 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60',
    warning: 'bg-amber-950/80 text-amber-300 border border-amber-800/60',
    danger: 'bg-rose-950/80 text-rose-300 border border-rose-800/60',
    cyan: 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/60',
  };

  return (
    <span
      className={clsx('inline-flex items-center gap-1.5 uppercase tracking-wider', sizeStyles[size], variantStyles[variant], className)}
      {...props}
    >
      {children}
    </span>
  );
};
