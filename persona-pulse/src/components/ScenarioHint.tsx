'use client';

import { useEffect, useState } from 'react';
import { Lightbulb, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ScenarioHintProps {
  hint: string | null;
  onDismiss: () => void;
  className?: string;
}

export function ScenarioHint({ hint, onDismiss, className }: ScenarioHintProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [displayedHint, setDisplayedHint] = useState<string | null>(null);

  useEffect(() => {
    if (hint) {
      setDisplayedHint(hint);
      setIsVisible(true);
      
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onDismiss(), 300);
      }, 8000);

      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [hint, onDismiss]);

  if (!displayedHint) return null;

  return (
    <div
      className={cn(
        'flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 shadow-sm transition-all duration-300',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2',
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
          {displayedHint}
        </p>
      </div>
      <button
        onClick={() => {
          setIsVisible(false);
          setTimeout(onDismiss, 300);
        }}
        className="flex-shrink-0 p-0.5 rounded hover:bg-amber-200 dark:hover:bg-amber-800 transition-colors"
      >
        <X className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
      </button>
    </div>
  );
}
