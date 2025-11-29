import { useRef, useEffect, useState } from 'react';
import { ChatMessage } from '@/components/ChatMessage';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { BreathingGlow } from '@/components/BreathingGlow';
import { cn } from '@/lib/utils';
import type { Message } from '@/lib/session-store';

interface SessionChatProps {
  messages: Message[];
  onPlayAudio?: (messageId: string) => void;
  playingMessageId?: string | null;
  loadingAudioMessageId?: string | null;
  generatingMessageId?: string | null;
  className?: string;
  onFeedback?: (feedback: 'positive' | 'negative') => void;
}

export function SessionChat({
  messages,
  onPlayAudio,
  playingMessageId,
  loadingAudioMessageId,
  generatingMessageId,
  className,
  onFeedback,
}: SessionChatProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [feedback, setFeedback] = useState<'positive' | 'negative' | null>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleFeedback = (type: 'positive' | 'negative') => {
    setFeedback(type);
    onFeedback?.(type);
  };

  const hasAssistantMessages = messages.some(m => m.role === 'assistant' && m.content);
  const isGenerating = generatingMessageId !== null;
  const showFeedback = hasAssistantMessages && !isGenerating && feedback === null;

  if (messages.length === 0) {
    return (
      <div className={cn(
        "flex flex-col items-center justify-center text-center py-12 px-6 relative overflow-visible",
        className
      )}>
        {/* Breathing glow behind text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[1]" style={{ overflow: 'visible', padding: '100px' }}>
          <BreathingGlow />
        </div>
        
        {/* Text content */}
        <div className="relative z-10">
          <h3 className="text-xl font-medium text-foreground mb-2">
            Your safe space to reflect
          </h3>
          <p className="text-muted-foreground max-w-sm">
            Speak or type your thoughts. Your reflections never leave your device.
          </p>
        </div>
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
          isPlaying={playingMessageId === message.id}
          isLoadingAudio={loadingAudioMessageId === message.id}
          isGenerating={generatingMessageId === message.id}
          className={`animation-delay-${(index % 5) * 100}`}
        />
      ))}
      
      {/* Feedback buttons */}
      {showFeedback && (
        <div className="flex flex-col items-center gap-3 pt-4 pb-2 animate-fade-up">
          <p className="text-sm text-muted-foreground">How helpful was this session?</p>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleFeedback('positive')}
              className="h-10 w-10 rounded-full bg-primary/15 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              <ThumbsUp className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleFeedback('negative')}
              className="h-10 w-10 rounded-full bg-primary/15 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              <ThumbsDown className="w-5 h-5" />
            </Button>
          </div>
        </div>
      )}
      
      {feedback && (
        <div className="flex justify-center pt-2 pb-2">
          <p className="text-xs text-muted-foreground">
            {feedback === 'positive' ? '✓ Thank you for your feedback!' : '✓ We appreciate your feedback and will work to improve.'}
          </p>
        </div>
      )}
    </div>
  );
}
