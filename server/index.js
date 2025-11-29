/**
 * Backend Server for Unwind - Mental Wellness App
 * 
 * This server provides API endpoints for:
 * - Deepgram audio transcription
 * - OpenAI text processing with custom prompts
 */

import express from 'express';
import cors from 'cors';
import multer from 'multer';
import dotenv from 'dotenv';
import { deepgramRouter } from './routes/deepgram.js';
import { openaiRouter } from './routes/openai.js';
import { elevenlabsRouter } from './routes/elevenlabs.js';

// Load environment variables
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env file from server directory
dotenv.config({ path: join(__dirname, '.env') });

console.log('\n🔧 [SERVER STARTUP] Environment Configuration:');
console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
console.log(`   PORT: ${process.env.PORT || '3001 (default)'}`);
console.log(`   FRONTEND_URL: ${process.env.FRONTEND_URL || 'http://localhost:8080 (default)'}`);
console.log(`   DEEPGRAM_API_KEY: ${process.env.DEEPGRAM_API_KEY ? '✅ Set (' + process.env.DEEPGRAM_API_KEY.length + ' chars)' : '❌ Not set'}`);
console.log(`   DEEPGRAM_API_URL: ${process.env.DEEPGRAM_API_URL || 'https://api.deepgram.com/v1 (default)'}`);
console.log(`   OPENAI_API_KEY: ${process.env.OPENAI_API_KEY ? '✅ Set (' + process.env.OPENAI_API_KEY.length + ' chars)' : '❌ Not set'}`);
console.log(`   OPENAI_API_URL: ${process.env.OPENAI_API_URL || 'https://api.openai.com/v1 (default)'}`);
console.log(`   ELEVENLABS_API_KEY: ${process.env.ELEVENLABS_API_KEY ? '✅ Set (' + process.env.ELEVENLABS_API_KEY.length + ' chars)' : '❌ Not set'}`);
console.log(`   ELEVENLABS_API_URL: ${process.env.ELEVENLABS_API_URL || 'https://api.elevenlabs.io/v1 (default)'}`);
console.log('');

const app = express();
const PORT = process.env.PORT || 3001;

// Request logging middleware
app.use((req, res, next) => {
  console.log(`\n📥 [${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log(`   Headers:`, {
    'content-type': req.headers['content-type'],
    'origin': req.headers.origin,
    'content-length': req.headers['content-length'],
  });
  if (req.body && Object.keys(req.body).length > 0) {
    console.log(`   Body keys:`, Object.keys(req.body));
  }
  next();
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/deepgram', deepgramRouter);
app.use('/api/openai', openaiRouter);
app.use('/api/elevenlabs', elevenlabsRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// 404 handler
app.use((req, res) => {
  console.error(`❌ 404 - Route not found: ${req.method} ${req.path}`);
  console.error(`   Available routes:`);
  console.error(`   - GET  /health`);
  console.error(`   - POST /api/deepgram/transcribe`);
  console.error(`   - POST /api/openai/generate`);
  res.status(404).json({ 
    error: 'Not found',
    method: req.method,
    path: req.path,
    availableRoutes: [
      'GET /health',
      'POST /api/deepgram/transcribe',
      'POST /api/openai/generate',
      'POST /api/elevenlabs/tts'
    ]
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📝 Health check: http://localhost:${PORT}/health`);
  console.log(`🎙️  Deepgram endpoint: http://localhost:${PORT}/api/deepgram/transcribe`);
  console.log(`🤖 OpenAI endpoint: http://localhost:${PORT}/api/openai/generate`);
  console.log(`🔊 ElevenLabs endpoint: http://localhost:${PORT}/api/elevenlabs/tts`);
});

export default app;



