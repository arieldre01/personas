'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Persona, generationColors } from '@/lib/personas';
import { getFullPersonaContext } from '@/lib/persona-prompts';
import { Send, Loader2, Wifi, WifiOff, Trash2, Sparkles, RefreshCw, MessageCircle } from 'lucide-react';
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
  const [failedMessageId, setFailedMessageId] = useState<string | null>(null);
  const [lastFailedUserMessage, setLastFailedUserMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const colors = generationColors[persona.generation];
  const personaContext = getFullPersonaContext(persona);

  const scrollToBottom = (immediate = false) => {
    if (immediate) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' });
    } else {
      // Small delay for smoother scrolling during streaming
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 50);
    }
  };

  // Scroll on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Scroll on initial load
  useEffect(() => {
    scrollToBottom(true);
  }, []);

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

  const sendMessage = async (messageContent: string, isRetry = false) => {
    if (!messageContent.trim() || isTyping) return;

    // Clear any previous failed state
    setFailedMessageId(null);
    setLastFailedUserMessage(null);

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageContent.trim(),
    };

    if (!isRetry) {
      setMessages((prev) => [...prev, userMessage]);
      setInput('');
    }
    setIsTyping(true);

    const personaMessageId = (Date.now() + 1).toString();

    try {
      // Build conversation history for context
      const currentMessages = isRetry ? messages : [...messages, userMessage];
      const conversationHistory = currentMessages
        .filter(m => !m.content.includes("I'm having trouble connecting"))
        .map((m) => `${m.role === 'user' ? 'User' : persona.name}: ${m.content}`)
        .join('\n');

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `${conversationHistory}\nUser: ${messageContent}`,
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

        // If retrying, remove the failed message first
        if (isRetry) {
          setMessages((prev) => prev.filter(m => m.id !== failedMessageId));
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
        // API failed - show error message with retry option
        const errorMessageId = personaMessageId;
        setMessages((prev) => [...prev, {
          id: errorMessageId,
          role: 'persona',
          content: "I'm having trouble connecting right now.",
        }]);
        setFailedMessageId(errorMessageId);
        setLastFailedUserMessage(messageContent);
        setIsTyping(false);
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessageId = personaMessageId;
      setMessages((prev) => [...prev, {
        id: errorMessageId,
        role: 'persona',
        content: "I'm having trouble connecting right now.",
      }]);
      setFailedMessageId(errorMessageId);
      setLastFailedUserMessage(messageContent);
      setIsTyping(false);
    }
  };

  const handleSend = async () => {
    await sendMessage(input);
  };

  const handleRetry = async () => {
    if (lastFailedUserMessage) {
      await sendMessage(lastFailedUserMessage, true);
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
    <div className="flex flex-col h-full min-h-[400px]">
      {/* Status indicator */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-2 border-b text-xs">
        <div className="flex items-center gap-2">
          {providerStatus === 'checking' ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin text-gray-400" />
              <span className="text-gray-500">Checking AI...</span>
            </>
          ) : (
            <>
              <div className={`relative ${aiProvider !== 'mock' ? 'animate-pulse' : ''}`}>
                <div className={`absolute inset-0 rounded-full ${aiProvider === 'gemini' ? 'bg-blue-400' : aiProvider === 'ollama' ? 'bg-green-400' : ''} opacity-40 blur-sm`} />
                <div className="relative">
                  {getStatusIcon()}
                </div>
              </div>
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
      <div 
        ref={messagesContainerRef}
        className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 scroll-smooth"
      >
        {/* Empty State - shown when only initial greeting exists */}
        {messages.length === 1 && !isTyping && (
          <div className="flex flex-col items-center justify-center py-8 text-center animate-fade-in">
            <div className="relative mb-4">
              <div className="h-20 w-20 rounded-full overflow-hidden ring-4 ring-gray-100 dark:ring-gray-700 shadow-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getPersonaImage(persona)}
                  alt={persona.name}
                  className="h-full w-full object-cover"
                  style={{ objectPosition: getPersonaImagePosition(persona) }}
                />
              </div>
              <div className={`absolute -bottom-1 -right-1 p-1.5 rounded-full ${colors.badge} shadow-md`}>
                <MessageCircle className="h-4 w-4 text-white" />
              </div>
            </div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">
              Chat with {persona.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-[250px]">
              Ask about their work style, communication preferences, or what motivates them.
            </p>
          </div>
        )}

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
            <div className="flex flex-col gap-1">
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${
                  message.role === 'user'
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-md'
                    : `${colors.bg} ${colors.text} rounded-bl-md border border-gray-100 dark:border-gray-700`
                } ${message.id === failedMessageId ? 'border-red-300 dark:border-red-700' : ''}`}
              >
                {message.role === 'persona' && (
                  <p className="text-xs font-semibold opacity-80 mb-1">{persona.name}</p>
                )}
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
              </div>
              
              {/* Retry button for failed messages */}
              {message.id === failedMessageId && (
                <button
                  onClick={handleRetry}
                  className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600 transition-colors self-start ml-1"
                >
                  <RefreshCw className="h-3 w-3" />
                  <span>Retry</span>
                </button>
              )}
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

      {/* Quick Suggestions + Input - grouped together */}
      <div className="flex-shrink-0 border-t bg-gray-50 dark:bg-gray-900/50 px-5 pt-3 pb-5">
        {/* Suggestions */}
        {!isTyping && (
          <div className="mb-3">
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
                  onDoubleClick={() => {
                    sendMessage(suggestion);
                  }}
                  title="Click to fill, double-click to send"
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all hover:scale-105 active:scale-95 ${colors.bg} ${colors.text} hover:shadow-sm cursor-pointer select-none`}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="flex gap-3 items-end">
          <Textarea
            placeholder={`Message ${persona.name}...`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-[72px] max-h-[150px] resize-none text-base py-3 px-4"
            rows={2}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            size="icon"
            className={`${colors.badge} h-[72px] w-[72px] rounded-xl`}
          >
            {isTyping ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <Send className="h-6 w-6" />
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
