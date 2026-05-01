'use client';

import {useEffect, useRef} from 'react';
import {cn} from '@/lib/utils';
import {type Message, type Settings} from '@/lib/types';
import {ChatMessage} from './chat-message';
import {ThinkingAnimation} from './thinking-animation';

interface ChatMessagesProps extends React.HTMLAttributes<HTMLDivElement> {
  messages: Message[];
  isLoading?: boolean;
  onRegenerateMessage?: (messageId: string) => void;
  settings: Settings;
}

export function ChatMessages({
  messages,
  isLoading,
  className,
  onRegenerateMessage,
  settings,
}: ChatMessagesProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevMessagesLengthRef = useRef(messages.length);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    // Auto-scroll when new messages are added or loading state changes
    if (messages.length > prevMessagesLengthRef.current || isLoading) {
      // Small delay to ensure DOM is updated
      setTimeout(scrollToBottom, 100);
    }
    prevMessagesLengthRef.current = messages.length;
  }, [messages.length, isLoading]);

  // Also scroll on mount if there are messages
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, []);

  return (
    <div 
      ref={scrollRef}
      className={cn('w-full flex-1 overflow-y-auto overflow-x-hidden scroll-smooth custom-scrollbar', className)}
    >
      <div className="mx-auto w-full max-w-5xl px-3 py-4 md:px-5 md:py-6 lg:px-8">
        <div className="space-y-6 md:space-y-8">
          {messages.map((message, index) => (
            <ChatMessage 
              key={message.id} 
              message={message}
              settings={settings}
              onRegenerate={
                message.role === 'assistant' && index === messages.length - 1 && onRegenerateMessage
                  ? () => onRegenerateMessage(message.id)
                  : undefined
              }
            />
          ))}
          {isLoading && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <ThinkingAnimation />
            </div>
          )}
        </div>
        {/* Invisible anchor for scrolling */}
        <div className="h-4 w-full" />
      </div>
    </div>
  );
}
