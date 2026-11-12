'use client';

import React from 'react';
import { clsx } from 'clsx';

export const Skeleton: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => {
  return (
    <div
      className={clsx('animate-pulse bg-[#181818] rounded-xl', className)}
      {...props}
    />
  );
};

export const GenerationLoadingSkeleton: React.FC = () => {
  return (
    <div className="space-y-4 w-full max-w-4xl mx-auto py-4 animate-fade-in">
      {/* Header skeleton */}
      <div className="space-y-3 p-6 bg-[#101010] rounded-2xl border border-[#252525]">
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-3.5 w-1/3" />
      </div>

      {/* Summary block skeleton */}
      <div className="p-6 bg-[#101010] rounded-2xl border border-[#252525] space-y-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-5 w-5 rounded-md" />
          <Skeleton className="h-5 w-40" />
        </div>
        <Skeleton className="h-14 w-full" />
        <div className="space-y-2 pt-2">
          <Skeleton className="h-3.5 w-5/6" />
          <Skeleton className="h-3.5 w-4/6" />
          <Skeleton className="h-3.5 w-3/4" />
        </div>
      </div>

      {/* Flashcards block skeleton */}
      <div className="p-6 bg-[#101010] rounded-2xl border border-[#252525] space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-44 w-full rounded-xl" />
        <div className="flex justify-center gap-3 pt-2">
          <Skeleton className="h-9 w-24 rounded-xl" />
          <Skeleton className="h-9 w-24 rounded-xl" />
        </div>
      </div>
    </div>
  );
};
