import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

export type ChatMessageType = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={cn(
      'flex gap-3 mb-4',
      isUser ? 'flex-row-reverse' : 'flex-row'
    )}>
      <Avatar className={cn(
        'h-8 w-8',
        isUser ? 'bg-blue-500' : 'bg-[#1752FF]'
      )}>
        <AvatarFallback className="text-white">
          {isUser ? 'U' : 'R'}
        </AvatarFallback>
      </Avatar>
      
      <div className={cn(
        'rounded-lg px-4 py-2 max-w-[80%]',
        isUser ? 'bg-[#1752FF] text-white' : 'bg-neutral-100'
      )}>
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
      </div>
    </div>
  );
}