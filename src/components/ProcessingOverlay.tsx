import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProcessingOverlayProps {
  isVisible: boolean;
  message?: string;
  className?: string;
}

export function ProcessingOverlay({
  isVisible,
  message = "Thoughtfully responding...",
  className,
}: ProcessingOverlayProps) {
  if (!isVisible) return null;

  return (
    <div className={cn(
      "fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-fade-in",
      className
    )}>
      <div className="flex flex-col items-center gap-6 p-8 rounded-3xl bg-card border border-border shadow-card animate-fade-up">
        {/* Breathing animation */}
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-support/20 animate-breathe" />
          <Loader2 className="absolute inset-0 m-auto w-8 h-8 text-primary animate-spin" />
        </div>

        {/* Message */}
        <div className="text-center">
          <p className="text-lg font-medium text-foreground">{message}</p>
          <p className="text-sm text-muted-foreground mt-1">
            We'll listen and reflect — this session stays on your device.
          </p>
        </div>

        {/* Skeleton preview */}
        <div className="w-64 space-y-3">
          <div className="h-3 bg-muted rounded-full animate-pulse" />
          <div className="h-3 bg-muted rounded-full animate-pulse w-4/5" />
          <div className="h-3 bg-muted rounded-full animate-pulse w-3/5" />
        </div>
      </div>
    </div>
  );
}

// Inline skeleton for chat
export function MessageSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex justify-start", className)}>
      <div className="max-w-[85%] rounded-3xl rounded-bl-lg px-5 py-4 bg-card border border-border shadow-card">
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded-full animate-pulse w-48" />
          <div className="h-4 bg-muted rounded-full animate-pulse w-64" />
          <div className="h-4 bg-muted rounded-full animate-pulse w-40" />
        </div>
        <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Thoughtfully responding...</span>
        </div>
      </div>
    </div>
  );
}
