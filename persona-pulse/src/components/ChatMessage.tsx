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

// Simple function to format message content with basic styling
function formatContent(content: string, isUser: boolean) {
  if (isUser) {
    return <span>{content}</span>;
  }

  // Split by newlines and render each part
  const lines = content.split('\n');
  
  return (
    <div className="space-y-2">
      {lines.map((line, i) => {
        if (!line.trim()) return null;
        
        // Check if it's a quote (starts and ends with quotes)
        if (line.startsWith('"') && line.endsWith('"')) {
          return (
            <p key={i} className="italic text-gray-600 dark:text-gray-400 border-l-2 border-teal-400 pl-3 my-2">
              {line}
            </p>
          );
        }
        
        // Check if it's the confidence line
        if (line.toLowerCase().includes('match confidence:')) {
          const match = line.match(/(\d+)%/);
          const percent = match ? parseInt(match[1]) : 0;
          return (
            <div key={i} className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Match confidence:</span>
                <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden max-w-[120px]">
                  <div 
                    className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <span className="text-sm font-semibold text-teal-600 dark:text-teal-400">{percent}%</span>
              </div>
            </div>
          );
        }
        
        // Check if it's the persona match line (contains name and title)
        if (line.includes(' - "') && line.includes('align with')) {
          const nameMatch = line.match(/align with (.+?) - "(.+?)"/);
          if (nameMatch) {
            return (
              <p key={i} className="text-base">
                Based on your description, you align with{' '}
                <span className="font-bold text-teal-600 dark:text-teal-400">{nameMatch[1]}</span>
                {' - '}
                <span className="font-medium">"{nameMatch[2]}"</span>!
              </p>
            );
          }
        }
        
        // Regular line
        return <p key={i}>{line}</p>;
      })}
    </div>
  );
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div
      className={cn(
        'flex gap-3 p-4 rounded-lg message-enter',
        isUser
          ? 'bg-blue-50 dark:bg-blue-950/30'
          : 'bg-gradient-to-br from-gray-50 to-teal-50/30 dark:from-gray-800/50 dark:to-teal-900/20'
      )}
    >
      <div
        className={cn(
          'flex h-8 w-8 items-center justify-center rounded-full flex-shrink-0',
          isUser
            ? 'bg-blue-500 text-white'
            : 'bg-gradient-to-br from-teal-500 to-emerald-500 text-white'
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
          {isUser ? 'You' : 'Persona Finder'}
        </p>
        <div className="text-gray-800 dark:text-gray-200">
          {formatContent(message.content, isUser)}
        </div>
      </div>
    </div>
  );
}

