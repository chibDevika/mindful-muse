import { useState, useEffect } from 'react';
import { Mic, Square, X, AlertCircle, Pause, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AudioWaveform } from '@/components/AudioWaveform';
import { useAudioRecorder } from '@/hooks/use-audio-recorder';
import { cn } from '@/lib/utils';

interface RecordInputProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  disabled?: boolean;
  className?: string;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function RecordInput({ onRecordingComplete, disabled, className }: RecordInputProps) {
  const {
    isRecording,
    isPaused,
    recordingTime,
    audioBlob,
    error,
    permissionStatus,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    cancelRecording,
    requestPermission,
    getAnalyserNode,
  } = useAudioRecorder();

  const [showPermissionPrompt, setShowPermissionPrompt] = useState(false);

  // Handle recording complete
  useEffect(() => {
    if (audioBlob) {
      onRecordingComplete(audioBlob);
    }
  }, [audioBlob, onRecordingComplete]);

  const handleStartRecording = async () => {
    if (permissionStatus === 'denied') {
      setShowPermissionPrompt(true);
      return;
    }

    if (permissionStatus === 'prompt' || permissionStatus === 'unknown') {
      const granted = await requestPermission();
      if (!granted) {
        setShowPermissionPrompt(true);
        return;
      }
    }

    await startRecording();
  };

  if (showPermissionPrompt || permissionStatus === 'denied') {
    return (
      <div className={cn("flex flex-col items-center gap-4 p-6 rounded-3xl bg-card border border-border shadow-card", className)}>
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="w-5 h-5" />
          <span className="font-medium">Microphone Access Required</span>
        </div>
        <p className="text-sm text-muted-foreground text-center max-w-xs">
          Please enable microphone access in your browser settings to record your thoughts.
        </p>
        <Button 
          variant="outline" 
          onClick={() => {
            setShowPermissionPrompt(false);
            requestPermission();
          }}
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (isRecording) {
    return (
      <div className={cn("flex flex-col items-center gap-6 p-8 rounded-3xl bg-card border border-border shadow-card animate-fade-up", className)}>
        {/* Recording indicator */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-3 h-3 rounded-full bg-destructive" />
            <div className="absolute inset-0 w-3 h-3 rounded-full bg-destructive animate-pulse-ring" />
          </div>
          <span className="text-lg font-medium text-foreground">Recording</span>
        </div>

        {/* Timer */}
        <div className="text-4xl font-light text-foreground tabular-nums">
          {formatTime(recordingTime)}
        </div>

        {/* Waveform */}
        <AudioWaveform 
          analyser={getAnalyserNode()} 
          isRecording={isRecording && !isPaused} 
          className="w-full max-w-sm"
        />

        {/* Controls */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={cancelRecording}
            className="text-muted-foreground hover:text-destructive"
          >
            <X className="w-5 h-5" />
          </Button>

          <Button
            variant={isPaused ? "outline" : "ghost"}
            size="iconLg"
            onClick={isPaused ? resumeRecording : pauseRecording}
          >
            {isPaused ? (
              <Play className="w-6 h-6" />
            ) : (
              <Pause className="w-6 h-6" />
            )}
          </Button>

          <Button
            variant="destructive"
            size="iconLg"
            onClick={stopRecording}
            className="shadow-soft"
          >
            <Square className="w-5 h-5 fill-current" />
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          {isPaused ? 'Paused — tap to resume' : 'Tap the square to stop recording'}
        </p>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      {error && (
        <div className="flex items-center gap-2 text-destructive text-sm mb-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      <Button
        variant="record"
        size="iconXl"
        onClick={handleStartRecording}
        disabled={disabled}
        className="group relative"
      >
        <Mic className="w-8 h-8 transition-transform group-hover:scale-110" />
        <span className="absolute -bottom-8 text-sm font-medium text-muted-foreground">
          Start recording
        </span>
      </Button>
    </div>
  );
}
