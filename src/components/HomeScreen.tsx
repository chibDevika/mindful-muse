import { Mic, MessageSquare, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StaticWaveform } from '@/components/AudioWaveform';
import { cn } from '@/lib/utils';
import heroImage from '@/assets/hero-illustration.png';

interface HomeScreenProps {
  onStartRecording: () => void;
  onStartTyping: () => void;
  className?: string;
}

export function HomeScreen({ onStartRecording, onStartTyping, className }: HomeScreenProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center min-h-screen px-6 py-16 gradient-calm",
      className
    )}>
      {/* Hero image */}
      <div className="relative w-full max-w-md mb-10 animate-fade-up">
        <img
          src={heroImage}
          alt="A serene moment of reflection"
          className="w-full h-auto rounded-4xl shadow-card object-cover max-h-[280px]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent rounded-4xl" />
      </div>

      {/* Main heading */}
      <div className="text-center mb-14 animate-fade-up animation-delay-100">
        <div className="flex items-center justify-center gap-2.5 mb-5">
          <Heart className="w-5 h-5 text-support fill-support/20 animate-gentle-pulse" />
          <span className="text-sm font-medium text-muted-foreground tracking-widest uppercase">
            Unwind
          </span>
        </div>
        
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-foreground mb-5 leading-relaxed tracking-tight">
          How are you feeling<br />right now?
        </h1>
        
        <p className="text-lg text-muted-foreground max-w-sm mx-auto leading-relaxed">
          Take a moment. Share what's on your mind — we're here to listen.
        </p>
      </div>

      {/* Decorative waveform */}
      <StaticWaveform className="w-full max-w-xs mb-14 opacity-40 animate-fade-up animation-delay-200" />

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-sm animate-fade-up animation-delay-300">
        <Button
          variant="support"
          size="xl"
          onClick={onStartRecording}
          className="w-full sm:w-auto flex-1 gap-3 shadow-soft"
        >
          <Mic className="w-5 h-5" />
          Record thoughts
        </Button>
        
        <Button
          variant="calm"
          size="xl"
          onClick={onStartTyping}
          className="w-full sm:w-auto flex-1 gap-3"
        >
          <MessageSquare className="w-5 h-5" />
          Type instead
        </Button>
      </div>

      {/* Privacy note */}
      <p className="mt-10 text-xs text-muted-foreground/80 text-center max-w-xs animate-fade-up animation-delay-400 leading-relaxed">
        Your reflections stay on your device. Private and secure.
      </p>
    </div>
  );
}
