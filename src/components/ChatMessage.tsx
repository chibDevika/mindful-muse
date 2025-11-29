import { Play, Pause, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Message } from '@/lib/session-store';

interface ChatMessageProps {
  message: Message;
  onPlayAudio?: (messageId: string) => void;
  isPlaying?: boolean;
  isLoadingAudio?: boolean;
  isGenerating?: boolean;
  className?: string;
}

export function ChatMessage({
  message,
  onPlayAudio,
  isPlaying,
  isLoadingAudio,
  isGenerating,
  className,
}: ChatMessageProps) {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  return (
    <div
      className={cn(
        "flex gap-3 animate-fade-up",
        isUser ? "justify-end" : "justify-start",
        className
      )}
    >
      <div
        className={cn(
          "relative max-w-[85%] rounded-3xl px-5 py-4 shadow-card",
          isUser
            ? "bg-primary text-primary-foreground rounded-br-lg"
            : "bg-card border border-border text-card-foreground rounded-bl-lg",
          isGenerating && "animate-breathe"
        )}
      >
        {/* Message content */}
        <p className="text-[15px] leading-relaxed whitespace-pre-wrap">
          {message.content}
        </p>

        {/* Generating indicator */}
        {isGenerating && (
          <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Thoughtfully responding...</span>
          </div>
        )}

        {/* Small circular Play Button at bottom-left edge of assistant messages */}
        {!isGenerating && isAssistant && onPlayAudio && (
          <div className="absolute -bottom-4 -left-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onPlayAudio(message.id)}
              disabled={isLoadingAudio}
              className={cn(
                "h-9 w-9 rounded-full transition-all duration-200 shadow-md",
                "bg-primary/15 text-primary hover:bg-accent hover:text-accent-foreground",
                "hover:scale-110 hover:shadow-lg active:scale-95",
                "border-0",
                isPlaying && "ring-2 ring-primary/30",
                isLoadingAudio && "animate-pulse"
              )}
            >
              {isLoadingAudio ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current" />
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
