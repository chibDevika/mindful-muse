/**
 * OpenAI Service
 * Handles text processing with OpenAI using custom prompts
 */

/**
 * Generate AI response using OpenAI
 * 
 * @param {string} promptTemplateId - Template identifier (e.g., "unwind_v1")
 * @param {object} promptVariables - Variables for the prompt template
 * @param {string} sessionId - Session identifier
 * @returns {Promise<{id: string, outputText: string, tokensUsed: number, metadata: object}>}
 */
export async function generateResponse(promptTemplateId, promptVariables, sessionId) {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  const OPENAI_API_URL = process.env.OPENAI_API_URL || 'https://api.openai.com/v1';
  const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

  if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured. Please set it in your .env file.');
  }

  try {
    // Get the prompt template
    const systemPrompt = getPromptTemplate(promptTemplateId);
    
    // Build the messages array for OpenAI API
    const messages = [
      {
        role: 'system',
        content: systemPrompt,
      },
    ];

    // Add conversation context if provided
    // This includes all previous messages (user + assistant pairs) from the session
    if (promptVariables.context && Array.isArray(promptVariables.context)) {
      console.log(`   Adding ${promptVariables.context.length} previous messages to context`);
      // Add previous messages from context
      promptVariables.context.forEach((msg, index) => {
        if (msg.role && msg.content) {
          messages.push({
            role: msg.role,
            content: msg.content,
          });
          console.log(`   [${index + 1}] ${msg.role}: ${msg.content.substring(0, 50)}...`);
        }
      });
    } else {
      console.log(`   No previous context - starting new conversation`);
    }

    // Add the current user message (the new one being processed)
    messages.push({
      role: 'user',
      content: promptVariables.userText,
    });
    console.log(`   Added current user message: ${promptVariables.userText.substring(0, 50)}...`);

    console.log(`   Calling OpenAI API: ${OPENAI_API_URL}/chat/completions`);
    console.log(`   Model: ${OPENAI_MODEL}`);
    console.log(`   Messages: ${messages.length} total`);

    const response = await fetch(`${OPENAI_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: messages,
        temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.7'),
        max_tokens: parseInt(process.env.OPENAI_MAX_TOKENS || '1000'),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error(`OpenAI API error (${response.status}):`, errorData);
      throw new Error(`OpenAI API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();

    const outputText = data.choices[0]?.message?.content || '';
    const tokensUsed = data.usage?.total_tokens || 0;

    return {
      id: data.id || `resp_${Date.now()}`,
      outputText: outputText,
      tokensUsed: tokensUsed,
      metadata: {
        model: data.model,
        finishReason: data.choices[0]?.finish_reason,
        promptTokens: data.usage?.prompt_tokens,
        completionTokens: data.usage?.completion_tokens,
      },
    };
  } catch (error) {
    console.error('OpenAI generation error:', error);
    
    if (error.message.includes('OPENAI_API_KEY')) {
      throw error;
    }
    
    throw new Error(`Failed to generate response: ${error.message}`);
  }
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






