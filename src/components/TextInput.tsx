import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface TextInputProps {
  onSubmit: (text: string) => void;
  onStartRecording?: () => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export function TextInput({ 
  onSubmit,
  onStartRecording,
  disabled, 
  placeholder = "Type what's on your mind...",
  className 
}: TextInputProps) {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [text]);

  const handleSubmit = () => {
    const trimmedText = text.trim();
    if (trimmedText && !disabled) {
      onSubmit(trimmedText);
      setText('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className={cn(
      "relative flex items-end gap-2 p-3 rounded-2xl bg-card border border-border shadow-card transition-all duration-200",
      "focus-within:ring-2 focus-within:ring-ring focus-within:border-primary",
      className
    )}>
      <Textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        rows={1}
        className="min-h-[44px] max-h-[200px] resize-none border-0 bg-transparent p-2 pr-16 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60"
      />
      
      {/* Show mic button when no text, send button when there's text */}
      {!text.trim() && onStartRecording ? (
        <Button
          variant="ghost"
          size="icon"
          onClick={onStartRecording}
          disabled={disabled}
          className="absolute right-2 bottom-2 shrink-0 h-12 w-12 bg-primary/15 text-primary hover:bg-accent hover:text-accent-foreground transition-colors rounded-full"
        >
          <Mic className="w-6 h-6" />
        </Button>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleSubmit}
          disabled={!text.trim() || disabled}
          className="absolute right-2 bottom-2 shrink-0 h-12 w-12 bg-primary/15 text-primary hover:bg-accent hover:text-accent-foreground transition-colors rounded-full"
        >
          {disabled ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </Button>
      )}
    </div>
  );
}
