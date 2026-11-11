'use client';

import React from 'react';
import { clsx } from 'clsx';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'interactive' | 'outline';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    const variantStyles = {
      default: 'bg-card border border-card-border shadow-md',
      elevated: 'bg-card-elevated border border-card-border/80 shadow-xl',
      interactive:
        'bg-card border border-card-border hover:border-slate-600 transition-all duration-200 cursor-pointer hover:shadow-lg',
      outline: 'bg-transparent border border-card-border',
    };

    return (
      <div
        ref={ref}
        className={clsx('rounded-2xl p-5 md:p-6 text-slate-100', variantStyles[variant], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
