'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Persona, generationColors } from '@/lib/personas';
import { getFullPersonaContext } from '@/lib/persona-prompts';
import { Send, Loader2, Wifi, WifiOff } from 'lucide-react';
import { getPersonaImage, getPersonaImagePosition } from '@/lib/personas';

interface Message {
  id: string;
  role: 'user' | 'persona';
  content: string;
}

interface PersonaChatProps {
  persona: Persona;
}

export function PersonaChat({ persona }: PersonaChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'persona',
      content: `Hi, I'm ${persona.name}. "${persona.quote}" Feel free to ask me anything about my work style, preferences, or how to communicate with people like me.`,
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [useOllama, setUseOllama] = useState(true);
  const [ollamaStatus, setOllamaStatus] = useState<'checking' | 'connected' | 'offline'>('checking');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const colors = generationColors[persona.generation];
  const personaContext = getFullPersonaContext(persona);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check Ollama status on mount
  useEffect(() => {
    checkOllamaStatus();
  }, []);

  const checkOllamaStatus = async () => {
    try {
      const response = await fetch('http://localhost:11434/api/tags', {
        method: 'GET',
      });
      if (response.ok) {
        setOllamaStatus('connected');
        setUseOllama(true);
      } else {
        setOllamaStatus('offline');
        setUseOllama(false);
      }
    } catch {
      setOllamaStatus('offline');
      setUseOllama(false);
    }
  };

  // Fallback mock response generator
  const generateMockResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return `Hey there! I'm ${persona.name}, ${persona.role}. ${persona.quote} What can I help you with?`;
    }
    
    if (lowerMessage.includes('stress') || lowerMessage.includes('frustrat')) {
      return `You're touching on something I deal with daily. ${persona.psychology.stress} It's not always easy.`;
    }

    if (lowerMessage.includes('communicat') || lowerMessage.includes('prefer') || lowerMessage.includes('talk')) {
      const dos = persona.communication.do.slice(0, 2).join(' and ');
      return `When it comes to communication, I really appreciate when people ${dos.toLowerCase()}. That makes a big difference for me.`;
    }

    if (lowerMessage.includes('motivat') || lowerMessage.includes('drive')) {
      return `What keeps me going? ${persona.psychology.motivation}. That's what gets me out of bed in the morning.`;
    }

    // Generic responses based on persona
    const responses = [
      `That's an interesting point. From my perspective as a ${persona.role}, I'd say it depends on the context.`,
      `I hear you. ${persona.psychology.motivation} - that's what I always come back to.`,
      `Good question. You know, ${persona.quote.toLowerCase()}`,
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    let responseText = '';

    if (useOllama && ollamaStatus === 'connected') {
      try {
        // Build conversation history for context
        const conversationHistory = messages
          .map((m) => `${m.role === 'user' ? 'User' : persona.name}: ${m.content}`)
          .join('\n');

        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: `${conversationHistory}\nUser: ${userMessage.content}`,
            personaContext,
            personaId: persona.id,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          responseText = data.response || generateMockResponse(userMessage.content);
        } else {
          // Fallback to mock if API fails
          responseText = generateMockResponse(userMessage.content);
        }
      } catch (error) {
        console.error('Ollama error:', error);
        responseText = generateMockResponse(userMessage.content);
      }
    } else {
      // Use mock responses
      await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 800));
      responseText = generateMockResponse(userMessage.content);
    }

    const personaMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'persona',
      content: responseText,
    };

    setMessages((prev) => [...prev, personaMessage]);
    setIsTyping(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[400px]">
      {/* Status indicator */}
      <div className="flex items-center justify-between px-4 py-2 border-b text-xs">
        <div className="flex items-center gap-2">
          {ollamaStatus === 'connected' ? (
            <>
              <Wifi className="h-3 w-3 text-green-500" />
              <span className="text-green-600">AI Powered (Ollama)</span>
            </>
          ) : ollamaStatus === 'checking' ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin text-gray-400" />
              <span className="text-gray-500">Checking AI...</span>
            </>
          ) : (
            <>
              <WifiOff className="h-3 w-3 text-amber-500" />
              <span className="text-amber-600">Mock Mode (Start Ollama for AI)</span>
            </>
          )}
        </div>
        {ollamaStatus === 'offline' && (
          <button
            onClick={checkOllamaStatus}
            className="text-blue-500 hover:underline"
          >
            Retry
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            {/* Avatar */}
            <div
              className={`flex-shrink-0 h-8 w-8 rounded-full overflow-hidden ${
                message.role === 'user' ? 'bg-blue-500' : ''
              }`}
            >
              {message.role === 'persona' ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={getPersonaImage(persona)}
                  alt={persona.name}
                  className="h-full w-full object-cover"
                  style={{ objectPosition: getPersonaImagePosition(persona) }}
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-white text-sm font-bold">
                  You
                </div>
              )}
            </div>

            {/* Message bubble */}
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${
                message.role === 'user'
                  ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-md'
                  : `${colors.bg} ${colors.text} rounded-bl-md border border-gray-100 dark:border-gray-700`
              }`}
            >
              {message.role === 'persona' && (
                <p className="text-xs font-semibold opacity-80 mb-1">{persona.name}</p>
              )}
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-3 animate-scale-in">
            <div className="flex-shrink-0 h-8 w-8 rounded-full overflow-hidden ring-2 ring-white dark:ring-gray-700 shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getPersonaImage(persona)}
                alt={persona.name}
                className="h-full w-full object-cover"
                style={{ objectPosition: getPersonaImagePosition(persona) }}
              />
            </div>
            <div className={`rounded-2xl rounded-bl-md px-4 py-3 ${colors.bg} border border-gray-100 dark:border-gray-700`}>
              <div className="flex items-center gap-1.5 h-5">
                <div className="w-2 h-2 rounded-full bg-gray-400 typing-dot" />
                <div className="w-2 h-2 rounded-full bg-gray-400 typing-dot" />
                <div className="w-2 h-2 rounded-full bg-gray-400 typing-dot" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t p-4">
        <div className="flex gap-2">
          <Textarea
            placeholder={`Message ${persona.name}...`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-[44px] max-h-[120px] resize-none"
            rows={1}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            size="icon"
            className={colors.badge}
          >
            {isTyping ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
