/**
 * Vercel Serverless Function for ElevenLabs TTS
 * POST /api/elevenlabs/tts
 */

import { textToSpeech } from '../../server/services/elevenlabs.js';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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

    return res.json({
      audioUrl: result.audioUrl,
      duration: result.duration,
    });
  } catch (error) {
    console.error(`\n❌ [ELEVENLABS ROUTE ERROR]`);
    console.error(`   Error type: ${error.constructor.name}`);
    console.error(`   Error message: ${error.message}`);
    console.error(`   Error stack:`, error.stack);
    
    return res.status(500).json({
      error: error.message || 'Internal server error',
    });
  }
}

