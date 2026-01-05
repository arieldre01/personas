'use client';

import { User, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div
      className={cn(
        'flex gap-3 p-4 rounded-lg',
        isUser
          ? 'bg-blue-50 dark:bg-blue-950/30'
          : 'bg-gray-50 dark:bg-gray-800/50'
      )}
    >
      <div
        className={cn(
          'flex h-8 w-8 items-center justify-center rounded-full flex-shrink-0',
          isUser
            ? 'bg-blue-500 text-white'
            : 'bg-purple-500 text-white'
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
          {isUser ? 'You' : 'Persona AI'}
        </p>
        <div className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
          {message.content}
        </div>
      </div>
    </div>
  );
}

