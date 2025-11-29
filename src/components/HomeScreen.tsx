import { Mic, MessageSquare, Heart, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UnwindLogo } from '@/components/UnwindLogo';
import { FloatingLeaves } from '@/components/FloatingLeaves';
import { BreathingGlow } from '@/components/BreathingGlow';
import { cn } from '@/lib/utils';
import leafyBg from '@/assets/leafy-bg.png';

interface HomeScreenProps {
  onStartRecording: () => void;
  onStartTyping: () => void;
  className?: string;
}

export function HomeScreen({ onStartRecording, onStartTyping, className }: HomeScreenProps) {
  return (
    <div 
      className={cn(
        "flex flex-col min-h-screen px-6 py-16 relative overflow-visible",
        className
      )}
      style={{
        backgroundImage: `url(${leafyBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Overlay for readability */}
      <div className="absolute inset-0 bg-background/60 pointer-events-none z-0" />
      
      {/* Floating leaves animation */}
      <FloatingLeaves />
      
      {/* Breathing glow - positioned before content but after overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[1] overflow-visible">
        <BreathingGlow />
      </div>
      
      {/* Help button - bottom right corner (outside content div for proper positioning) */}
      <div className="fixed bottom-6 right-6 z-50 group">
        <button
          className="relative p-3 rounded-full bg-primary/25 text-primary hover:bg-primary/35 transition-all duration-200 shadow-card backdrop-blur-sm border border-primary/20"
          aria-label="Get help"
        >
          <HelpCircle className="w-6 h-6" />
          
          {/* Tooltip on hover */}
          <div className="absolute bottom-full right-0 mb-3 px-4 py-2.5 bg-card border border-border rounded-lg shadow-card opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
            <p className="text-sm text-foreground">
              Reach out to{' '}
              <a 
                href="mailto:devikachib13@gmail.com" 
                className="text-primary hover:underline pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
              >
                devikachib13@gmail.com
              </a>
              {' '}for help
            </p>
            {/* Tooltip arrow */}
            <div className="absolute top-full right-4 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-transparent border-t-border"></div>
            <div className="absolute top-full right-4 mt-[-1px] w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-transparent border-t-card"></div>
          </div>
        </button>
      </div>
      
      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Logo and Unwind text - top left corner */}
        <div className="flex items-center gap-2 absolute top-0 left-0 p-4 animate-wave-in">
          <UnwindLogo size={32} className="text-gentle" />
          <span className="font-heading text-base font-medium text-foreground tracking-widest uppercase">
            Unwind
          </span>
        </div>

        {/* Main content - centered */}
        <div className="flex flex-col items-center justify-center flex-1 relative overflow-visible">
        {/* Main heading */}
        <div className="text-center mb-14 animate-wave-in animation-delay-200 relative z-10">
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-medium text-foreground mb-5 leading-relaxed tracking-tight">
            How are you feeling<br />right now?
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-sm mx-auto leading-relaxed">
            Take a moment. Share what's on your mind — we're here to listen.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-sm mx-auto animate-wave-in animation-delay-400">
          <Button
            variant="gentle"
            size="xl"
            onClick={onStartRecording}
            className="w-full sm:w-auto gap-3 shadow-soft"
          >
            <Mic className="w-5 h-5" />
            Talk it out
          </Button>
          
          <Button
            variant="calm"
            size="xl"
            onClick={onStartTyping}
            className="w-full sm:w-auto gap-3"
          >
            <MessageSquare className="w-5 h-5" />
            Write it down
          </Button>
        </div>

          {/* Privacy note */}
          <p className="mt-10 text-xs text-muted-foreground/80 text-center max-w-xs animate-wave-in animation-delay-500 leading-relaxed">
            Your reflections stay on your device. Private and secure.
          </p>
        </div>
      </div>
    </div>
  );
}
