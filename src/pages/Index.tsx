import { useState, useCallback, useEffect } from 'react';
import { HomeScreen } from '@/components/HomeScreen';
import { RecordInput } from '@/components/RecordInput';
import { TextInput } from '@/components/TextInput';
import { SessionChat } from '@/components/SessionChat';
import { ProcessingOverlay } from '@/components/ProcessingOverlay';
import { SettingsPanel } from '@/components/SettingsPanel';
import { UnwindLogo } from '@/components/UnwindLogo';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';
import leafBg2 from '@/assets/leaf-bg-2.png';
import { useToast } from '@/hooks/use-toast';
import { useAudioPlayer } from '@/hooks/use-audio-player';
import {
  transcribeAudio,
  generateResponse,
  textToSpeech,
  TranscriptionError,
  GenerationError,
  TTSError,
} from '@/lib/api-client';
import {
  getMessages,
  addMessage,
  updateMessage,
  updateMessageAudioUrl,
  getSettings,
  updateSettings,
  getConversationContext,
  getSessionId,
  clearSession,
  type Message,
  type SessionSettings,
} from '@/lib/session-store';
import { cn } from '@/lib/utils';

type AppState = 'home' | 'recording' | 'typing' | 'chat';

export default function Index() {
  const [appState, setAppState] = useState<AppState>('home');
  const [messages, setMessages] = useState<Message[]>([]);
  const [settings, setSettings] = useState<SessionSettings>(getSettings());
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState('');
  const [generatingMessageId, setGeneratingMessageId] = useState<string | null>(null);
  const [loadingAudioMessageId, setLoadingAudioMessageId] = useState<string | null>(null);
  const [error, setError] = useState<{ type: string; message: string; retry?: () => void } | null>(null);

  const { toast } = useToast();
  const audioPlayer = useAudioPlayer();

  // Load messages on mount
  useEffect(() => {
    const savedMessages = getMessages();
    if (savedMessages.length > 0) {
      setMessages(savedMessages);
      setAppState('chat');
    }
  }, []);

  // Refresh messages from storage
  const refreshMessages = useCallback(() => {
    setMessages(getMessages());
  }, []);

  // Handle settings change
  const handleSettingsChange = useCallback((newSettings: Partial<SessionSettings>) => {
    updateSettings(newSettings);
    setSettings(prev => ({ ...prev, ...newSettings }));
    
    if (newSettings.playbackSpeed !== undefined) {
      audioPlayer.setPlaybackRate(newSettings.playbackSpeed);
    }
  }, [audioPlayer]);

  // Process user input (text or transcription)
  const processUserInput = useCallback(async (userText: string) => {
    setError(null);
    
    // Get conversation context BEFORE adding the new message
    // This ensures we have all previous messages (user + assistant pairs)
    const previousContext = getConversationContext();
    
    // Add user message to storage
    const userMessage = addMessage('user', userText);
    refreshMessages();
    setAppState('chat');

    // Generate AI response
    setIsProcessing(true);
    setProcessingMessage('Thoughtfully responding...');
    
    // Create placeholder for assistant message
    const placeholderMessage = addMessage('assistant', '');
    setGeneratingMessageId(placeholderMessage.id);
    refreshMessages();

    try {
      // Pass previous context (all messages before the new user message)
      // The new userText will be added by the backend
      const response = await generateResponse(userText, getSessionId(), previousContext);
      
      // Update the placeholder with actual content
      updateMessage(placeholderMessage.id, response.outputText);
      refreshMessages();
      setGeneratingMessageId(null);
      
      // Auto-play if enabled
      if (settings.autoPlay) {
        await handlePlayAudio(placeholderMessage.id);
      }
    } catch (err) {
      console.error('Generation error:', err);
      // Remove placeholder message on error
      const currentMessages = getMessages();
      const filteredMessages = currentMessages.filter(m => m.id !== placeholderMessage.id);
      // Re-save without the placeholder (manual cleanup)
      setMessages(filteredMessages);
      
      setError({
        type: 'generation',
        message: err instanceof GenerationError ? err.message : 'Failed to generate response. Please try again.',
        retry: () => processUserInput(userText),
      });
      
      toast({
        title: "Response failed",
        description: "We couldn't generate a response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setProcessingMessage('');
      setGeneratingMessageId(null);
    }
  }, [refreshMessages, settings.autoPlay, toast]);

  // Handle audio recording complete
  const handleRecordingComplete = useCallback(async (audioBlob: Blob) => {
    setError(null);
    setIsProcessing(true);
    setProcessingMessage('Transcribing your thoughts...');
    setAppState('chat');

    try {
      const result = await transcribeAudio(audioBlob, getSessionId());
      await processUserInput(result.transcription);
    } catch (err) {
      console.error('Transcription error:', err);
      setError({
        type: 'transcription',
        message: err instanceof TranscriptionError ? err.message : 'Transcription failed — try again or type your message.',
        retry: () => handleRecordingComplete(audioBlob),
      });
      
      toast({
        title: "Transcription failed",
        description: "Try again or type your message instead.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  }, [processUserInput, toast]);

  // Handle text submit
  const handleTextSubmit = useCallback(async (text: string) => {
    await processUserInput(text);
  }, [processUserInput]);

  // Handle play audio (TTS)
  const handlePlayAudio = useCallback(async (messageId: string) => {
    // Get message from storage to ensure we have the latest version
    const allMessages = getMessages();
    const message = allMessages.find(m => m.id === messageId);
    if (!message || message.role !== 'assistant') return;

    // If already playing this message, toggle pause
    if (audioPlayer.isPlaying && loadingAudioMessageId === null) {
      audioPlayer.pause();
      return;
    }

    // If we have a cached audio URL, play it
    if (message.audioUrl) {
      await audioPlayer.play(message.audioUrl);
      return;
    }

    // Generate TTS
    setLoadingAudioMessageId(messageId);
    setError(null);

    try {
      // Speed is controlled via ELEVENLABS_SPEED environment variable on backend
      const result = await textToSpeech(message.content, settings.voiceId);
      updateMessageAudioUrl(messageId, result.audioUrl);
      refreshMessages();
      
      // Speed is baked into the audio from ElevenLabs, so play at 1.0x
      audioPlayer.setPlaybackRate(1.0);
      await audioPlayer.play(result.audioUrl);
    } catch (err) {
      console.error('TTS error:', err);
      setError({
        type: 'tts',
        message: err instanceof TTSError ? err.message : 'Failed to generate audio. Please try again.',
        retry: () => handlePlayAudio(messageId),
      });
      
      toast({
        title: "Audio failed",
        description: "Couldn't generate audio. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingAudioMessageId(null);
    }
  }, [audioPlayer, settings.voiceId, settings.playbackSpeed, refreshMessages, toast]);

  // Handle edit message
  const handleEditMessage = useCallback((messageId: string, newContent: string) => {
    updateMessage(messageId, newContent);
    refreshMessages();
    
    toast({
      title: "Message updated",
      description: "Your message has been edited.",
    });
  }, [refreshMessages, toast]);

  // Start new session
  const handleNewSession = useCallback(() => {
    clearSession();
    setMessages([]);
    setAppState('home');
    setError(null);
  }, []);

  // Render based on app state
  if (appState === 'home') {
    return (
      <HomeScreen
        onStartRecording={() => setAppState('recording')}
        onStartTyping={() => setAppState('typing')}
      />
    );
  }

  return (
    <div className="flex flex-col min-h-screen relative">
      {/* Background image with reduced opacity */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url(${leafBg2})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.3,
        }}
      />
      
      {/* Overlay for readability */}
      <div className="absolute inset-0 bg-background/50 pointer-events-none z-[1]" />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-background/80 backdrop-blur-xl border-b border-border">
        <Button
          variant="ghost"
          onClick={() => setAppState('home')}
          className="flex items-center gap-2 font-heading text-base font-medium text-foreground hover:bg-transparent hover:text-primary px-0"
        >
          <UnwindLogo size={32} className="text-gentle" />
          <span className="tracking-widest uppercase">Unwind</span>
        </Button>
        
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            onClick={handleNewSession}
            className="text-sm font-medium bg-primary/15 text-primary hover:bg-accent hover:text-accent-foreground transition-colors px-4 py-2 rounded-lg"
          >
            New Session
          </Button>
          <SettingsPanel
            settings={settings}
            onSettingsChange={handleSettingsChange}
          />
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Error banner */}
        {error && (
          <div className="mx-4 mt-4 p-4 rounded-2xl bg-destructive/10 border border-destructive/30 animate-fade-up">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-destructive">{error.message}</p>
                {error.retry && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={error.retry}
                    className="mt-2"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try again
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Chat messages */}
        <SessionChat
          messages={messages}
          onPlayAudio={handlePlayAudio}
          playingMessageId={audioPlayer.isPlaying ? messages.find(m => m.audioUrl)?.id : null}
          loadingAudioMessageId={loadingAudioMessageId}
          generatingMessageId={generatingMessageId}
          onFeedback={(feedback) => {
            console.log('User feedback:', feedback);
            // TODO: Send feedback to backend or analytics
          }}
          className="flex-1 px-4 py-6"
        />
      </main>

      {/* Input area */}
      <footer className="sticky bottom-0 z-40 p-4 bg-background/80 backdrop-blur-xl border-t border-border">
        <div className="max-w-2xl mx-auto">
          {appState === 'recording' ? (
            <RecordInput
              onRecordingComplete={handleRecordingComplete}
              disabled={isProcessing}
            />
          ) : (
            <TextInput
              onSubmit={handleTextSubmit}
              onStartRecording={() => setAppState('recording')}
              disabled={isProcessing}
              placeholder="Type what's on your mind..."
            />
          )}
        </div>
      </footer>

        {/* Processing overlay (only for transcription) */}
        <ProcessingOverlay
          isVisible={isProcessing && processingMessage.includes('Transcribing')}
          message={processingMessage}
        />
      </div>
    </div>
  );
}
