# Unwind — Mental Wellness App

A calming mental wellness app for emotional support. Record or type your thoughts, receive supportive AI responses, and listen to soothing audio reflections.

## Features

- 🎙️ **Voice Recording** — Share your thoughts through natural voice input
- ⌨️ **Text Input** — Type your reflections if you prefer
- 🤖 **AI Support** — Receive thoughtful, supportive responses
- 🔊 **Text-to-Speech** — Listen to AI responses with customizable voices
- 🔒 **Privacy First** — All conversations stay on your device (sessionStorage)
- 🎨 **Beautiful Design** — Calming palette with smooth animations

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## API Configuration

The app connects to three backend APIs. Set these environment variables:

```env
# API Base URLs
VITE_DEEPGRAM_BASE=https://your-api.com/api/deepgram
VITE_OPENAI_BASE=https://your-api.com/api/openai
VITE_ELEVENLABS_BASE=https://your-api.com/api/elevenlabs

# Session TTL (optional, default: 1 hour)
VITE_SESSION_TTL=3600000
```

## API Endpoints

### 1. Deepgram Transcription

```
POST /api/deepgram/transcribe
Content-Type: multipart/form-data

Body:
- audioFile: Blob (audio recording)
- sessionId: string

Response:
{
  "transcription": "I feel overwhelmed about work...",
  "language": "en-US"
}
```

### 2. OpenAI/LLM Generation

```
POST /api/openai/generate
Content-Type: application/json

Body:
{
  "promptTemplateId": "unwind_v1",
  "promptVariables": {
    "userText": "User's message here",
    "sessionId": "abc123",
    "context": [
      { "role": "user", "content": "Previous message..." },
      { "role": "assistant", "content": "Previous response..." }
    ]
  },
  "sessionId": "abc123"
}

Response:
{
  "id": "resp_001",
  "outputText": "[AI supportive response here]",
  "tokensUsed": 123,
  "metadata": {}
}
```

**Important:** The `promptTemplateId` maps to `{{AI_PROMPT_TEMPLATE}}` on your backend. Configure your actual AI prompt there.

### 3. ElevenLabs Text-to-Speech

```
POST /api/elevenlabs/tts
Content-Type: application/json

Body:
{
  "text": "[AI response text]",
  "voiceId": "EXAVITQu4vr4xnSDxMaL",
  "format": "mp3"
}

Response:
{
  "audioUrl": "https://...",
  "duration": 8.2
}
```

## Configuring the AI Prompt

The app sends `promptTemplateId: "unwind_v1"` to your backend. Your backend should:

1. Map `unwind_v1` to your actual AI system prompt
2. Include the `userText` from `promptVariables`
3. Use the `context` array for conversation history
4. Return the AI response in `outputText`

Example backend prompt template (`{{AI_PROMPT_TEMPLATE}}`):

```
You are a compassionate mental wellness companion. Your role is to:
- Listen with empathy and without judgment
- Reflect back what the user is feeling
- Offer gentle, supportive perspectives
- Suggest healthy coping strategies when appropriate
- Never diagnose or prescribe medical advice

User's current message: {{userText}}

Conversation context: {{context}}
```

## Available ElevenLabs Voices

| Voice ID | Name | Description |
|----------|------|-------------|
| EWBhzmIOnMsYIEHrdeuQ | Arfa | Indian, calm and conversational voice |
| 9BWtsMINqrJLrRacOk9x | Aria | Gentle, soothing voice |
| FGY2WhTYpPnrIDTdsKH5 | Laura | Friendly, approachable voice |
| TX3LPaxmHKxFdv7VOQHJ | Liam | Calm male voice |
| onwK4e9ZLuTAKqWW03F9 | Daniel | Warm, reassuring voice |


## Testing Locally

### Test Audio Recording

1. Open the app in Chrome/Firefox (with microphone access)
2. Click "Record your thoughts"
3. Allow microphone permission
4. Speak for a few seconds
5. Click stop

If you don't have the backend set up, the API calls will fail with errors. The UI will show retry buttons.

### Test with Sample Audio

You can test the transcription endpoint by sending a `.wav` or `.webm` file:

```bash
curl -X POST http://localhost:3001/api/deepgram/transcribe \
  -F "audioFile=@sample.wav" \
  -F "sessionId=test123"
```

## Project Structure

```
src/
├── components/
│   ├── AudioWaveform.tsx    # Recording visualization
│   ├── ChatMessage.tsx      # Message bubbles
│   ├── HomeScreen.tsx       # Landing page
│   ├── PlayAudio.tsx        # Audio player controls
│   ├── ProcessingOverlay.tsx # Loading states
│   ├── RecordInput.tsx      # Recording UI
│   ├── SessionChat.tsx      # Chat container
│   ├── SessionSummary.tsx   # Insights summary
│   ├── SettingsPanel.tsx    # User preferences
│   └── TextInput.tsx        # Text input
├── hooks/
│   ├── use-audio-player.ts  # Audio playback hook
│   └── use-audio-recorder.ts # Recording hook
├── lib/
│   ├── api-client.ts        # API functions
│   └── session-store.ts     # Local storage
├── pages/
│   └── Index.tsx            # Main app page
└── assets/
    ├── hero-illustration.png
    └── empty-state.png
```

## Checklist Before Going Live

- [ ] Set up backend API endpoints
- [ ] Configure `{{AI_PROMPT_TEMPLATE}}` on backend
- [ ] Add API keys to backend environment
- [ ] Set `VITE_DEEPGRAM_BASE` environment variable
- [ ] Set `VITE_OPENAI_BASE` environment variable
- [ ] Set `VITE_ELEVENLABS_BASE` environment variable
- [ ] Test audio recording in target browsers
- [ ] Test on mobile devices
- [ ] Review accessibility (keyboard navigation, screen readers)

## Tech Stack

- **React** with TypeScript
- **Tailwind CSS** for styling
- **shadcn/ui** components
- **Vite** for bundling
- **Web Audio API** for recording/visualization

## License

MIT
