import { useRef, useEffect } from 'react';
import { ChatMessage } from '@/components/ChatMessage';
import { cn } from '@/lib/utils';
import type { Message } from '@/lib/session-store';
import emptyStateImage from '@/assets/empty-state.png';

interface SessionChatProps {
  messages: Message[];
  onPlayAudio?: (messageId: string) => void;
  onEditMessage?: (messageId: string, newContent: string) => void;
  playingMessageId?: string | null;
  loadingAudioMessageId?: string | null;
  generatingMessageId?: string | null;
  className?: string;
}

export function SessionChat({
  messages,
  onPlayAudio,
  onEditMessage,
  playingMessageId,
  loadingAudioMessageId,
  generatingMessageId,
  className,
}: SessionChatProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className={cn(
        "flex flex-col items-center justify-center text-center py-12 px-6",
        className
      )}>
        <img
          src={emptyStateImage}
          alt="Start a conversation"
          className="w-48 h-48 object-contain opacity-80 mb-6 animate-float"
        />
        <h3 className="text-xl font-medium text-foreground mb-2">
          Your safe space to reflect
        </h3>
        <p className="text-muted-foreground max-w-sm">
          Share what's on your mind — by voice or text. This conversation stays on your device.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      className={cn(
        "flex flex-col gap-4 overflow-y-auto scroll-smooth",
        className
      )}
    >
      {messages.map((message, index) => (
        <ChatMessage
          key={message.id}
          message={message}
          onPlayAudio={onPlayAudio}
          onEditMessage={message.role === 'user' ? onEditMessage : undefined}
          isPlaying={playingMessageId === message.id}
          isLoadingAudio={loadingAudioMessageId === message.id}
          isGenerating={generatingMessageId === message.id}
          className={`animation-delay-${(index % 5) * 100}`}
        />
      ))}
    </div>
  );
}
