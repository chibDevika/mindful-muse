/**
 * ElevenLabs API Routes
 * Handles text-to-speech conversion using ElevenLabs
 */

import express from 'express';
import { textToSpeech } from '../services/elevenlabs.js';

const router = express.Router();

/**
 * POST /api/elevenlabs/tts
 * 
 * Converts text to speech using ElevenLabs
 * 
 * Body:
 * {
 *   "text": "Text to convert to speech",
 *   "voiceId": "EXAVITQu4vr4xnSDxMaL",
 *   "format": "mp3"
 * }
 * 
 * Note: Speed is controlled via ELEVENLABS_SPEED environment variable
 * 
 * Response:
 * {
 *   "audioUrl": "data:audio/mp3;base64,...",
 *   "duration": 8.2
 * }
 */
router.post('/tts', async (req, res, next) => {
  console.log(`\n🔊 [ELEVENLABS ROUTE] POST /api/elevenlabs/tts hit!`);
  console.log(`   Request received at: ${new Date().toISOString()}`);
  console.log(`   Body keys:`, Object.keys(req.body || {}));
  
  try {
    const { text, voiceId, format } = req.body;

    console.log(`   Parsed request:`);
    console.log(`   - text length: ${text?.length || 0} characters`);
    console.log(`   - voiceId: ${voiceId}`);
    console.log(`   - format: ${format || 'mp3 (default)'}`);
    console.log(`   - speed: from ELEVENLABS_SPEED env var`);

    // Validation
    if (!text) {
      console.error(`❌ Missing text`);
      return res.status(400).json({ error: 'text is required' });
    }

    if (!voiceId) {
      console.error(`❌ Missing voiceId`);
      return res.status(400).json({ error: 'voiceId is required' });
    }

    console.log(`✅ Valid request received`);
    console.log(`   Text preview: ${text.substring(0, 100)}...`);

    // Call ElevenLabs service
    console.log(`\n🔄 Calling ElevenLabs service...`);
    const result = await textToSpeech(text, voiceId, format || 'mp3');

    console.log(`✅ TTS generation successful!`);
    console.log(`   Audio URL length: ${result.audioUrl?.length || 0} characters`);
    console.log(`   Duration: ${result.duration}s`);

    res.json({
      audioUrl: result.audioUrl,
      duration: result.duration,
    });
  } catch (error) {
    console.error(`\n❌ [ELEVENLABS ROUTE ERROR]`);
    console.error(`   Error type: ${error.constructor.name}`);
    console.error(`   Error message: ${error.message}`);
    console.error(`   Error stack:`, error.stack);
    next(error);
  }
});

export { router as elevenlabsRouter };


