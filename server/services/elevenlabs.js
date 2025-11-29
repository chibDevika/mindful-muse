/**
 * ElevenLabs Service
 * Handles text-to-speech conversion using ElevenLabs API
 * 
 * Documentation: https://elevenlabs.io/docs/api-reference/text-to-speech
 */

/**
 * Convert text to speech using ElevenLabs
 * 
 * @param {string} text - Text to convert to speech
 * @param {string} voiceId - ElevenLabs voice ID
 * @param {string} format - Audio format (mp3, wav, ogg)
 * @returns {Promise<{audioUrl: string, duration: number}>}
 */
export async function textToSpeech(text, voiceId, format = 'mp3') {
  console.log(`\n🔊 [ELEVENLABS SERVICE] Starting TTS conversion`);
  console.log(`   Text length: ${text.length} characters`);
  console.log(`   Voice ID: ${voiceId}`);
  console.log(`   Format: ${format}`);
  
  const speed = parseFloat(process.env.ELEVENLABS_SPEED || '1.0');
  console.log(`   Speed: ${speed}x (from ELEVENLABS_SPEED env var)`);
  
  const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
  const ELEVENLABS_API_URL = process.env.ELEVENLABS_API_URL || 'https://api.elevenlabs.io/v1';

  console.log(`   API URL: ${ELEVENLABS_API_URL}`);
  console.log(`   API Key present: ${!!ELEVENLABS_API_KEY}`);
  console.log(`   API Key length: ${ELEVENLABS_API_KEY?.length || 0} characters`);

  if (!ELEVENLABS_API_KEY) {
    console.error(`❌ ELEVENLABS_API_KEY is not configured!`);
    throw new Error('ELEVENLABS_API_KEY is not configured. Please set it in your .env file.');
  }

  try {
    const url = `${ELEVENLABS_API_URL}/text-to-speech/${voiceId}`;
    
    console.log(`\n🌐 [ELEVENLABS SERVICE] Calling ElevenLabs API`);
    console.log(`   URL: ${url}`);
    console.log(`   Text preview: ${text.substring(0, 100)}...`);

    
    const requestBody = {
      text: text,
      model_id: process.env.ELEVENLABS_MODEL || 'eleven_monolingual_v1',
      voice_settings: {
        stability: parseFloat(process.env.ELEVENLABS_STABILITY || '0.5'),
        similarity_boost: parseFloat(process.env.ELEVENLABS_SIMILARITY_BOOST || '0.75'),
        style: parseFloat(process.env.ELEVENLABS_STYLE || '0.0'),
        use_speaker_boost: process.env.ELEVENLABS_USE_SPEAKER_BOOST === 'true',
        speed: parseFloat(process.env.ELEVENLABS_SPEED || '1.0'),
      },
    };

    const startTime = Date.now();
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': `audio/${format}`,
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY,
      },
      body: JSON.stringify(requestBody),
    });

    const duration = Date.now() - startTime;
    console.log(`   Response received in ${duration}ms`);
    console.log(`   Status: ${response.status} ${response.statusText}`);
    console.log(`   Content-Type: ${response.headers.get('content-type')}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`\n❌ [ELEVENLABS SERVICE] API Error`);
      console.error(`   Status: ${response.status}`);
      console.error(`   Error response:`, errorText);
      throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
    }

    // Get audio data as blob
    const audioBlob = await response.blob();
    const audioSize = audioBlob.size;
    console.log(`\n✅ [ELEVENLABS SERVICE] Audio generated successfully`);
    console.log(`   Audio size: ${audioSize} bytes`);
    console.log(`   Format: ${format}`);

    // Convert blob to base64 data URL for frontend
    const arrayBuffer = await audioBlob.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const audioUrl = `data:audio/${format};base64,${base64}`;

    // Estimate duration (rough calculation: ~150 words per minute, ~1KB per second for mp3)
    const wordCount = text.split(/\s+/).length;
    const estimatedDuration = (wordCount / 150) * 60; // seconds

    console.log(`   Estimated duration: ${estimatedDuration.toFixed(1)}s`);
    console.log(`   Word count: ${wordCount}`);

    return {
      audioUrl: audioUrl,
      duration: estimatedDuration,
    };
  } catch (error) {
    console.error(`\n❌ [ELEVENLABS SERVICE] Error occurred`);
    console.error(`   Error type: ${error.constructor.name}`);
    console.error(`   Error message: ${error.message}`);
    if (error.stack) {
      console.error(`   Stack trace:`, error.stack);
    }
    
    if (error.message.includes('ELEVENLABS_API_KEY')) {
      throw error;
    }
    
    throw new Error(`Failed to generate audio: ${error.message}`);
  }
}


