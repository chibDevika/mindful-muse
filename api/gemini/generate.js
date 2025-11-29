/**
 * Vercel Serverless Function for Gemini Generation
 * POST /api/gemini/generate
 */

import { generateResponse } from '../../server/services/gemini.js';

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

  console.log(`\n🤖 [GEMINI ROUTE] POST /api/gemini/generate hit!`);
  console.log(`   Request received at: ${new Date().toISOString()}`);

  try {
    // Parse JSON body for Vercel serverless functions
    let body = req.body;
    if (typeof body === 'string') {
      body = JSON.parse(body);
    }
    if (!body && req.body) {
      body = req.body;
    }
    
    console.log(`   Body keys:`, Object.keys(body || {}));

    const { promptTemplateId, promptVariables, sessionId } = body;

    console.log(`   Parsed request:`);
    console.log(`   - promptTemplateId: ${promptTemplateId}`);
    console.log(`   - sessionId: ${sessionId}`);
    console.log(`   - promptVariables keys:`, promptVariables ? Object.keys(promptVariables) : 'none');

    // Validation
    if (!promptTemplateId) {
      console.error(`❌ Missing promptTemplateId`);
      return res.status(400).json({ error: 'promptTemplateId is required' });
    }

    if (!promptVariables || !promptVariables.userText) {
      console.error(`❌ Missing promptVariables.userText`);
      return res.status(400).json({ error: 'promptVariables.userText is required' });
    }

    if (!sessionId) {
      console.error(`❌ Missing sessionId`);
      return res.status(400).json({ error: 'sessionId is required' });
    }

    console.log(`✅ Valid request received`);
    console.log(`   Session ID: ${sessionId}`);
    console.log(`   Template: ${promptTemplateId}`);
    console.log(`   User text (first 100 chars): ${promptVariables.userText.substring(0, 100)}...`);
    console.log(`   Context length: ${promptVariables.context?.length || 0} messages`);

    // Call Gemini service
    console.log(`\n🔄 Calling Gemini service...`);
    const result = await generateResponse(
      promptTemplateId,
      promptVariables,
      sessionId
    );

    console.log(`✅ Generation successful!`);
    console.log(`   Response ID: ${result.id}`);
    console.log(`   Output length: ${result.outputText?.length || 0} characters`);
    console.log(`   Tokens used: ${result.tokensUsed || 0}`);

    return res.json({
      id: result.id || `resp_${Date.now()}`,
      outputText: result.outputText,
      tokensUsed: result.tokensUsed || 0,
      metadata: result.metadata || {},
    });
  } catch (error) {
    console.error(`\n❌ [GEMINI ROUTE ERROR]`);
    console.error(`   Error type: ${error.constructor.name}`);
    console.error(`   Error message: ${error.message}`);
    console.error(`   Error stack:`, error.stack);
    
    return res.status(500).json({
      error: error.message || 'Internal server error',
    });
  }
}

