'use client';

import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'bg-gray-200 dark:bg-gray-700 rounded shimmer',
        className
      )}
    />
  );
}

// Skeleton card matching PersonaCard layout
export function SkeletonCard() {
  return (
    <div className="glass-card rounded-xl p-4 h-full flex flex-col">
      {/* Avatar skeleton */}
      <div className="flex flex-col items-center text-center">
        <Skeleton className="h-16 w-16 rounded-full mb-3" />
        {/* Name */}
        <Skeleton className="h-5 w-24 mb-1" />
        {/* Role */}
        <Skeleton className="h-4 w-32 mb-2" />
        {/* Badge */}
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      
      {/* Quote skeleton */}
      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex-1">
        <Skeleton className="h-3 w-full mb-1" />
        <Skeleton className="h-3 w-3/4" />
      </div>
      
      {/* Button skeleton */}
      <Skeleton className="h-8 w-full mt-3 rounded-md" />
    </div>
  );
}

// Skeleton for chat status indicator
export function SkeletonChatStatus() {
  return (
    <div className="flex items-center gap-2 px-4 py-2 border-b">
      <Skeleton className="h-3 w-3 rounded-full" />
      <Skeleton className="h-3 w-32" />
    </div>
  );
}

// Skeleton for a grid of cards
export function SkeletonGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="animate-fade-in-up"
          style={{ animationDelay: `${i * 0.05}s` }}
        >
          <SkeletonCard />
        </div>
      ))}
    </div>
  );
}

