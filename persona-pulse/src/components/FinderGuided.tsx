'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChatMessage, Message } from './ChatMessage';
import { aiService } from '@/lib/ai-service';
import { Persona } from '@/lib/personas';
import { Loader2, Send } from 'lucide-react';

interface FinderGuidedProps {
  onPersonaMatch: (persona: Persona) => void;
}

export function FinderGuided({ onPersonaMatch }: FinderGuidedProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentOptions, setCurrentOptions] = useState<string[]>([]);
  const [matchedPersona, setMatchedPersona] = useState<Persona | null>(null);

  const startGuidedFlow = async () => {
    setIsLoading(true);
    setMessages([]);
    setMatchedPersona(null);

    const response = await aiService.startGuidedDiscovery();
    
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: response.message,
      },
    ]);
    setCurrentOptions(response.options || []);
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

    const response = await aiService.continueGuidedDiscovery(
      [...messages, userMessage],
      option
    );

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response.message,
    };

    setMessages((prev) => [...prev, assistantMessage]);

    if (response.matchedPersona) {
      setMatchedPersona(response.matchedPersona);
    } else {
      setCurrentOptions(response.options || []);
    }

    setIsLoading(false);
  };

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
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

