/**
 * Vercel Serverless Function for Deepgram Transcription
 * POST /api/deepgram/transcribe
 */

import { transcribeAudio } from '../../server/services/deepgram.js';
import { IncomingForm } from 'formidable';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log(`\n🎙️  [DEEPGRAM ROUTE] POST /api/deepgram/transcribe hit!`);
  console.log(`   Request received at: ${new Date().toISOString()}`);
  console.log(`   Content-Type: ${req.headers['content-type']}`);

  try {
    // Parse multipart/form-data using formidable
    const form = new IncomingForm({
      maxFileSize: 50 * 1024 * 1024, // 50MB
      keepExtensions: true,
    });

    // Parse the form - formidable works with Node.js request objects
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) {
          console.error('Formidable parse error:', err);
          reject(err);
        } else {
          resolve([fields, files]);
        }
      });
    });
    
    const audioFile = Array.isArray(files.audioFile) ? files.audioFile[0] : files.audioFile;
    const sessionId = Array.isArray(fields.sessionId) ? fields.sessionId[0] : fields.sessionId;

    if (!audioFile) {
      console.error(`❌ No audio file in request`);
      console.error(`   Files received:`, Object.keys(files || {}));
      console.error(`   Fields received:`, Object.keys(fields || {}));
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
    console.log(`   File path: ${audioFile.filepath}`);

    // Read file buffer from formidable file object
    const fs = await import('fs');
    let buffer;
    try {
      buffer = await fs.promises.readFile(audioFile.filepath);
    } catch (readError) {
      console.error(`❌ Failed to read file:`, readError);
      return res.status(500).json({ error: 'Failed to read uploaded file' });
    }

    console.log(`   File size: ${buffer.length} bytes`);

    // Call Deepgram service
    console.log(`\n🔄 Calling Deepgram service...`);
    const mimeType = audioFile.mimetype || audioFile.type || 'audio/webm';
    const result = await transcribeAudio(buffer, mimeType, sessionId);
    
    // Clean up temporary file
    try {
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
    if (error.stack) {
      console.error(`   Error stack:`, error.stack);
    }
    
    return res.status(500).json({
      error: error.message || 'Internal server error',
    });
  }
}
