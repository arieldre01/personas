'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Persona, generationColors } from '@/lib/personas';
import { Send, Loader2 } from 'lucide-react';
import { getPersonaImage } from '@/lib/personas';

interface Message {
  id: string;
  role: 'user' | 'persona';
  content: string;
}

interface PersonaChatProps {
  persona: Persona;
}

// Mock responses based on persona characteristics
function generatePersonaResponse(persona: Persona, userMessage: string): string {
  const lowerMessage = userMessage.toLowerCase();
  
  // Persona-specific responses based on their psychology
  const responses: Record<string, string[]> = {
    maya: [
      "Look, I appreciate you reaching out, but can you give me the bullet points? I have a team meeting in 10 minutes.",
      "That's interesting, but how does this help me communicate better with my team?",
      "I'm constantly in 'sandwich mode' - pressure from above and below. Just tell me what I need to know.",
      "Send me a pre-brief kit if you want me to cascade this to my team properly.",
    ],
    ben: [
      "Interesting perspective, but where's the data to back this up?",
      "I need to see the metrics before I can buy into this. What's the ROI?",
      "Skip the emotional appeal - give me the strategic rationale.",
      "This sounds like corporate fluff. Can you quantify the impact?",
    ],
    oliver: [
      "Mate, if this doesn't work on my mobile, I'm not reading it.",
      "I'm out in the field most of the day. Can you send this as a push notification?",
      "Another VPN login just to read an update? Come on...",
      "Keep it short - I'm between sites right now.",
    ],
    priya: [
      "This is a lot to take in... can you break it down for me?",
      "How does this impact my role specifically? I want to make sure I'm growing.",
      "Do you have a video or visual that explains this? That would help me understand better.",
      "I just want to make sure I'm doing the right thing. Is this something I should prioritize?",
    ],
    anna: [
      "We never got this information on our side. The acquired teams are always last to know.",
      "Half the links don't work with our access rights. It's frustrating.",
      "I'm still trying to figure out the acronyms you all use. Can you explain?",
      "We just want to feel like part of the company, not second-class employees.",
    ],
    sahil: [
      "This would be great to discuss at the next town hall! Any chance we can make it interactive?",
      "I love connecting with people on this stuff. Can we set up a social event around it?",
      "Recognition is important to me - will there be any shoutouts for people who contribute?",
      "Let's make this fun! How can we gamify it?",
    ],
    ido: [
      "You know, I've been here 15 years. I've seen initiatives come and go.",
      "Can we just have an honest conversation about this? No corporate spin?",
      "I prefer to discuss these things face-to-face, not through another email.",
      "Do they genuinely want my input, or is this just another checkbox exercise?",
    ],
    alex: [
      "What's in it for me? How does this help me close more deals?",
      "Time is money. Give me the bottom line up front.",
      "Do you have any competitor intel on this? That's what I really need.",
      "Skip the newsletter format - just give me the sales tools.",
    ],
  };

  const personaResponses = responses[persona.id] || [
    "That's an interesting point. Let me think about it.",
    "I see what you mean. How would this work in practice?",
    "Thanks for sharing. What else should I know?",
  ];

  // Check for keywords to give more relevant responses
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    return `Hi there! I'm ${persona.name}, ${persona.role}. ${persona.quote} How can I help you today?`;
  }
  
  if (lowerMessage.includes('help') || lowerMessage.includes('question')) {
    return `Sure, I'll try to help. Just remember - ${persona.psychology.motivation.toLowerCase()}. What do you need?`;
  }

  if (lowerMessage.includes('stress') || lowerMessage.includes('frustrat')) {
    return `You're touching on something I deal with daily. ${persona.psychology.stress} It's not easy, but we manage.`;
  }

  if (lowerMessage.includes('communicat') || lowerMessage.includes('prefer')) {
    const dos = persona.communication.do.join(', ');
    return `When communicating with me, please: ${dos}. That really helps me engage with the content.`;
  }

  // Random response from persona's pool
  return personaResponses[Math.floor(Math.random() * personaResponses.length)];
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const colors = generationColors[persona.generation];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

    // Simulate typing delay
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000));

    const response = generatePersonaResponse(persona, userMessage.content);
    
    const personaMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'persona',
      content: response,
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
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-white text-sm font-bold">
                  You
                </div>
              )}
            </div>

            {/* Message bubble */}
            <div
              className={`max-w-[75%] rounded-lg px-4 py-2 ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : `${colors.bg} ${colors.text}`
              }`}
            >
              {message.role === 'persona' && (
                <p className="text-xs font-medium opacity-70 mb-1">{persona.name}</p>
              )}
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-3">
            <div className="flex-shrink-0 h-8 w-8 rounded-full overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getPersonaImage(persona)}
                alt={persona.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div className={`rounded-lg px-4 py-2 ${colors.bg}`}>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
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
        <p className="text-xs text-gray-500 mt-2">
          This is a simulated conversation. AI integration coming soon!
        </p>
      </div>
    </div>
  );
}

