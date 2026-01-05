'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChatMessage, Message } from './ChatMessage';
import { Persona, personas, getPersonaById } from '@/lib/personas';
import { Loader2, Send, Wifi, WifiOff } from 'lucide-react';

interface FinderGuidedProps {
  onPersonaMatch: (persona: Persona) => void;
}

// Guided discovery questions
const guidedQuestions = [
  {
    question: "Let's start! How do you typically prefer to receive work updates?",
    options: [
      'Quick bullet points',
      'Detailed reports with data',
      'Short videos or visuals',
      'Face-to-face conversations',
      'Mobile notifications',
    ],
  },
  {
    question: "What's your biggest frustration at work?",
    options: [
      'Information overload',
      'Vague messaging without metrics',
      'Feeling disconnected from HQ',
      'Too much corporate jargon',
      'Boring top-down updates',
    ],
  },
  {
    question: 'What motivates you the most?',
    options: [
      'Helping my team succeed',
      'Career advancement & data-driven wins',
      'Social connection & recognition',
      'Being the go-to expert',
      'Loyalty & genuine relationships',
    ],
  },
  {
    question: 'How do you feel about change at work?',
    options: [
      "Cautious - I've seen too many initiatives fail",
      'Skeptical until I see the data',
      'Excited if it means growth opportunities',
      'Frustrated if it breaks my workflow',
      'Open if it improves team connection',
    ],
  },
];

export function FinderGuided({ onPersonaMatch }: FinderGuidedProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentOptions, setCurrentOptions] = useState<string[]>([]);
  const [matchedPersona, setMatchedPersona] = useState<Persona | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [ollamaConnected, setOllamaConnected] = useState<boolean | null>(null);

  // Check Ollama connection on mount
  useEffect(() => {
    fetch('http://localhost:11434/api/tags')
      .then(res => setOllamaConnected(res.ok))
      .catch(() => setOllamaConnected(false));
  }, []);

  const startGuidedFlow = async () => {
    setIsLoading(true);
    setMessages([]);
    setMatchedPersona(null);
    setQuestionIndex(0);
    setAnswers([]);

    // Show first question
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: guidedQuestions[0].question,
      },
    ]);
    setCurrentOptions(guidedQuestions[0].options);
    setIsLoading(false);
  };

  const handleOptionSelect = async (option: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: option,
    };

    setMessages((prev) => [...prev, userMessage]);
    setCurrentOptions([]);
    setIsLoading(true);

    const newAnswers = [...answers, option];
    setAnswers(newAnswers);
    const nextIndex = questionIndex + 1;

    // If we have more questions, show the next one
    if (nextIndex < guidedQuestions.length) {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: guidedQuestions[nextIndex].question,
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setCurrentOptions(guidedQuestions[nextIndex].options);
      setQuestionIndex(nextIndex);
      setIsLoading(false);
    } else {
      // All questions answered - use Ollama to find the match
      const summaryText = newAnswers.map((a, i) => 
        `Q: ${guidedQuestions[i].question}\nA: ${a}`
      ).join('\n\n');

      try {
        const response = await fetch('/api/persona-match', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userText: `Based on these answers about work preferences:\n\n${summaryText}\n\nFind the best matching persona.`,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const persona = getPersonaById(data.personaId);
          
          if (persona) {
            const confidencePercent = Math.round(data.confidence * 100);
            const assistantMessage: Message = {
              id: (Date.now() + 1).toString(),
              role: 'assistant',
              content: `Based on your responses, you strongly align with **${persona.name}** - "${persona.title}"!\n\n"${persona.quote}"\n\n${data.reason}\n\nConfidence: ${confidencePercent}%`,
            };
            setMessages((prev) => [...prev, assistantMessage]);
            setMatchedPersona(persona);
          }
        } else {
          // Fallback
          const fallbackPersona = personas[Math.floor(Math.random() * personas.length)];
          setMatchedPersona(fallbackPersona);
        }
      } catch (error) {
        console.error('Persona match error:', error);
        const fallbackPersona = personas[0];
        setMatchedPersona(fallbackPersona);
      }

      setIsLoading(false);
    }
  };

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        {/* AI Status */}
        <div className="flex items-center gap-2 mb-4 text-xs">
          {ollamaConnected === null ? (
            <span className="text-gray-400">Checking AI...</span>
          ) : ollamaConnected ? (
            <>
              <Wifi className="h-3 w-3 text-green-500" />
              <span className="text-green-600">AI-Powered Matching (Ollama)</span>
            </>
          ) : (
            <>
              <WifiOff className="h-3 w-3 text-amber-500" />
              <span className="text-amber-600">Fallback Mode</span>
            </>
          )}
        </div>

        <div className="mb-4 rounded-full bg-purple-100 dark:bg-purple-900/30 p-4">
          <Send className="h-8 w-8 text-purple-600 dark:text-purple-400" />
        </div>
        <h3 className="mb-2 text-lg font-semibold">Guided Discovery</h3>
        <p className="mb-6 max-w-sm text-gray-600 dark:text-gray-400">
          Answer a few questions about your work style and preferences, and we&apos;ll
          help you discover which persona best matches you.
        </p>
        <Button onClick={startGuidedFlow} size="lg">
          Start Discovery
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Thinking...</span>
          </div>
        )}
      </div>

      {/* Options or Result */}
      <div className="border-t p-4">
        {matchedPersona ? (
          <div className="text-center">
            <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
              We found your match!
            </p>
            <Button onClick={() => onPersonaMatch(matchedPersona)} size="lg">
              View {matchedPersona.name}&apos;s Profile
            </Button>
          </div>
        ) : currentOptions.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {currentOptions.map((option, i) => (
              <Button
                key={i}
                variant="outline"
                onClick={() => handleOptionSelect(option)}
                disabled={isLoading}
              >
                {option}
              </Button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

