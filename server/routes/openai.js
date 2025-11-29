/**
 * OpenAI API Routes
 * Handles text processing with OpenAI using custom prompts
 */

import express from 'express';
import { generateResponse } from '../services/openai.js';

const router = express.Router();

/**
 * POST /api/openai/generate
 * 
 * Generates AI response using OpenAI with custom prompt template
 * 
 * Body:
 * {
 *   "promptTemplateId": "unwind_v1",
 *   "promptVariables": {
 *     "userText": "User's message here",
 *     "sessionId": "abc123",
 *     "context": [
 *       { "role": "user", "content": "Previous message..." },
 *       { "role": "assistant", "content": "Previous response..." }
 *     ]
 *   },
 *   "sessionId": "abc123"
 * }
 * 
 * Response:
 * {
 *   "id": "resp_001",
 *   "outputText": "[AI response here]",
 *   "tokensUsed": 123,
 *   "metadata": {}
 * }
 */
router.post('/generate', async (req, res, next) => {
  console.log(`\n🤖 [OPENAI ROUTE] POST /api/openai/generate hit!`);
  console.log(`   Request received at: ${new Date().toISOString()}`);
  console.log(`   Body keys:`, Object.keys(req.body || {}));
  
  try {
    const { promptTemplateId, promptVariables, sessionId } = req.body;

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

    // Call OpenAI service
    console.log(`\n🔄 Calling OpenAI service...`);
    const result = await generateResponse(
      promptTemplateId,
      promptVariables,
      sessionId
    );

    console.log(`✅ Generation successful!`);
    console.log(`   Response ID: ${result.id}`);
    console.log(`   Output length: ${result.outputText?.length || 0} characters`);
    console.log(`   Tokens used: ${result.tokensUsed || 0}`);

    res.json({
      id: result.id || `resp_${Date.now()}`,
      outputText: result.outputText,
      tokensUsed: result.tokensUsed || 0,
      metadata: result.metadata || {},
    });
  } catch (error) {
    console.error(`\n❌ [OPENAI ROUTE ERROR]`);
    console.error(`   Error type: ${error.constructor.name}`);
    console.error(`   Error message: ${error.message}`);
    console.error(`   Error stack:`, error.stack);
    next(error);
  }
});

export { router as openaiRouter };




