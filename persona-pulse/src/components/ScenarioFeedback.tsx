'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScenarioFeedback as FeedbackType, Scenario } from '@/lib/scenarios';
import { Persona, generationColors } from '@/lib/personas';
import { Star, CheckCircle2, ArrowRight, RotateCcw, ListChecks, Loader2 } from 'lucide-react';

interface ScenarioFeedbackProps {
  open: boolean;
  onClose: () => void;
  onTryAgain: () => void;
  onPickNew: () => void;
  feedback: FeedbackType | null;
  scenario: Scenario;
  persona: Persona;
  isLoading?: boolean;
}

export function ScenarioFeedbackModal({
  open,
  onClose,
  onTryAgain,
  onPickNew,
  feedback,
  persona,
  isLoading = false,
}: Omit<ScenarioFeedbackProps, 'scenario'> & { scenario?: Scenario }) {
  const colors = generationColors[persona.generation];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            {isLoading ? 'Analyzing Conversation...' : 'Scenario Complete!'}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400 mb-4" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Evaluating your communication...
            </p>
          </div>
        ) : feedback ? (
          <div className="space-y-5">
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-7 w-7 ${
                      star <= feedback.score
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'fill-gray-200 text-gray-200 dark:fill-gray-700 dark:text-gray-700'
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {getScoreLabel(feedback.score)}
              </p>
            </div>

            <div className={`p-4 rounded-lg ${colors.bg}`}>
              <p className={`text-sm ${colors.text} leading-relaxed`}>
                {feedback.summary}
              </p>
            </div>

            {feedback.strengths.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  What you did well
                </h4>
                <ul className="space-y-1.5">
                  {feedback.strengths.map((strength, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {feedback.improvements.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5">
                  <ArrowRight className="h-4 w-4 text-blue-500" />
                  Areas to improve
                </h4>
                <ul className="space-y-1.5">
                  {feedback.improvements.map((improvement, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <span className="text-blue-500 mt-1">→</span>
                      <span>{improvement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={onTryAgain} className="flex-1 gap-2">
                <RotateCcw className="h-4 w-4" />
                Try Again
              </Button>
              <Button onClick={onPickNew} className={`flex-1 gap-2 ${colors.badge} hover:opacity-90`}>
                <ListChecks className="h-4 w-4" />
                New Scenario
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No feedback available.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function getScoreLabel(score: number): string {
  switch (score) {
    case 5: return 'Excellent! Outstanding communication!';
    case 4: return 'Great job! Very effective communication.';
    case 3: return 'Good effort! Room for improvement.';
    case 2: return 'Keep practicing! You\'re learning.';
    default: return 'Don\'t give up! Every conversation is a lesson.';
  }
}
