/**
 * Test endpoint to verify Vercel functions are working
 * GET /api/test
 */
export default async function handler(req, res) {
  return res.json({ 
    status: 'ok', 
    message: 'Vercel serverless functions are working!',
    timestamp: new Date().toISOString()
  });
}

