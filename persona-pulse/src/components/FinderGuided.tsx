'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChatMessage, Message } from './ChatMessage';
import { Persona, personas, getPersonaById } from '@/lib/personas';
import { amdocsPersonas } from '@/lib/amdocs-personas';
import { Loader2, Send } from 'lucide-react';

interface FinderGuidedProps {
  onPersonaMatch: (persona: Persona) => void;
  personaSet?: 'amdocs' | 'mock';
}

// Guided discovery questions
const guidedQuestions = [
  {
    question: "What's your role?",
    options: [
      'Manager / Team Lead',
      'Individual Contributor',
      'Sales / Customer Facing',
      'Field / Frontline Worker',
      'New Employee / Junior',
    ],
  },
  {
    question: "How long have you been at the company?",
    options: [
      'Less than 1 year',
      '1-3 years',
      '4-10 years',
      'More than 10 years',
      'Recently joined (acquisition)',
    ],
  },
  {
    question: 'What\'s your age group?',
    options: [
      '20s (Gen Z)',
      '30s (Millennial)',
      '40s (Gen X)',
      '50+ (Boomer)',
    ],
  },
  {
    question: 'Where do you mostly work?',
    options: [
      'At a desk / Office',
      'On the go / Mobile',
      'Remote / Work from home',
      'In the field / On-site',
      'Mix of everything',
    ],
  },
];

export function FinderGuided({ onPersonaMatch, personaSet = 'amdocs' }: FinderGuidedProps) {
  const activePersonas = personaSet === 'amdocs' ? amdocsPersonas : personas;
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentOptions, setCurrentOptions] = useState<string[]>([]);
  const [matchedPersona, setMatchedPersona] = useState<Persona | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);

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
            personaSet,
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
              content: `Based on your responses, you align with ${persona.name} - "${persona.title}"!\n\n"${persona.quote}"\n\n${data.reason}\n\nMatch confidence: ${confidencePercent}%`,
            };
            setMessages((prev) => [...prev, assistantMessage]);
            setMatchedPersona(persona);
          }
        } else {
          // Fallback
          const fallbackPersona = activePersonas[Math.floor(Math.random() * activePersonas.length)];
          setMatchedPersona(fallbackPersona);
        }
      } catch (error) {
        console.error('Persona match error:', error);
        const fallbackPersona = activePersonas[0];
        setMatchedPersona(fallbackPersona);
      }

      setIsLoading(false);
    }
  };

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col h-full min-h-0 overflow-hidden items-center justify-center py-12 text-center px-4">
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
    <div className="flex flex-col h-full min-h-0 overflow-hidden">
      {/* Messages */}
      <div className="flex-1 min-h-0 space-y-4 overflow-y-auto p-4">
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
      <div className="flex-shrink-0 border-t p-4 bg-gray-50/50 dark:bg-gray-900/50">
        {matchedPersona ? (
          <div className="text-center">
            <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
              🎉 We found your match!
            </p>
            <Button onClick={() => onPersonaMatch(matchedPersona)} size="lg" className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
              View {matchedPersona.name}&apos;s Profile
            </Button>
          </div>
        ) : currentOptions.length > 0 ? (
          <div className="flex flex-wrap gap-2 justify-center">
            {currentOptions.map((option, i) => (
              <Button
                key={i}
                variant="outline"
                onClick={() => handleOptionSelect(option)}
                disabled={isLoading}
                className="text-sm"
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

