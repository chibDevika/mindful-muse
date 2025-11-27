import { useState, useRef, useCallback, useEffect } from 'react';

export interface AudioRecorderState {
  isRecording: boolean;
  isPaused: boolean;
  recordingTime: number;
  audioBlob: Blob | null;
  error: string | null;
  permissionStatus: 'prompt' | 'granted' | 'denied' | 'unknown';
}

export interface UseAudioRecorderReturn extends AudioRecorderState {
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  pauseRecording: () => void;
  resumeRecording: () => void;
  cancelRecording: () => void;
  requestPermission: () => Promise<boolean>;
  getAnalyserNode: () => AnalyserNode | null;
}

export function useAudioRecorder(): UseAudioRecorderReturn {
  const [state, setState] = useState<AudioRecorderState>({
    isRecording: false,
    isPaused: false,
    recordingTime: 0,
    audioBlob: null,
    error: null,
    permissionStatus: 'unknown',
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  // Check initial permission status
  useEffect(() => {
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'microphone' as PermissionName })
        .then(result => {
          setState(prev => ({ ...prev, permissionStatus: result.state as 'prompt' | 'granted' | 'denied' }));
          result.onchange = () => {
            setState(prev => ({ ...prev, permissionStatus: result.state as 'prompt' | 'granted' | 'denied' }));
          };
        })
        .catch(() => {
          // Permission API not supported
        });
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setState(prev => ({ ...prev, permissionStatus: 'granted', error: null }));
      return true;
    } catch (err) {
      setState(prev => ({ 
        ...prev, 
        permissionStatus: 'denied',
        error: 'Microphone access denied. Please enable it in your browser settings.'
      }));
      return false;
    }
  }, []);

  const startTimer = useCallback(() => {
    timerRef.current = window.setInterval(() => {
      setState(prev => ({ ...prev, recordingTime: prev.recordingTime + 1 }));
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startRecording = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, error: null, audioBlob: null, recordingTime: 0 }));

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        }
      });

      streamRef.current = stream;

      // Set up audio context and analyser for visualization
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);

      // Set up media recorder
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') 
        ? 'audio/webm' 
        : 'audio/mp4';
      
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        setState(prev => ({ ...prev, audioBlob: blob }));
      };

      mediaRecorderRef.current.start(100); // Collect data every 100ms
      setState(prev => ({ ...prev, isRecording: true, permissionStatus: 'granted' }));
      startTimer();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start recording';
      setState(prev => ({ 
        ...prev, 
        error: errorMessage,
        permissionStatus: errorMessage.includes('Permission') ? 'denied' : prev.permissionStatus,
      }));
    }
  }, [startTimer]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && state.isRecording) {
      mediaRecorderRef.current.stop();
      streamRef.current?.getTracks().forEach(track => track.stop());
      audioContextRef.current?.close();
      
      setState(prev => ({ ...prev, isRecording: false, isPaused: false }));
      stopTimer();
    }
  }, [state.isRecording, stopTimer]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && state.isRecording && !state.isPaused) {
      mediaRecorderRef.current.pause();
      setState(prev => ({ ...prev, isPaused: true }));
      stopTimer();
    }
  }, [state.isRecording, state.isPaused, stopTimer]);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && state.isRecording && state.isPaused) {
      mediaRecorderRef.current.resume();
      setState(prev => ({ ...prev, isPaused: false }));
      startTimer();
    }
  }, [state.isRecording, state.isPaused, startTimer]);

  const cancelRecording = useCallback(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      streamRef.current?.getTracks().forEach(track => track.stop());
      audioContextRef.current?.close();
      chunksRef.current = [];
      
      setState(prev => ({ 
        ...prev, 
        isRecording: false, 
        isPaused: false, 
        recordingTime: 0,
        audioBlob: null,
      }));
      stopTimer();
    }
  }, [stopTimer]);

  const getAnalyserNode = useCallback(() => {
    return analyserRef.current;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTimer();
      streamRef.current?.getTracks().forEach(track => track.stop());
      audioContextRef.current?.close();
    };
  }, [stopTimer]);

  return {
    ...state,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    cancelRecording,
    requestPermission,
    getAnalyserNode,
  };
}
