/**
 * Deepgram API Routes
 * Handles audio transcription using Deepgram
 */

import express from 'express';
import multer from 'multer';
import { transcribeAudio } from '../services/deepgram.js';

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max file size
  },
  fileFilter: (req, file, cb) => {
    // Accept audio files
    const allowedMimes = [
      'audio/webm',
      'audio/wav',
      'audio/mp3',
      'audio/mpeg',
      'audio/ogg',
      'audio/m4a',
      'audio/x-m4a',
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type. Allowed types: ${allowedMimes.join(', ')}`), false);
    }
  },
});

/**
 * POST /api/deepgram/transcribe
 * 
 * Transcribes audio file using Deepgram
 * 
 * Body (multipart/form-data):
 * - audioFile: File (audio recording)
 * - sessionId: string
 * 
 * Response:
 * {
 *   "transcription": "Transcribed text...",
 *   "language": "en-US"
 * }
 */
router.post('/transcribe', upload.single('audioFile'), async (req, res, next) => {
  console.log(`\n🎙️  [DEEPGRAM ROUTE] POST /api/deepgram/transcribe hit!`);
  console.log(`   Request received at: ${new Date().toISOString()}`);
  console.log(`   Has file: ${!!req.file}`);
  console.log(`   Body keys:`, Object.keys(req.body || {}));
  
  try {
    if (!req.file) {
      console.error(`❌ No audio file in request`);
      console.error(`   Files:`, req.files);
      console.error(`   File object:`, req.file);
      return res.status(400).json({ error: 'No audio file provided' });
    }

    const { sessionId } = req.body;

    if (!sessionId) {
      console.error(`❌ No sessionId in request body`);
      return res.status(400).json({ error: 'sessionId is required' });
    }

    console.log(`✅ Valid request received`);
    console.log(`   Session ID: ${sessionId}`);
    console.log(`   File name: ${req.file.originalname || 'unnamed'}`);
    console.log(`   File size: ${req.file.size} bytes`);
    console.log(`   File type: ${req.file.mimetype}`);
    console.log(`   Buffer length: ${req.file.buffer?.length || 0} bytes`);

    // Call Deepgram service
    console.log(`\n🔄 Calling Deepgram service...`);
    const result = await transcribeAudio(req.file.buffer, req.file.mimetype, sessionId);

    console.log(`✅ Transcription successful!`);
    console.log(`   Transcription length: ${result.transcription?.length || 0} characters`);
    console.log(`   Language: ${result.language}`);

    res.json({
      transcription: result.transcription,
      language: result.language || 'en-US',
    });
  } catch (error) {
    console.error(`\n❌ [DEEPGRAM ROUTE ERROR]`);
    console.error(`   Error type: ${error.constructor.name}`);
    console.error(`   Error message: ${error.message}`);
    console.error(`   Error stack:`, error.stack);
    next(error);
  }
});

export { router as deepgramRouter };

