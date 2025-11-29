/**
 * Deepgram Service
 * Handles audio transcription using Deepgram API
 * 
 * Documentation: https://developers.deepgram.com/
 */

/**
 * Transcribe audio using Deepgram
 * 
 * @param {Buffer} audioBuffer - Audio file buffer
 * @param {string} mimeType - MIME type of the audio file
 * @param {string} sessionId - Session identifier
 * @returns {Promise<{transcription: string, language: string}>}
 */
export async function transcribeAudio(audioBuffer, mimeType, sessionId) {
  console.log(`\n🔊 [DEEPGRAM SERVICE] Starting transcription`);
  console.log(`   Session ID: ${sessionId}`);
  console.log(`   MIME type: ${mimeType}`);
  console.log(`   Buffer size: ${audioBuffer.length} bytes`);
  
  const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY;
  const DEEPGRAM_API_URL = process.env.DEEPGRAM_API_URL || 'https://api.deepgram.com/v1';

  console.log(`   API URL: ${DEEPGRAM_API_URL}`);
  console.log(`   API Key present: ${!!DEEPGRAM_API_KEY}`);
  console.log(`   API Key length: ${DEEPGRAM_API_KEY?.length || 0} characters`);

  if (!DEEPGRAM_API_KEY) {
    console.error(`❌ DEEPGRAM_API_KEY is not configured!`);
    throw new Error('DEEPGRAM_API_KEY is not configured. Please set it in your .env file.');
  }

  try {
    // Determine content type for Deepgram
    const contentType = getDeepgramContentType(mimeType);
    
    // Build Deepgram API URL with parameters
    const model = process.env.DEEPGRAM_MODEL || 'nova-2';
    const language = process.env.DEEPGRAM_LANGUAGE || 'en-US';
    const url = `${DEEPGRAM_API_URL}/listen?model=${model}&language=${language}&punctuate=true&diarize=false`;

    console.log(`\n🌐 [DEEPGRAM SERVICE] Calling Deepgram API`);
    console.log(`   URL: ${url}`);
    console.log(`   Content-Type: ${contentType}`);
    console.log(`   Model: ${model}`);
    console.log(`   Language: ${language}`);
    console.log(`   Payload size: ${audioBuffer.length} bytes`);

    const startTime = Date.now();
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${DEEPGRAM_API_KEY}`,
        'Content-Type': contentType,
      },
      body: audioBuffer,
    });

    const duration = Date.now() - startTime;
    console.log(`   Response received in ${duration}ms`);
    console.log(`   Status: ${response.status} ${response.statusText}`);
    console.log(`   Headers:`, Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`\n❌ [DEEPGRAM SERVICE] API Error`);
      console.error(`   Status: ${response.status}`);
      console.error(`   Error response:`, errorText);
      throw new Error(`Deepgram API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log(`\n✅ [DEEPGRAM SERVICE] API Response received`);
    console.log(`   Response keys:`, Object.keys(data));
    console.log(`   Has results: ${!!data.results}`);
    console.log(`   Has channels: ${!!data.results?.channels}`);

    // Deepgram returns transcription in this format
    const transcription = extractTranscription(data);
    const detectedLanguage = data.results?.channels?.[0]?.detected_language || language;

    console.log(`   Transcription extracted: ${transcription.length} characters`);
    console.log(`   Detected language: ${detectedLanguage}`);

    return {
      transcription: transcription,
      language: detectedLanguage,
    };
  } catch (error) {
    console.error(`\n❌ [DEEPGRAM SERVICE] Error occurred`);
    console.error(`   Error type: ${error.constructor.name}`);
    console.error(`   Error message: ${error.message}`);
    if (error.stack) {
      console.error(`   Stack trace:`, error.stack);
    }
    
    if (error.message.includes('DEEPGRAM_API_KEY')) {
      throw error;
    }
    
    throw new Error(`Failed to transcribe audio: ${error.message}`);
  }
}

/**
 * Extract transcription text from Deepgram response
 */
function extractTranscription(data) {
  if (!data.results || !data.results.channels || data.results.channels.length === 0) {
    return '';
  }

  const channel = data.results.channels[0];
  if (!channel.alternatives || channel.alternatives.length === 0) {
    return '';
  }

  // Get the first (most confident) alternative
  return channel.alternatives[0].transcript || '';
}

/**
 * Get Deepgram-compatible content type from MIME type
 */
function getDeepgramContentType(mimeType) {
  const mimeMap = {
    'audio/webm': 'audio/webm',
    'audio/wav': 'audio/wav',
    'audio/mp3': 'audio/mpeg',
    'audio/mpeg': 'audio/mpeg',
    'audio/ogg': 'audio/ogg',
    'audio/m4a': 'audio/m4a',
    'audio/x-m4a': 'audio/m4a',
  };
  
  return mimeMap[mimeType] || 'audio/webm';
}

