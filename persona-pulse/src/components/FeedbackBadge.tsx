'use client';

import { FeedbackResult, FeedbackScore, getFeedbackColors } from '@/lib/style-analyzer';
import { CheckCircle2, ThumbsUp, AlertTriangle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FeedbackBadgeProps {
  feedback: FeedbackResult;
  className?: string;
}

const scoreIcons: Record<FeedbackScore, React.ReactNode> = {
  great: <CheckCircle2 className="h-3.5 w-3.5" />,
  good: <ThumbsUp className="h-3.5 w-3.5" />,
  caution: <AlertTriangle className="h-3.5 w-3.5" />,
  warning: <XCircle className="h-3.5 w-3.5" />,
};

const scoreLabels: Record<FeedbackScore, string> = {
  great: 'Great!',
  good: 'Good',
  caution: 'Caution',
  warning: 'Warning',
};

export function FeedbackBadge({ feedback, className }: FeedbackBadgeProps) {
  const colors = getFeedbackColors(feedback.score);
  const Icon = scoreIcons[feedback.score];
  
  return (
    <div
      className={cn(
        'inline-flex flex-col items-end gap-0.5 animate-fade-in',
        className
      )}
    >
      {/* Main badge */}
      <div
        className={cn(
          'flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border shadow-sm',
          colors.bg,
          colors.text,
          colors.border
        )}
      >
        {Icon}
        <span>{scoreLabels[feedback.score]}</span>
      </div>
      
      {/* Feedback message */}
      <p className={cn('text-[10px] max-w-[200px] text-right', colors.text)}>
        {feedback.message}
      </p>
      
      {/* Tip (shown for caution/warning) */}
      {feedback.tip && (feedback.score === 'caution' || feedback.score === 'warning') && (
        <p className="text-[10px] text-gray-500 dark:text-gray-400 max-w-[200px] text-right italic">
          💡 {feedback.tip}
        </p>
      )}
    </div>
  );
}

/**
 * Compact inline version for tight spaces
 */
export function FeedbackBadgeInline({ feedback, className }: FeedbackBadgeProps) {
  const colors = getFeedbackColors(feedback.score);
  const Icon = scoreIcons[feedback.score];
  
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border animate-fade-in',
        colors.bg,
        colors.text,
        colors.border,
        className
      )}
    >
      {Icon}
      <span>{feedback.message}</span>
    </div>
  );
}
