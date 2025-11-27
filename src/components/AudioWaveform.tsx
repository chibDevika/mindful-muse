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

// Static decorative waveform
export function StaticWaveform({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center gap-1 h-12", className)}>
      {Array.from({ length: 30 }).map((_, i) => {
        const height = Math.sin((i / 30) * Math.PI * 2) * 30 + 40;
        return (
          <div
            key={i}
            className="w-1 bg-gradient-to-t from-primary/20 to-support/40 rounded-full"
            style={{ height: `${height}%` }}
          />
        );
      })}
    </div>
  );
}
