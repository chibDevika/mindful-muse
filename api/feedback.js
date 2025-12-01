/**
 * Vercel Serverless Function for User Feedback
 * POST /api/feedback
 */

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

  try {
    // Parse JSON body
    let body = req.body;
    if (typeof body === 'string') {
      body = JSON.parse(body);
    }
    if (!body && req.body) {
      body = req.body;
    }

    const { 
      feedback, 
      sessionId, 
      messageCount,
      timestamp,
      userAgent,
      url 
    } = body;

    // Validate required fields
    if (!feedback || !sessionId) {
      return res.status(400).json({ error: 'feedback and sessionId are required' });
    }

    // Log comprehensive feedback information
    const logData = {
      timestamp: timestamp || new Date().toISOString(),
      feedback: feedback, // 'positive' or 'negative'
      sessionId: sessionId,
      messageCount: messageCount || 0,
      userAgent: userAgent || req.headers['user-agent'] || 'unknown',
      url: url || req.headers['referer'] || 'unknown',
      ip: req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown',
      deployment: process.env.VERCEL_URL || 'local',
    };

    // Log to console (will appear in Vercel logs)
    console.log('\n📊 [USER FEEDBACK] ============================================');
    console.log(`   Timestamp: ${logData.timestamp}`);
    console.log(`   Feedback: ${feedback === 'positive' ? '👍 Positive' : '👎 Negative'}`);
    console.log(`   Session ID: ${sessionId}`);
    console.log(`   Message Count: ${messageCount || 0}`);
    console.log(`   User Agent: ${logData.userAgent}`);
    console.log(`   URL: ${logData.url}`);
    console.log(`   IP: ${logData.ip}`);
    console.log(`   Deployment: ${logData.deployment}`);
    console.log('================================================\n');

    // Return success
    return res.status(200).json({
      success: true,
      message: 'Feedback received',
      timestamp: logData.timestamp,
    });
  } catch (error) {
    console.error('\n❌ [FEEDBACK ERROR]');
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

