/**
 * Local Session Store for Unwind
 * Persists conversation in sessionStorage (no database required)
 * Session data stays on the user's device
 */

const STORAGE_KEY = 'unwind_session';
const SESSION_TTL = parseInt(import.meta.env.VITE_SESSION_TTL || '3600000'); // 1 hour default

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  audioUrl?: string;
  isEdited?: boolean;
}

export interface SessionData {
  id: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  settings: SessionSettings;
}

export interface SessionSettings {
  voiceId: string;
  playbackSpeed: number;
  autoPlay: boolean;
}

const defaultSettings: SessionSettings = {
  voiceId: 'ixW16lrB2mGXfoaYggBt', // Arfa voice (default)
  playbackSpeed: 1.1,
  autoPlay: false,
};

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function generateSessionId(): string {
  return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function getSession(): SessionData | null {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const session: SessionData = JSON.parse(stored);
    
    // Check if session has expired
    if (Date.now() - session.updatedAt > SESSION_TTL) {
      clearSession();
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

export function createSession(): SessionData {
  const session: SessionData = {
    id: generateSessionId(),
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    settings: { ...defaultSettings },
  };

  saveSession(session);
  return session;
}

export function getOrCreateSession(): SessionData {
  return getSession() || createSession();
}

export function saveSession(session: SessionData): void {
  session.updatedAt = Date.now();
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  sessionStorage.removeItem(STORAGE_KEY);
}

export function addMessage(
  role: 'user' | 'assistant',
  content: string,
  audioUrl?: string
): Message {
  const session = getOrCreateSession();
  
  const message: Message = {
    id: generateId(),
    role,
    content,
    timestamp: Date.now(),
    audioUrl,
  };

  session.messages.push(message);
  saveSession(session);
  
  return message;
}

export function updateMessage(messageId: string, content: string): void {
  const session = getSession();
  if (!session) return;

  const message = session.messages.find(m => m.id === messageId);
  if (message) {
    message.content = content;
    message.isEdited = true;
    saveSession(session);
  }
}

export function updateMessageAudioUrl(messageId: string, audioUrl: string): void {
  const session = getSession();
  if (!session) return;

  const message = session.messages.find(m => m.id === messageId);
  if (message) {
    message.audioUrl = audioUrl;
    saveSession(session);
  }
}

export function getMessages(): Message[] {
  const session = getSession();
  return session?.messages || [];
}

export function getSessionId(): string {
  return getOrCreateSession().id;
}

export function getSettings(): SessionSettings {
  const session = getSession();
  return session?.settings || { ...defaultSettings };
}

export function updateSettings(settings: Partial<SessionSettings>): void {
  const session = getOrCreateSession();
  session.settings = { ...session.settings, ...settings };
  saveSession(session);
}

export function getRecentInsights(count: number = 3): Message[] {
  const messages = getMessages();
  return messages
    .filter(m => m.role === 'assistant')
    .slice(-count);
}

// Convert messages to context format for API
export function getConversationContext(): Array<{ role: 'user' | 'assistant'; content: string }> {
  return getMessages().map(m => ({
    role: m.role,
    content: m.content,
  }));
}
