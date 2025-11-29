/**
 * Vercel Serverless Function for Deepgram Transcription
 * POST /api/deepgram/transcribe
 */

import { transcribeAudio } from '../../server/services/deepgram.js';
import formidable from 'formidable';
import { Readable } from 'stream';

// Disable default body parser for this route
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log(`\n🎙️  [DEEPGRAM ROUTE] POST /api/deepgram/transcribe hit!`);
  console.log(`   Request received at: ${new Date().toISOString()}`);

  try {
    // Parse multipart/form-data using formidable
    const form = formidable({
      maxFileSize: 50 * 1024 * 1024, // 50MB
      keepExtensions: true,
    });

    // Convert Node.js request to a stream for formidable
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);
    const stream = Readable.from(buffer);

    const [fields, files] = await form.parse(stream);
    
    const audioFile = Array.isArray(files.audioFile) ? files.audioFile[0] : files.audioFile;
    const sessionId = Array.isArray(fields.sessionId) ? fields.sessionId[0] : fields.sessionId;

    if (!audioFile) {
      console.error(`❌ No audio file in request`);
      return res.status(400).json({ error: 'No audio file provided' });
    }

    if (!sessionId) {
      console.error(`❌ No sessionId in request body`);
      return res.status(400).json({ error: 'sessionId is required' });
    }

    console.log(`✅ Valid request received`);
    console.log(`   Session ID: ${sessionId}`);
    console.log(`   File name: ${audioFile.originalFilename || audioFile.name || 'unnamed'}`);
    console.log(`   File type: ${audioFile.mimetype || audioFile.type}`);

    // Read file buffer from formidable file object
    const fs = await import('fs');
    const buffer = await fs.promises.readFile(audioFile.filepath);

    console.log(`   File size: ${buffer.length} bytes`);

    // Call Deepgram service
    console.log(`\n🔄 Calling Deepgram service...`);
    const mimeType = audioFile.mimetype || audioFile.type || 'audio/webm';
    const result = await transcribeAudio(buffer, mimeType, sessionId);
    
    // Clean up temporary file
    try {
      const fs = await import('fs');
      await fs.promises.unlink(audioFile.filepath);
    } catch (cleanupError) {
      // Ignore cleanup errors
      console.warn('Failed to cleanup temp file:', cleanupError);
    }

    console.log(`✅ Transcription successful!`);
    console.log(`   Transcription length: ${result.transcription?.length || 0} characters`);
    console.log(`   Language: ${result.language}`);

    return res.json({
      transcription: result.transcription,
      language: result.language || 'en-US',
    });
  } catch (error) {
    console.error(`\n❌ [DEEPGRAM ROUTE ERROR]`);
    console.error(`   Error type: ${error.constructor.name}`);
    console.error(`   Error message: ${error.message}`);
    console.error(`   Error stack:`, error.stack);
    
    return res.status(500).json({
      error: error.message || 'Internal server error',
    });
  }
}

