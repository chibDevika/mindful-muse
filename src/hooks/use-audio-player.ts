import { useState, useRef, useCallback, useEffect } from 'react';

export interface AudioPlayerState {
  isPlaying: boolean;
  isPaused: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  error: string | null;
  isLoading: boolean;
}

export interface UseAudioPlayerReturn extends AudioPlayerState {
  play: (url: string) => Promise<void>;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  seek: (time: number) => void;
  setPlaybackRate: (rate: number) => void;
  replay: () => void;
}

export function useAudioPlayer(): UseAudioPlayerReturn {
  const [state, setState] = useState<AudioPlayerState>({
    isPlaying: false,
    isPaused: false,
    currentTime: 0,
    duration: 0,
    playbackRate: 1.0,
    error: null,
    isLoading: false,
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentUrlRef = useRef<string>('');

  useEffect(() => {
    // Create audio element
    audioRef.current = new Audio();
    
    const audio = audioRef.current;

    const handleLoadStart = () => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
    };

    const handleCanPlay = () => {
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        duration: audio.duration || 0,
      }));
    };

    const handleTimeUpdate = () => {
      setState(prev => ({ ...prev, currentTime: audio.currentTime }));
    };

    const handleEnded = () => {
      setState(prev => ({ 
        ...prev, 
        isPlaying: false, 
        isPaused: false,
        currentTime: 0,
      }));
    };

    const handleError = () => {
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        isPlaying: false,
        error: 'Failed to load audio. Please try again.',
      }));
    };

    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.pause();
    };
  }, []);

  const play = useCallback(async (url: string) => {
    if (!audioRef.current) return;

    try {
      // If different URL, load new audio
      if (url !== currentUrlRef.current) {
        currentUrlRef.current = url;
        audioRef.current.src = url;
        audioRef.current.load();
      }

      audioRef.current.playbackRate = state.playbackRate;
      await audioRef.current.play();
      
      setState(prev => ({ 
        ...prev, 
        isPlaying: true, 
        isPaused: false,
        error: null,
      }));
    } catch (err) {
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to play audio. Please try again.',
      }));
    }
  }, [state.playbackRate]);

  const pause = useCallback(() => {
    if (audioRef.current && state.isPlaying) {
      audioRef.current.pause();
      setState(prev => ({ ...prev, isPlaying: false, isPaused: true }));
    }
  }, [state.isPlaying]);

  const resume = useCallback(async () => {
    if (audioRef.current && state.isPaused) {
      try {
        await audioRef.current.play();
        setState(prev => ({ ...prev, isPlaying: true, isPaused: false }));
      } catch {
        setState(prev => ({ ...prev, error: 'Failed to resume audio.' }));
      }
    }
  }, [state.isPaused]);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setState(prev => ({ 
        ...prev, 
        isPlaying: false, 
        isPaused: false,
        currentTime: 0,
      }));
    }
  }, []);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, Math.min(time, state.duration));
      setState(prev => ({ ...prev, currentTime: time }));
    }
  }, [state.duration]);

  const setPlaybackRate = useCallback((rate: number) => {
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
      setState(prev => ({ ...prev, playbackRate: rate }));
    }
  }, []);

  const replay = useCallback(async () => {
    if (audioRef.current && currentUrlRef.current) {
      audioRef.current.currentTime = 0;
      try {
        await audioRef.current.play();
        setState(prev => ({ 
          ...prev, 
          isPlaying: true, 
          isPaused: false,
          currentTime: 0,
        }));
      } catch {
        setState(prev => ({ ...prev, error: 'Failed to replay audio.' }));
      }
    }
  }, []);

  return {
    ...state,
    play,
    pause,
    resume,
    stop,
    seek,
    setPlaybackRate,
    replay,
  };
}
