import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface AudioWaveformProps {
  analyser: AnalyserNode | null;
  isRecording: boolean;
  className?: string;
}

export function AudioWaveform({ analyser, isRecording, className }: AudioWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (!analyser || !canvasRef.current || !isRecording) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (!isRecording) return;
      
      animationRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height * 0.8;

        // Gradient from primary to accent
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - barHeight);
        gradient.addColorStop(0, 'hsl(239 84% 67% / 0.6)');
        gradient.addColorStop(1, 'hsl(173 58% 39% / 0.8)');

        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth - 2, barHeight);

        // Add rounded top
        ctx.beginPath();
        ctx.arc(x + (barWidth - 2) / 2, canvas.height - barHeight, (barWidth - 2) / 2, 0, Math.PI, true);
        ctx.fill();

        x += barWidth;
      }
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [analyser, isRecording]);

  // Static waveform when not recording
  if (!isRecording) {
    return (
      <div className={cn("flex items-center justify-center gap-1 h-16", className)}>
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="w-1 bg-primary/30 rounded-full animate-wave"
            style={{
              height: `${Math.random() * 40 + 10}%`,
              animationDelay: `${i * 50}ms`,
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      width={300}
      height={64}
      className={cn("w-full h-16", className)}
    />
  );
}

// Static decorative waveform with organic wave shape and continuous animation
export function StaticWaveform({ className }: { className?: string }) {
  const bars = 60;
  const maxHeight = 65;
  const minHeight = 10;
  
  // Create a smooth wave pattern that tapers at the ends (fish/wave shape)
  const getBarHeight = (index: number, total: number) => {
    const normalized = index / total;
    // Create multiple overlapping sine waves for organic shape
    const wave1 = Math.sin(normalized * Math.PI * 2.2) * 0.4;
    const wave2 = Math.sin(normalized * Math.PI * 3.5) * 0.3;
    const wave3 = Math.sin(normalized * Math.PI * 1.8) * 0.3;
    const combined = (wave1 + wave2 + wave3) * 0.5 + 0.5;
    // Apply a bell curve to taper the ends
    const taper = Math.sin(normalized * Math.PI);
    // Combine for organic shape
    const height = combined * taper * (maxHeight - minHeight) + minHeight;
    return Math.max(height, minHeight);
  };
  
  // Calculate bar width - wider in the middle, thinner at edges
  const getBarWidth = (index: number, total: number) => {
    const normalized = index / total;
    const taper = Math.sin(normalized * Math.PI);
    // Base width + taper effect
    return 1.5 + taper * 2;
  };

  return (
    <div className={cn("flex items-end justify-center gap-0.5 h-20", className)}>
      {Array.from({ length: bars }).map((_, i) => {
        const height = getBarHeight(i, bars);
        const width = getBarWidth(i, bars);
        // Stagger delays to create flowing wave effect
        const delay = (i * 33) % 2000; // Creates a continuous wave pattern
        return (
          <div
            key={i}
            className="rounded-t-sm animate-continuous-wave"
            style={{
              height: `${height}%`,
              width: `${width}px`,
              background: `linear-gradient(to top, 
                hsl(340 75% 85% / 0.35), 
                hsl(340 75% 80% / 0.45) 25%,
                hsl(300 60% 80% / 0.5) 50%,
                hsl(160 50% 75% / 0.5) 75%,
                hsl(160 50% 70% / 0.35)
              )`,
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
              animationDelay: `${delay}ms`,
              animationDuration: '2s',
            }}
          />
        );
      })}
    </div>
  );
}
