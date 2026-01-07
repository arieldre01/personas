'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Persona, generationColors } from '@/lib/personas';
import { getFullPersonaContext } from '@/lib/persona-prompts';
import { Send, Loader2, Wifi, WifiOff, Trash2, Sparkles } from 'lucide-react';
import { getPersonaImage, getPersonaImagePosition } from '@/lib/personas';
import { saveChat, loadChat, clearChat } from '@/lib/chat-storage';

interface Message {
  id: string;
  role: 'user' | 'persona';
  content: string;
}

interface PersonaChatProps {
  persona: Persona;
}

type AIProvider = 'gemini' | 'ollama' | 'mock';
type ProviderStatus = 'checking' | 'active' | 'fallback' | 'mock';

export function PersonaChat({ persona }: PersonaChatProps) {
  const getInitialMessage = (): Message => ({
    id: '0',
    role: 'persona',
    content: `Hi, I'm ${persona.name}. "${persona.quote}" Feel free to ask me anything about my work style, preferences, or how to communicate with people like me.`,
  });

  const [messages, setMessages] = useState<Message[]>([getInitialMessage()]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [aiProvider, setAiProvider] = useState<AIProvider>('mock');
  const [providerStatus, setProviderStatus] = useState<ProviderStatus>('checking');
  const [providerName, setProviderName] = useState('Checking...');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const colors = generationColors[persona.generation];
  const personaContext = getFullPersonaContext(persona);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load saved messages on mount
  useEffect(() => {
    const savedMessages = loadChat(persona.id);
    if (savedMessages.length > 0) {
      setMessages(savedMessages);
    }
  }, [persona.id]);

  // Save messages whenever they change (but skip the initial load)
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    // Only save if we have more than the initial greeting
    if (messages.length > 1) {
      saveChat(persona.id, messages);
    }
  }, [messages, persona.id]);

  // Check AI provider status on mount
  useEffect(() => {
    checkAIStatus();
  }, []);

  const handleClearChat = () => {
    clearChat(persona.id);
    setMessages([getInitialMessage()]);
  };

  const checkAIStatus = async () => {
    try {
      const response = await fetch('/api/chat', {
        method: 'GET',
      });
      if (response.ok) {
        const data = await response.json();
        setAiProvider(data.provider);
        setProviderStatus(data.status);
        setProviderName(data.name);
      } else {
        setProviderStatus('mock');
        setAiProvider('mock');
        setProviderName('Mock (Offline)');
      }
    } catch {
      setProviderStatus('mock');
      setAiProvider('mock');
      setProviderName('Mock (Offline)');
    }
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

    const personaMessageId = (Date.now() + 1).toString();

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
          stream: true,
        }),
      });

      if (response.ok && response.body) {
        // Check which provider was used from header
        const usedProvider = response.headers.get('X-AI-Provider') as AIProvider;
        if (usedProvider) {
          setAiProvider(usedProvider);
        }

        // Add empty persona message that we'll stream into
        setMessages((prev) => [...prev, {
          id: personaMessageId,
          role: 'persona',
          content: '',
        }]);
        setIsTyping(false);

        // Read the SSE stream
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let streamedContent = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n').filter(line => line.startsWith('data: '));

          for (const line of lines) {
            try {
              const jsonStr = line.replace('data: ', '');
              const data = JSON.parse(jsonStr);
              
              if (data.token) {
                streamedContent += data.token;
                // Update the message content in real-time
                setMessages((prev) => prev.map((msg) =>
                  msg.id === personaMessageId
                    ? { ...msg, content: streamedContent }
                    : msg
                ));
              }
            } catch {
              // Skip malformed JSON
            }
          }
        }
      } else {
        // API failed - show error message
        setMessages((prev) => [...prev, {
          id: personaMessageId,
          role: 'persona',
          content: "I'm having trouble connecting right now. Please try again in a moment.",
        }]);
        setIsTyping(false);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [...prev, {
        id: personaMessageId,
        role: 'persona',
        content: "I'm having trouble connecting right now. Please try again in a moment.",
      }]);
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getStatusIcon = () => {
    switch (aiProvider) {
      case 'gemini':
        return <Sparkles className="h-3 w-3 text-blue-500" />;
      case 'ollama':
        return <Wifi className="h-3 w-3 text-green-500" />;
      default:
        return <WifiOff className="h-3 w-3 text-amber-500" />;
    }
  };

  const getStatusColor = () => {
    switch (aiProvider) {
      case 'gemini':
        return 'text-blue-600';
      case 'ollama':
        return 'text-green-600';
      default:
        return 'text-amber-600';
    }
  };

  return (
    <div className="flex flex-col h-[400px]">
      {/* Status indicator */}
      <div className="flex items-center justify-between px-4 py-2 border-b text-xs">
        <div className="flex items-center gap-2">
          {providerStatus === 'checking' ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin text-gray-400" />
              <span className="text-gray-500">Checking AI...</span>
            </>
          ) : (
            <>
              {getStatusIcon()}
              <span className={getStatusColor()}>{providerName}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={checkAIStatus}
            className="text-blue-500 hover:underline"
          >
            Refresh
          </button>
          {messages.length > 1 && (
            <button
              onClick={handleClearChat}
              className="flex items-center gap-1 text-gray-500 hover:text-red-500 transition-colors"
              title="Clear chat history"
            >
              <Trash2 className="h-3 w-3" />
              <span>Clear</span>
            </button>
          )}
        </div>
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

      {/* Quick Suggestions - shown throughout conversation */}
      {!isTyping && (
        <div className="px-4 py-2 border-t bg-gray-50 dark:bg-gray-800/50">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            {messages.length <= 1 ? 'Quick questions:' : 'Follow up:'}
          </p>
          <div className="flex flex-wrap gap-2">
            {getContextualSuggestions(persona, messages).map((suggestion, index) => (
              <button
                key={index}
                onClick={() => {
                  setInput(suggestion);
                }}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all hover:scale-105 ${colors.bg} ${colors.text} hover:shadow-sm`}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

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

// Topic-based follow-up suggestions
const topicFollowUps: Record<string, string[]> = {
  stress: [
    "How do you cope with that?",
    "What would help reduce that stress?",
    "Does your manager know about this?",
  ],
  motivation: [
    "What's a recent win you're proud of?",
    "What would make you even more motivated?",
    "Do you feel recognized for your work?",
  ],
  communication: [
    "What's an example of good communication you've received?",
    "What's the worst way someone communicated with you?",
    "Do you prefer async or real-time communication?",
  ],
  work: [
    "What's your typical day like?",
    "What part of your job do you enjoy most?",
    "What would you change about your role?",
  ],
  team: [
    "How's your relationship with your manager?",
    "Do you feel part of the team?",
    "What makes a good teammate in your view?",
  ],
  frustration: [
    "Has this always been an issue?",
    "What would fix this?",
    "Who could help with that?",
  ],
  general: [
    "Tell me more about that",
    "Why do you think that is?",
    "How does that affect your work?",
  ],
};

// Initial suggestions for new conversations
const initialSuggestions = [
  "What stresses you most at work?",
  "How do you prefer to receive updates?",
  "What motivates you?",
  "What's the best way to communicate with you?",
];

// Generate contextual suggestions based on conversation
function getContextualSuggestions(persona: Persona, messages: Message[]): string[] {
  // For new conversations, show initial suggestions
  if (messages.length <= 1) {
    return initialSuggestions;
  }

  // Get the last persona message to determine context
  const lastPersonaMessage = [...messages].reverse().find(m => m.role === 'persona');
  if (!lastPersonaMessage) {
    return initialSuggestions;
  }

  const content = lastPersonaMessage.content.toLowerCase();
  
  // Detect topic from last message
  let suggestions: string[] = [];
  
  if (content.includes('stress') || content.includes('frustrat') || content.includes('overwhelm') || content.includes('pressure')) {
    suggestions = topicFollowUps.stress;
  } else if (content.includes('motivat') || content.includes('excit') || content.includes('passion') || content.includes('love')) {
    suggestions = topicFollowUps.motivation;
  } else if (content.includes('communicat') || content.includes('email') || content.includes('meeting') || content.includes('slack') || content.includes('message')) {
    suggestions = topicFollowUps.communication;
  } else if (content.includes('team') || content.includes('colleague') || content.includes('manager') || content.includes('coworker')) {
    suggestions = topicFollowUps.team;
  } else if (content.includes('annoy') || content.includes('hate') || content.includes('problem') || content.includes('issue') || content.includes('difficult')) {
    suggestions = topicFollowUps.frustration;
  } else if (content.includes('work') || content.includes('job') || content.includes('project') || content.includes('task')) {
    suggestions = topicFollowUps.work;
  } else {
    suggestions = topicFollowUps.general;
  }

  // Add one persona-specific suggestion
  const personaSpecific = [
    `What's something people misunderstand about ${persona.generation}s at work?`,
    `As a ${persona.role}, what's your biggest challenge?`,
  ];
  
  // Return 3 suggestions: 2 contextual + 1 persona-specific
  return [...suggestions.slice(0, 2), personaSpecific[Math.floor(Math.random() * personaSpecific.length)]];
}
