'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ChatMessage, Message } from './ChatMessage';
import { Persona, personas, getPersonaById } from '@/lib/personas';
import { Loader2, Sparkles, Send, Wifi, WifiOff } from 'lucide-react';

interface FinderFreeformProps {
  onPersonaMatch: (persona: Persona) => void;
}

export function FinderFreeform({ onPersonaMatch }: FinderFreeformProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [matchedPersona, setMatchedPersona] = useState<Persona | null>(null);
  const [ollamaConnected, setOllamaConnected] = useState<boolean | null>(null);

  // Check Ollama connection on mount
  useEffect(() => {
    fetch('http://localhost:11434/api/tags')
      .then(res => setOllamaConnected(res.ok))
      .catch(() => setOllamaConnected(false));
  }, []);

  const handleSubmit = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Call the persona-match API
      const response = await fetch('/api/persona-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userText: text,
          context: messages.map(m => `${m.role}: ${m.content}`).join('\n'),
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
            content: `Based on your description, you strongly align with **${persona.name}** - "${persona.title}"!\n\n"${persona.quote}"\n\n${data.reason}\n\nConfidence: ${confidencePercent}%`,
          };
          setMessages((prev) => [...prev, assistantMessage]);
          setMatchedPersona(persona);
        }
      } else {
        // Fallback to random if API fails
        const fallbackPersona = personas[Math.floor(Math.random() * personas.length)];
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `Based on your description, you seem to align with **${fallbackPersona.name}** - "${fallbackPersona.title}"!\n\n"${fallbackPersona.quote}"`,
        };
        setMessages((prev) => [...prev, assistantMessage]);
        setMatchedPersona(fallbackPersona);
      }
    } catch (error) {
      console.error('Persona match error:', error);
      // Fallback
      const fallbackPersona = personas[0];
      setMatchedPersona(fallbackPersona);
    }

    setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(input);
    }
  };

  if (messages.length === 0) {
    return (
      <div className="flex flex-col h-full">
        {/* AI Status */}
        <div className="flex items-center justify-center gap-2 py-2 text-xs">
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
              <span className="text-amber-600">Fallback Mode (Start Ollama for AI)</span>
            </>
          )}
        </div>

        <div className="flex-1 flex flex-col items-center justify-center py-8 text-center">
          <div className="mb-4 rounded-full bg-teal-100 dark:bg-teal-900/30 p-4">
            <Sparkles className="h-8 w-8 text-teal-600 dark:text-teal-400" />
          </div>
          <h3 className="mb-2 text-lg font-semibold">Free-form Analysis</h3>
          <p className="mb-6 max-w-md text-gray-600 dark:text-gray-400">
            Describe your work style, what stresses you out, how you prefer to
            receive information, and what motivates you. We&apos;ll analyze your
            response and match you with a persona.
          </p>
        </div>

        <div className="border-t p-4">
          <Textarea
            placeholder="Example: I'm a manager who feels overwhelmed by the constant stream of emails and messages. I prefer quick, actionable updates over long newsletters. I'm motivated by helping my team succeed but frustrated when I don't have clear information to share with them..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="mb-3 min-h-[120px]"
          />
          <Button
            onClick={() => handleSubmit(input)}
            disabled={!input.trim() || isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Analyze My Style
              </>
            )}
          </Button>
        </div>
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
            <span>Analyzing your response...</span>
          </div>
        )}
      </div>

      {/* Input or Result */}
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
        ) : (
          <div className="flex gap-2">
            <Textarea
              placeholder="Add more details or answer the follow-up question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="min-h-[60px]"
            />
            <Button
              onClick={() => handleSubmit(input)}
              disabled={!input.trim() || isLoading}
              size="icon"
              className="h-auto"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

