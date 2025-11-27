import { Play, Pause, RotateCcw, Download, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { useAudioPlayer } from '@/hooks/use-audio-player';

interface PlayAudioProps {
  audioUrl: string;
  className?: string;
}

function formatTime(seconds: number): string {
  if (!isFinite(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function PlayAudio({ audioUrl, className }: PlayAudioProps) {
  const {
    isPlaying,
    isPaused,
    currentTime,
    duration,
    playbackRate,
    error,
    isLoading,
    play,
    pause,
    resume,
    seek,
    setPlaybackRate,
    replay,
  } = useAudioPlayer();

  const handlePlayPause = async () => {
    if (isPlaying) {
      pause();
    } else if (isPaused) {
      resume();
    } else {
      await play(audioUrl);
    }
  };

  const handleSeek = (value: number[]) => {
    seek(value[0]);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = 'unwind-reflection.mp3';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const playbackRates = [0.5, 0.75, 1, 1.25, 1.5, 2];

  return (
    <div className={cn(
      "flex flex-col gap-4 p-4 rounded-2xl bg-card border border-border shadow-card",
      className
    )}>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-muted-foreground w-10 text-right tabular-nums">
          {formatTime(currentTime)}
        </span>
        <Slider
          value={[currentTime]}
          max={duration || 100}
          step={0.1}
          onValueChange={handleSeek}
          className="flex-1"
          disabled={!duration}
        />
        <span className="text-xs text-muted-foreground w-10 tabular-nums">
          {formatTime(duration)}
        </span>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Play/Pause */}
          <Button
            variant="support"
            size="icon"
            onClick={handlePlayPause}
            disabled={isLoading}
          >
            {isLoading ? (
              <Volume2 className="w-5 h-5 animate-pulse" />
            ) : isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5" />
            )}
          </Button>

          {/* Replay */}
          <Button
            variant="ghost"
            size="icon"
            onClick={replay}
            disabled={isLoading || !duration}
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>

        {/* Playback speed */}
        <div className="flex items-center gap-1">
          {playbackRates.map((rate) => (
            <Button
              key={rate}
              variant={playbackRate === rate ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setPlaybackRate(rate)}
              className="h-7 px-2 text-xs"
            >
              {rate}x
            </Button>
          ))}
        </div>

        {/* Download */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDownload}
          disabled={!audioUrl}
        >
          <Download className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
