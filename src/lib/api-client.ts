/**
 * API Client for Unwind - Mental Wellness App
 * Centralized fetch wrapper with retries and exponential backoff
 * 
 * TODO: Set these environment variables before deployment:
 * - VITE_WISPR_BASE: Base URL for Wispr transcription API
 * - VITE_OPENAI_BASE: Base URL for OpenAI/LLM API
 * - VITE_ELEVENLABS_BASE: Base URL for ElevenLabs TTS API
 * - VITE_SESSION_TTL: Session time-to-live in milliseconds (default: 3600000)
 */

// API Base URLs - Replace with your actual endpoints
const WISPR_BASE = import.meta.env.VITE_WISPR_BASE || '/api/wispr';
const OPENAI_BASE = import.meta.env.VITE_OPENAI_BASE || '/api/openai';
const ELEVENLABS_BASE = import.meta.env.VITE_ELEVENLABS_BASE || '/api/elevenlabs';

interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
}

const defaultRetryConfig: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
};

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  config: RetryConfig = defaultRetryConfig
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      
      if (response.ok) {
        return response;
      }

      // Don't retry on client errors (4xx) except 429 (rate limit)
      if (response.status >= 400 && response.status < 500 && response.status !== 429) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
    }

    if (attempt < config.maxRetries) {
      const delay = Math.min(
        config.baseDelay * Math.pow(2, attempt),
        config.maxDelay
      );
      await sleep(delay);
    }
  }

  throw lastError || new Error('Request failed after retries');
}

// ============================================================================
// WISPR TRANSCRIPTION API
// ============================================================================

export interface TranscribeResponse {
  transcription: string;
  language: string;
}

/**
 * Transcribe audio using Wispr API
 * 
 * POST /api/wispr/transcribe
 * Content-Type: multipart/form-data
 * Body: { audioFile: Blob, sessionId: string }
 * 
 * Response: { transcription: string, language: string }
 */
export async function transcribeAudio(
  audioBlob: Blob,
  sessionId: string
): Promise<TranscribeResponse> {
  const formData = new FormData();
  formData.append('audioFile', audioBlob, 'recording.webm');
  formData.append('sessionId', sessionId);

  const response = await fetchWithRetry(`${WISPR_BASE}/transcribe`, {
    method: 'POST',
    body: formData,
  });

  return response.json();
}

// ============================================================================
// OPENAI / LLM GENERATION API
// ============================================================================

export interface GenerateRequest {
  promptTemplateId: string;
  promptVariables: {
    userText: string;
    sessionId: string;
    context?: Array<{ role: 'user' | 'assistant'; content: string }>;
  };
  sessionId: string;
}

export interface GenerateResponse {
  id: string;
  outputText: string;
  tokensUsed: number;
  metadata: Record<string, unknown>;
}

/**
 * Generate AI response using OpenAI/LLM API
 * 
 * POST /api/openai/generate
 * Content-Type: application/json
 * Body: { promptTemplateId: string, promptVariables: {...}, sessionId: string }
 * 
 * Response: { id: string, outputText: string, tokensUsed: number, metadata: {} }
 * 
 * /* TODO: Insert {{AI_PROMPT_TEMPLATE}} in backend or ENV */
export async function generateResponse(
  userText: string,
  sessionId: string,
  context: Array<{ role: 'user' | 'assistant'; content: string }> = []
): Promise<GenerateResponse> {
  const request: GenerateRequest = {
    promptTemplateId: 'unwind_v1', // This maps to {{AI_PROMPT_TEMPLATE}} on the backend
    promptVariables: {
      userText,
      sessionId,
      context,
    },
    sessionId,
  };

  const response = await fetchWithRetry(`${OPENAI_BASE}/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  return response.json();
}

// ============================================================================
// ELEVENLABS TEXT-TO-SPEECH API
// ============================================================================

export interface TTSRequest {
  text: string;
  voiceId: string;
  format: 'mp3' | 'wav' | 'ogg';
}

export interface TTSResponse {
  audioUrl: string;
  duration: number;
}

/**
 * Convert text to speech using ElevenLabs API
 * 
 * POST /api/elevenlabs/tts
 * Content-Type: application/json
 * Body: { text: string, voiceId: string, format: string }
 * 
 * Response: { audioUrl: string, duration: number }
 */
export async function textToSpeech(
  text: string,
  voiceId: string = 'EXAVITQu4vr4xnSDxMaL', // Default: Sarah voice
  format: 'mp3' | 'wav' | 'ogg' = 'mp3'
): Promise<TTSResponse> {
  const request: TTSRequest = {
    text,
    voiceId,
    format,
  };

  const response = await fetchWithRetry(`${ELEVENLABS_BASE}/tts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  return response.json();
}

// ============================================================================
// ERROR TYPES
// ============================================================================

export class TranscriptionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TranscriptionError';
  }
}

export class GenerationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GenerationError';
  }
}

export class TTSError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TTSError';
  }
}
