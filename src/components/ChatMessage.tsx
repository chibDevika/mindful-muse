import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Copy, Share2, Check, Volume2, Loader2, Edit2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { Message } from '@/lib/session-store';

interface ChatMessageProps {
  message: Message;
  onPlayAudio?: (messageId: string) => void;
  onEditMessage?: (messageId: string, newContent: string) => void;
  isPlaying?: boolean;
  isLoadingAudio?: boolean;
  isGenerating?: boolean;
  className?: string;
}

export function ChatMessage({
  message,
  onPlayAudio,
  onEditMessage,
  isPlaying,
  isLoadingAudio,
  isGenerating,
  className,
}: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(message.content);

  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  useEffect(() => {
    setEditedContent(message.content);
  }, [message.content]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        text: message.content,
        title: 'Unwind - Reflection',
      });
    } else {
      handleCopy();
    }
  };

  const handleSaveEdit = () => {
    if (editedContent.trim() && onEditMessage) {
      onEditMessage(message.id, editedContent.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedContent(message.content);
    setIsEditing(false);
  };

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
        {/* Editing state */}
        {isEditing ? (
          <div className="flex flex-col gap-3">
            <Textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className={cn(
                "min-h-[80px] resize-none border-0 bg-transparent p-0 focus-visible:ring-0",
                isUser ? "text-primary-foreground placeholder:text-primary-foreground/60" : ""
              )}
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancelEdit}
                className={isUser ? "text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10" : ""}
              >
                <X className="w-4 h-4 mr-1" />
                Cancel
              </Button>
              <Button
                variant={isUser ? "secondary" : "default"}
                size="sm"
                onClick={handleSaveEdit}
              >
                Save
              </Button>
            </div>
          </div>
        ) : (
          <>
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

            {/* Message actions */}
            {!isGenerating && (
              <div className={cn(
                "flex items-center gap-1 mt-3 pt-3 border-t",
                isUser ? "border-primary-foreground/20" : "border-border"
              )}>
                {/* User message: Edit button */}
                {isUser && onEditMessage && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className={cn(
                      "h-8 px-2",
                      isUser ? "text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10" : ""
                    )}
                  >
                    <Edit2 className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                )}

                {/* Assistant message: Audio controls */}
                {isAssistant && onPlayAudio && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onPlayAudio(message.id)}
                      disabled={isLoadingAudio}
                      className="h-8 px-2"
                    >
                      {isLoadingAudio ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-1" />
                      ) : isPlaying ? (
                        <Pause className="w-4 h-4 mr-1" />
                      ) : (
                        <Play className="w-4 h-4 mr-1" />
                      )}
                      {isPlaying ? 'Pause' : 'Play'}
                    </Button>

                    {message.audioUrl && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onPlayAudio(message.id)}
                        className="h-8 px-2"
                      >
                        <RotateCcw className="w-4 h-4 mr-1" />
                        Replay
                      </Button>
                    )}
                  </>
                )}

                {/* Copy button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  className={cn(
                    "h-8 px-2",
                    isUser ? "text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10" : ""
                  )}
                >
                  {copied ? (
                    <Check className="w-4 h-4 mr-1" />
                  ) : (
                    <Copy className="w-4 h-4 mr-1" />
                  )}
                  {copied ? 'Copied!' : 'Copy'}
                </Button>

                {/* Share button (assistant only) */}
                {isAssistant && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleShare}
                    className="h-8 px-2"
                  >
                    <Share2 className="w-4 h-4 mr-1" />
                    Share
                  </Button>
                )}
              </div>
            )}

            {/* Edited indicator */}
            {message.isEdited && !isEditing && (
              <span className={cn(
                "text-xs mt-2 block",
                isUser ? "text-primary-foreground/50" : "text-muted-foreground"
              )}>
                (edited)
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
}
