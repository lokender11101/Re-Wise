'use client';

import React from 'react';
import { clsx } from 'clsx';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'interactive' | 'outline';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    const variantStyles = {
      default: 'bg-[#101010] border border-[#252525]',
      elevated: 'bg-[#181818] border border-[#252525]',
      interactive:
        'bg-[#101010] border border-[#252525] hover:border-[#444444] hover:bg-[#141414] transition-all duration-150 cursor-pointer',
      outline: 'bg-transparent border border-[#1F1F1F]',
    };

    return (
      <div
        ref={ref}
        className={clsx('rounded-2xl p-5 md:p-6 text-[#F5F5F5]', variantStyles[variant], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
