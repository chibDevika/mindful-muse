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
      "flex flex-col items-center justify-center min-h-screen px-6 py-12 gradient-calm",
      className
    )}>
      {/* Hero image */}
      <div className="relative w-full max-w-lg mb-8 animate-fade-up">
        <img
          src={heroImage}
          alt="A serene moment of reflection"
          className="w-full h-auto rounded-3xl shadow-card object-cover max-h-[300px]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent rounded-3xl" />
      </div>

      {/* Main heading */}
      <div className="text-center mb-12 animate-fade-up animation-delay-100">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Heart className="w-6 h-6 text-support fill-support/30" />
          <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Unwind
          </span>
        </div>
        
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-foreground mb-4 leading-tight">
          What are you feeling<br />right now?
        </h1>
        
        <p className="text-lg text-muted-foreground max-w-md mx-auto">
          Share what's on your mind. We're here to listen and reflect with you.
        </p>
      </div>

      {/* Decorative waveform */}
      <StaticWaveform className="w-full max-w-sm mb-12 opacity-50 animate-fade-up animation-delay-200" />

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-md animate-fade-up animation-delay-300">
        <Button
          variant="support"
          size="xl"
          onClick={onStartRecording}
          className="w-full sm:w-auto flex-1 gap-3"
        >
          <Mic className="w-5 h-5" />
          Record your thoughts
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
      <p className="mt-8 text-xs text-muted-foreground text-center max-w-xs animate-fade-up animation-delay-400">
        Your conversations stay on your device. We don't store or share your personal reflections.
      </p>
    </div>
  );
}
