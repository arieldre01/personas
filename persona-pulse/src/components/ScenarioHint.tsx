'use client';

import { useEffect, useRef, useCallback } from 'react';
import { Lightbulb, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ScenarioHintProps {
  hint: string | null;
  onDismiss: () => void;
  className?: string;
}

export function ScenarioHint({ hint, onDismiss, className }: ScenarioHintProps) {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleDismiss = useCallback(() => {
    onDismiss();
  }, [onDismiss]);

  useEffect(() => {
    if (hint) {
      // Auto-dismiss after 8 seconds
      timerRef.current = setTimeout(() => {
        handleDismiss();
      }, 8000);

      return () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
      };
    }
  }, [hint, handleDismiss]);

  if (!hint) return null;

  return (
    <div
      className={cn(
        'flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 shadow-sm transition-all duration-300 animate-fade-in',
        className
      )}
    >
      <div className="flex-shrink-0 p-1 rounded-full bg-amber-100 dark:bg-amber-900">
        <Lightbulb className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-amber-800 dark:text-amber-300 mb-0.5">
          Coaching Tip
        </p>
        <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
          {hint}
        </p>
      </div>
      <button
        onClick={handleDismiss}
        className="flex-shrink-0 p-0.5 rounded hover:bg-amber-200 dark:hover:bg-amber-800 transition-colors"
      >
        <X className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
      </button>
    </div>
  );
}
