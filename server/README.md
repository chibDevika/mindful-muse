# Backend Server for Unwind

This directory contains the backend API server for the Unwind mental wellness app.

## Structure

```
server/
├── index.js              # Main Express server
├── routes/
│   ├── deepgram.js      # Deepgram transcription endpoints
│   └── gemini.js        # Google Gemini text processing endpoints
└── services/
    ├── deepgram.js      # Deepgram API integration
    └── gemini.js        # Google Gemini API integration
```

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create `.env` file:**
   ```bash
   cp server/.env.example server/.env
   ```

3. **Configure API keys:**
   Edit `server/.env` and add your API keys:
   - `DEEPGRAM_API_KEY` - Get from https://console.deepgram.com/
   - `GEMINI_API_KEY` - Get from https://aistudio.google.com/app/apikey

## Running the Server

### Development Mode

Run the backend server only:
```bash
npm run dev:server
```

Run both frontend and backend together:
```bash
npm run dev:all
```

The server will start on `http://localhost:3001` by default.

## API Endpoints

### 1. Health Check
```
GET /health
```

### 2. Deepgram Transcription
```
POST /api/deepgram/transcribe
Content-Type: multipart/form-data

Body:
- audioFile: File (audio recording)
- sessionId: string

Response:
{
  "transcription": "Transcribed text...",
  "language": "en-US"
}
```

### 3. Gemini Generation
```
POST /api/gemini/generate
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
  "outputText": "[AI response here]",
  "tokensUsed": 123,
  "metadata": {}
}
```

## Customizing the AI Prompt

You can customize the AI prompt in several ways:

1. **Environment Variable (Recommended):**
   ```env
   AI_PROMPT_TEMPLATE=Your custom prompt here...
   ```

2. **Template-specific:**
   ```env
   UNWIND_V1_PROMPT=Your custom prompt for unwind_v1...
   ```

3. **Edit the code:**
   Modify the `getPromptTemplate()` function in `server/services/gemini.js`

## Environment Variables

See `server/.env.example` for all available configuration options.

## Notes

- The server uses CORS to allow requests from the frontend
- File uploads are limited to 50MB
- The server includes error handling and logging
- All API keys should be kept secure and never committed to version control



