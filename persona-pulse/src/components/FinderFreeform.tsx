'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ChatMessage, Message } from './ChatMessage';
import { Persona, getPersonaById } from '@/lib/personas';
import { Loader2, Sparkles, Send, PenLine, RefreshCw } from 'lucide-react';

interface FinderFreeformProps {
  onPersonaMatch: (persona: Persona) => void;
}

// Conversation prompts to help users who get stuck
const conversationStarters = [
  "What's your job role?",
  "How long have you been at the company?",
  "Are you mostly at a desk or on the go?",
  "Do you manage people?",
];

export function FinderFreeform({ onPersonaMatch }: FinderFreeformProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [matchedPersona, setMatchedPersona] = useState<Persona | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus textarea on mount
  useEffect(() => {
    textareaRef.current?.focus();
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
      const response = await fetch('/api/persona-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userText: text,
          context: messages.map(m => `${m.role}: ${m.content}`).join('\n'),
        }),
      });

      const data = await response.json();
      const persona = getPersonaById(data.personaId);
      
      if (persona) {
        const confidencePercent = Math.round(data.confidence * 100);
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `Based on your description, you align with ${persona.name} - "${persona.title}"!\n\n"${persona.quote}"\n\n${data.reason}\n\nMatch confidence: ${confidencePercent}%`,
        };
        setMessages((prev) => [...prev, assistantMessage]);
        setMatchedPersona(persona);
      }
    } catch (error) {
      console.error('Persona match error:', error);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I had trouble analyzing your response. Could you tell me more about your work style and communication preferences?",
      };
      setMessages((prev) => [...prev, assistantMessage]);
    }

    setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(input);
    }
  };

  const handleStarterClick = (starter: string) => {
    setInput(starter);
    textareaRef.current?.focus();
  };

  const handleTryAgain = () => {
    setMessages([]);
    setMatchedPersona(null);
    setInput('');
  };

  if (messages.length === 0) {
    return (
      <div className="flex flex-col h-full min-h-0 overflow-hidden">
        <div className="flex-1 min-h-0 flex flex-col items-center justify-center py-6 text-center px-4 overflow-y-auto">
          <div className="mb-4 rounded-full bg-gradient-to-br from-teal-100 to-emerald-100 dark:from-teal-900/40 dark:to-emerald-900/40 p-4 shadow-sm">
            <PenLine className="h-8 w-8 text-teal-600 dark:text-teal-400" />
          </div>
          <h3 className="mb-2 text-xl font-semibold">Tell Us About Yourself</h3>
          <p className="mb-4 max-w-md text-gray-600 dark:text-gray-400">
            Describe yourself: your job role, how long you&apos;ve been working, whether you manage people, 
            if you work at a desk or on the go, your age group, etc.
          </p>
          
          {/* Quick prompts */}
          <div className="mb-4 w-full max-w-md">
            <p className="text-xs text-gray-500 mb-2">Need inspiration? Try one of these:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {conversationStarters.map((starter, i) => (
                <button
                  key={i}
                  onClick={() => handleStarterClick(starter)}
                  className="text-xs px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-teal-100 dark:hover:bg-teal-900/50 text-gray-700 dark:text-gray-300 transition-colors"
                >
                  {starter}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50/50 dark:bg-gray-900/50">
          <Textarea
            ref={textareaRef}
            placeholder="Example: I'm a 35 year old product manager. Been at the company for 4 years. I work mostly from my desk and manage a small team..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="mb-3 min-h-[80px] bg-white dark:bg-gray-800 resize-none focus:ring-2 focus:ring-teal-500"
          />
          <Button
            onClick={() => handleSubmit(input)}
            disabled={!input.trim() || isLoading}
            className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Finding your match...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Find My Persona
              </>
            )}
          </Button>
          <p className="text-xs text-center text-gray-500 mt-2">
            Press Enter to submit, Shift+Enter for new line
          </p>
        </div>
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
            <span>Analyzing your work style...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input or Result */}
      <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50/50 dark:bg-gray-900/50">
        {matchedPersona ? (
          <div className="text-center space-y-3">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              🎉 We found your match!
            </p>
            <div className="flex gap-2 justify-center flex-wrap">
              <Button onClick={() => onPersonaMatch(matchedPersona)} size="lg" className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700">
                View {matchedPersona.name}&apos;s Profile
              </Button>
              <Button onClick={handleTryAgain} variant="outline" size="lg">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            <Textarea
              ref={textareaRef}
              placeholder="Tell me more about yourself..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="min-h-[60px] bg-white dark:bg-gray-800 resize-none"
            />
            <Button
              onClick={() => handleSubmit(input)}
              disabled={!input.trim() || isLoading}
              size="icon"
              className="h-auto min-w-[44px] bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

