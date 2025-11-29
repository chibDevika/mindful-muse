/**
 * Gemini Service
 * Handles text processing with Google Gemini API using the official SDK
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * List available Gemini models
 */
async function listAvailableModels(apiKey) {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    // The Node.js SDK might not have listModels directly
    // Try common model names instead
    const commonModels = [
      'gemini-1.5-flash',
      'gemini-2.5-flash', 
      'gemini-1.5-pro',
      'gemini-pro',
      'gemini-1.5-flash-001',
      'gemini-pro-vision'
    ];
    
    // Test which models are available by trying to get them
    const available = [];
    for (const modelName of commonModels) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        // Just check if we can get the model, don't actually call it
        available.push(modelName);
      } catch (e) {
        // Model not available, skip
      }
    }
    
    return available;
  } catch (error) {
    console.error('Failed to list models:', error);
    // Return common fallback models
    return ['gemini-1.5-flash', 'gemini-2.5-flash', 'gemini-pro'];
  }
}

/**
 * Generate AI response using Google Gemini API
 * 
 * @param {string} promptTemplateId - Template identifier (e.g., "unwind_v1")
 * @param {object} promptVariables - Variables for the prompt template
 * @param {string} sessionId - Session identifier
 * @returns {Promise<{id: string, outputText: string, tokensUsed: number, metadata: object}>}
 */
export async function generateResponse(promptTemplateId, promptVariables, sessionId) {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  // Common Gemini models: 'gemini-1.5-flash', 'gemini-2.5-flash', 'gemini-1.5-pro', 'gemini-pro'
  // Default to gemini-1.5-flash which is more widely available
  const requestedModel = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  
  // Fallback models to try if the specified model fails
  const fallbackModels = ['gemini-1.5-flash', 'gemini-2.5-flash', 'gemini-pro'];
  const modelsToTry = [requestedModel, ...fallbackModels.filter(m => m !== requestedModel)];

  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured. Please set it in your .env file.');
  }

  let lastError = null;
  
  // Try each model until one works
  for (const GEMINI_MODEL of modelsToTry) {
    try {
      // Initialize the Gemini API client
      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    
    // Get the prompt template
    const systemPrompt = getPromptTemplate(promptTemplateId);
    
    // Build contents array for the conversation
    // For multi-turn conversations, we include the full history
    const contents = [];

    // Add conversation context if provided
    const hasContext = promptVariables.context && Array.isArray(promptVariables.context) && promptVariables.context.length > 0;
    
    if (hasContext) {
      console.log(`   Adding ${promptVariables.context.length} previous messages to context`);
      
      // Add previous messages from context
      promptVariables.context.forEach((msg, index) => {
        if (msg.role && msg.content) {
          // The SDK uses 'user' and 'model' roles (not 'assistant')
          const role = msg.role === 'assistant' ? 'model' : 'user';
          contents.push({
            role: role,
            parts: [{ text: msg.content }]
          });
          console.log(`   [${index + 1}] ${role}: ${msg.content.substring(0, 50)}...`);
        }
      });
    } else {
      console.log(`   No previous context - starting new conversation`);
    }

    // Add the current user message
    // For new conversations, include system prompt with the user message
    const userMessage = hasContext 
      ? promptVariables.userText 
      : `${systemPrompt}\n\nUser: ${promptVariables.userText}`;
    
    contents.push({
      role: 'user',
      parts: [{ text: userMessage }]
    });

    // Get the model with system instruction (if supported)
    // For models that support it, we can use systemInstruction in the model config
    // Otherwise, it's already included in the user message above
    const modelConfig = {
      model: GEMINI_MODEL,
    };
    
    // Try to use systemInstruction if we have context (for models that support it)
    if (hasContext) {
      modelConfig.systemInstruction = systemPrompt;
    }
    
    const model = genAI.getGenerativeModel(modelConfig);

    console.log(`   Calling Gemini API with model: ${GEMINI_MODEL}`);
    console.log(`   User text: ${promptVariables.userText.substring(0, 50)}...`);
    console.log(`   Contents: ${contents.length} messages`);

    // Generate content using the conversation history
    const result = await model.generateContent({
      contents: contents,
    });
    
    const response = await result.response;
    const text = response.text();

    // Get usage metadata if available
    const usageMetadata = response.usageMetadata || {};
    const tokensUsed = usageMetadata.totalTokenCount || 0;

    console.log(`   ✅ Generation successful!`);
    console.log(`   Response length: ${text.length} characters`);
    console.log(`   Tokens used: ${tokensUsed}`);

    return {
      id: `resp_${Date.now()}`,
      outputText: text,
      tokensUsed: tokensUsed,
      metadata: {
        model: GEMINI_MODEL,
        promptTokenCount: usageMetadata.promptTokenCount,
        candidatesTokenCount: usageMetadata.candidatesTokenCount,
        finishReason: response.candidates?.[0]?.finishReason,
      },
    };
    } catch (error) {
      console.error(`   Error with model '${GEMINI_MODEL}':`, error.message);
      lastError = error;
      
      // If it's a model not found error, try the next model
      if (error.message.includes('not found') || error.message.includes('404')) {
        console.log(`   Model '${GEMINI_MODEL}' not available, trying next model...`);
        continue; // Try next model
      }
      
      // If systemInstruction fails, retry without it for this model
      if (error.message.includes('system_instruction') || error.message.includes('systemInstruction')) {
        console.log(`   System instruction not supported for '${GEMINI_MODEL}', retrying without it...`);
        try {
          return await generateResponseWithoutSystemInstruction(promptTemplateId, promptVariables, sessionId, GEMINI_API_KEY, GEMINI_MODEL);
        } catch (retryError) {
          lastError = retryError;
          continue; // Try next model
        }
      }
      
      // For other errors, break and report
      break;
    }
  }
  
  // If we get here, all models failed
  console.error('All models failed. Last error:', lastError);
  
  if (lastError && lastError.message.includes('GEMINI_API_KEY')) {
    throw lastError;
  }
  
  // Provide helpful error message
  const availableModels = await listAvailableModels(GEMINI_API_KEY);
  const modelList = availableModels.length > 0 
    ? availableModels.join(', ')
    : 'gemini-1.5-flash, gemini-2.5-flash, gemini-pro';
  const errorMsg = `Failed to generate response with any available model. ` +
    `Tried: ${modelsToTry.join(', ')}. ` +
    `Suggested models: ${modelList}. ` +
    `Last error: ${lastError?.message || 'Unknown error'}`;
  throw new Error(errorMsg);
}

/**
 * Fallback function that includes system prompt in the message instead of systemInstruction
 */
async function generateResponseWithoutSystemInstruction(promptTemplateId, promptVariables, sessionId, apiKey, modelName) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: modelName });
  const systemPrompt = getPromptTemplate(promptTemplateId);
  
  const contents = [];
  
  // Add conversation context
  if (promptVariables.context && Array.isArray(promptVariables.context) && promptVariables.context.length > 0) {
    // Add system prompt at the start
    contents.push({
      role: 'user',
      parts: [{ text: systemPrompt }]
    });
    contents.push({
      role: 'model',
      parts: [{ text: 'I understand. I\'m here to listen and support you.' }]
    });
    
    // Add previous messages
    promptVariables.context.forEach((msg) => {
      if (msg.role && msg.content) {
        const role = msg.role === 'assistant' ? 'model' : 'user';
        contents.push({
          role: role,
          parts: [{ text: msg.content }]
        });
      }
    });
  } else {
    // For new conversations, include system prompt with user message
    contents.push({
      role: 'user',
      parts: [{ text: `${systemPrompt}\n\nUser: ${promptVariables.userText}` }]
    });
  }
  
  // Add current user message if we have context
  if (promptVariables.context && promptVariables.context.length > 0) {
    contents.push({
      role: 'user',
      parts: [{ text: promptVariables.userText }]
    });
  }
  
  const result = await model.generateContent({ contents });
  const response = await result.response;
  const text = response.text();
  const usageMetadata = response.usageMetadata || {};
  
  return {
    id: `resp_${Date.now()}`,
    outputText: text,
    tokensUsed: usageMetadata.totalTokenCount || 0,
    metadata: {
      model: modelName,
      promptTokenCount: usageMetadata.promptTokenCount,
      candidatesTokenCount: usageMetadata.candidatesTokenCount,
      finishReason: response.candidates?.[0]?.finishReason,
    },
  };
}

/**
 * Get prompt template by ID
 * 
 * You can customize this function to:
 * 1. Load prompts from a database
 * 2. Load prompts from files
 * 3. Use environment variables
 * 4. Use a prompt management service
 * 
 * For now, it uses the AI_PROMPT_TEMPLATE environment variable or a default template
 */
function getPromptTemplate(templateId) {
  // First, check if there's a custom prompt in environment variable
  if (process.env.AI_PROMPT_TEMPLATE) {
    return process.env.AI_PROMPT_TEMPLATE;
  }

  // Map template IDs to prompts
  const templates = {
    'unwind_v1': process.env.UNWIND_V1_PROMPT || `You are a compassionate mental wellness companion. Your role is to:
- Listen with empathy and without judgment
- Reflect back what the user is feeling
- Offer gentle, supportive perspectives
- Suggest healthy coping strategies when appropriate
- Never diagnose or prescribe medical advice
- Keep responses concise and warm (2-4 sentences typically)
- Use a calm, reassuring tone

Remember: The user may be sharing vulnerable thoughts. Respond with care and understanding.`,
  };

  const template = templates[templateId];
  
  if (!template) {
    console.warn(`Template ${templateId} not found, using default`);
    return templates['unwind_v1'] || 'You are a helpful and supportive assistant.';
  }

  return template;
}
