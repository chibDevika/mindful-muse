import { useState } from 'react';
import { ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Message } from '@/lib/session-store';

interface SessionSummaryProps {
  insights: Message[];
  className?: string;
}

export function SessionSummary({ insights, className }: SessionSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (insights.length === 0) return null;

  return (
    <div className={cn(
      "rounded-2xl bg-gentle border border-primary/20 overflow-hidden transition-all duration-300",
      className
    )}>
      <Button
        variant="ghost"
        className="w-full flex items-center justify-between px-4 py-3 h-auto hover:bg-transparent"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="font-medium text-foreground">Session Insights</span>
          <span className="text-xs text-muted-foreground">
            ({insights.length} reflection{insights.length !== 1 ? 's' : ''})
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </Button>

      <div
        className={cn(
          "grid transition-all duration-300",
          isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          <div className="flex flex-col gap-3 p-4 pt-0">
            {insights.map((insight, index) => (
              <div
                key={insight.id}
                className="p-3 rounded-xl bg-card border border-border text-sm"
              >
                <div className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                    {index + 1}
                  </span>
                  <p className="text-foreground line-clamp-3">
                    {insight.content.slice(0, 150)}
                    {insight.content.length > 150 ? '...' : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
