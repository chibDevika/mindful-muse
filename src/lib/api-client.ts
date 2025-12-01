/**
 * API Client for Unwind - Mental Wellness App
 * Centralized fetch wrapper with retries and exponential backoff
 * 
 * TODO: Set these environment variables before deployment:
 * - VITE_DEEPGRAM_BASE: Base URL for Deepgram transcription API
 * - VITE_GEMINI_BASE: Base URL for Google Gemini/LLM API
 * - VITE_ELEVENLABS_BASE: Base URL for ElevenLabs TTS API
 * - VITE_SESSION_TTL: Session time-to-live in milliseconds (default: 3600000)
 */

// API Base URLs - Replace with your actual endpoints
const DEEPGRAM_BASE = import.meta.env.VITE_DEEPGRAM_BASE || '/api/deepgram';
const GEMINI_BASE = import.meta.env.VITE_GEMINI_BASE || '/api/gemini';
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
// DEEPGRAM TRANSCRIPTION API
// ============================================================================

export interface TranscribeResponse {
  transcription: string;
  language: string;
}

/**
 * Transcribe audio using Deepgram API
 * 
 * POST /api/deepgram/transcribe
 * Content-Type: multipart/form-data
 * Body: { audioFile: Blob, sessionId: string }
 * 
 * Response: { transcription: string, language: string }
 */
export async function transcribeAudio(
  audioBlob: Blob,
  sessionId: string
): Promise<TranscribeResponse> {
  const url = `${DEEPGRAM_BASE}/transcribe`;
  console.log(`\n🎤 [FRONTEND] Starting transcription request`);
  console.log(`   URL: ${url}`);
  console.log(`   DEEPGRAM_BASE: ${DEEPGRAM_BASE}`);
  console.log(`   Session ID: ${sessionId}`);
  console.log(`   Audio blob size: ${audioBlob.size} bytes`);
  console.log(`   Audio blob type: ${audioBlob.type}`);

  const formData = new FormData();
  formData.append('audioFile', audioBlob, 'recording.webm');
  formData.append('sessionId', sessionId);

  console.log(`   FormData created with audioFile and sessionId`);

  try {
    console.log(`   Sending request to: ${url}`);
    const startTime = Date.now();
    
    const response = await fetchWithRetry(url, {
      method: 'POST',
      body: formData,
    });

    const duration = Date.now() - startTime;
    console.log(`   Response received in ${duration}ms`);
    console.log(`   Status: ${response.status} ${response.statusText}`);
    console.log(`   OK: ${response.ok}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error(`   ❌ Error response:`, errorData);
      throw new TranscriptionError(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log(`   ✅ Success! Transcription length: ${result.transcription?.length || 0} chars`);
    return result;
  } catch (error) {
    console.error(`   ❌ [FRONTEND] Transcription failed`);
    console.error(`   Error:`, error);
    if (error instanceof TranscriptionError) {
      throw error;
    }
    throw new TranscriptionError(`Failed to transcribe audio: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// ============================================================================
// GEMINI / LLM GENERATION API
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
 * Generate AI response using Google Gemini API
 * 
 * POST /api/gemini/generate
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
  const url = `${GEMINI_BASE}/generate`;
  console.log(`\n🤖 [FRONTEND] Starting Gemini generation request`);
  console.log(`   URL: ${url}`);
  console.log(`   GEMINI_BASE: ${GEMINI_BASE}`);
  console.log(`   Session ID: ${sessionId}`);
  console.log(`   User text: ${userText.substring(0, 100)}...`);
  console.log(`   Context messages: ${context.length}`);

  const request: GenerateRequest = {
    promptTemplateId: 'unwind_v1', // This maps to {{AI_PROMPT_TEMPLATE}} on the backend
    promptVariables: {
      userText,
      sessionId,
      context,
    },
    sessionId,
  };

  console.log(`   Request payload:`, {
    promptTemplateId: request.promptTemplateId,
    sessionId: request.sessionId,
    userTextLength: request.promptVariables.userText.length,
    contextLength: request.promptVariables.context?.length || 0,
  });

  try {
    console.log(`   Sending request to: ${url}`);
    const startTime = Date.now();
    
    const response = await fetchWithRetry(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    const duration = Date.now() - startTime;
    console.log(`   Response received in ${duration}ms`);
    console.log(`   Status: ${response.status} ${response.statusText}`);
    console.log(`   OK: ${response.ok}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error(`   ❌ Error response:`, errorData);
      throw new GenerationError(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log(`   ✅ Success! Response length: ${result.outputText?.length || 0} chars`);
    console.log(`   Tokens used: ${result.tokensUsed || 0}`);
    return result;
  } catch (error) {
    console.error(`   ❌ [FRONTEND] Generation failed`);
    console.error(`   Error:`, error);
    if (error instanceof GenerationError) {
      throw error;
    }
    throw new GenerationError(`Failed to generate response: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
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
 * 
 * Note: Speed is controlled via ELEVENLABS_SPEED environment variable on the backend
 */
export async function textToSpeech(
  text: string,
  voiceId: string = 'EXAVITQu4vr4xnSDxMaL', // Default: Sarah voice
  format: 'mp3' | 'wav' | 'ogg' = 'mp3'
): Promise<TTSResponse> {
  const url = `${ELEVENLABS_BASE}/tts`;
  console.log(`\n🔊 [FRONTEND] Starting TTS request`);
  console.log(`   URL: ${url}`);
  console.log(`   ELEVENLABS_BASE: ${ELEVENLABS_BASE}`);
  console.log(`   Text length: ${text.length} characters`);
  console.log(`   Voice ID: ${voiceId}`);
  console.log(`   Format: ${format}`);
  console.log(`   Speed: from backend ELEVENLABS_SPEED env var`);

  const request: TTSRequest = {
    text,
    voiceId,
    format,
  };

  try {
    console.log(`   Sending request to: ${url}`);
    const startTime = Date.now();
    
    const response = await fetchWithRetry(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    const duration = Date.now() - startTime;
    console.log(`   Response received in ${duration}ms`);
    console.log(`   Status: ${response.status} ${response.statusText}`);
    console.log(`   OK: ${response.ok}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error(`   ❌ Error response:`, errorData);
      throw new TTSError(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log(`   ✅ Success! Audio URL length: ${result.audioUrl?.length || 0} chars`);
    console.log(`   Duration: ${result.duration}s`);
    return result;
  } catch (error) {
    console.error(`   ❌ [FRONTEND] TTS failed`);
    console.error(`   Error:`, error);
    if (error instanceof TTSError) {
      throw error;
    }
    throw new TTSError(`Failed to generate audio: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
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

// ============================================================================
// FEEDBACK API
// ============================================================================

export interface FeedbackRequest {
  feedback: 'positive' | 'negative';
  sessionId: string;
  messageCount: number;
  timestamp: string;
  userAgent?: string;
  url?: string;
}

/**
 * Send user feedback to the backend for logging
 * 
 * POST /api/feedback
 * Content-Type: application/json
 * Body: { feedback: 'positive' | 'negative', sessionId: string, messageCount: number, ... }
 * 
 * Response: { success: boolean, message: string, timestamp: string }
 */
export async function sendFeedback(
  feedback: 'positive' | 'negative',
  sessionId: string,
  messageCount: number
): Promise<{ success: boolean; message: string; timestamp: string }> {
  const url = '/api/feedback';
  console.log(`\n📊 [FRONTEND] Sending feedback`);
  console.log(`   Feedback: ${feedback}`);
  console.log(`   Session ID: ${sessionId}`);
  console.log(`   Message Count: ${messageCount}`);

  const request: FeedbackRequest = {
    feedback,
    sessionId,
    messageCount,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
  };

  try {
    const response = await fetchWithRetry(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error(`   ❌ Error response:`, errorData);
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log(`   ✅ Feedback sent successfully!`);
    return result;
  } catch (error) {
    console.error(`   ❌ [FRONTEND] Feedback failed`);
    console.error(`   Error:`, error);
    // Don't throw - feedback is non-critical, just log the error
    throw error;
  }
}
