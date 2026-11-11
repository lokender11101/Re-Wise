'use client';

import React from 'react';
import { clsx } from 'clsx';

export const Skeleton: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => {
  return (
    <div
      className={clsx('animate-pulse bg-slate-800/80 rounded-lg', className)}
      {...props}
    />
  );
};

export const GenerationLoadingSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto py-6 animate-fadeIn">
      {/* Header skeleton */}
      <div className="space-y-3 p-6 bg-card rounded-2xl border border-card-border">
        <Skeleton className="h-7 w-3/5" />
        <Skeleton className="h-4 w-2/5" />
      </div>

      {/* Summary block skeleton */}
      <div className="p-6 bg-card rounded-2xl border border-card-border space-y-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-6 w-6 rounded-md" />
          <Skeleton className="h-6 w-48" />
        </div>
        <Skeleton className="h-16 w-full" />
        <div className="space-y-2 pt-2">
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>

      {/* Flashcards block skeleton */}
      <div className="p-6 bg-card rounded-2xl border border-card-border space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-48 w-full rounded-xl" />
        <div className="flex justify-center gap-3 pt-2">
          <Skeleton className="h-10 w-28 rounded-xl" />
          <Skeleton className="h-10 w-28 rounded-xl" />
        </div>
      </div>
    </div>
  );
};
