'use client';

import React from 'react';

export type ReWiseWordmarkSize = 'sm' | 'md' | 'lg' | 'xl';

export interface ReWiseWordmarkProps {
  size?: ReWiseWordmarkSize;
  className?: string;
}

const sizeClasses: Record<ReWiseWordmarkSize, string> = {
  sm: 'text-sm tracking-tight',
  md: 'text-base tracking-tight',
  lg: 'text-xl tracking-tight',
  xl: 'text-3xl tracking-tighter',
};

/**
 * ReWiseWordmark — Clean, modern typographical brand mark
 */
export const ReWiseWordmark: React.FC<ReWiseWordmarkProps> = ({
  size = 'md',
  className = '',
}) => {
  return (
    <span
      className={`inline-block font-sans font-semibold text-[#F5F5F5] select-none leading-none ${sizeClasses[size]} ${className}`}
    >
      <span className="text-[#E5E5E5] font-semibold">Re</span>
      <span className="text-[#FFFFFF] font-bold">Wise</span>
    </span>
  );
};
