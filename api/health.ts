import { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(_req: VercelRequest, res: VercelResponse) {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: {
      nodeEnv: process.env.NODE_ENV,
      hasGeminiKey: !!process.env.GEMINI_API_KEY,
      geminiKeyLength: process.env.GEMINI_API_KEY?.length || 0,
      geminiModel: process.env.GEMINI_MODEL || 'not set',
      allowedOrigins: process.env.ALLOWED_ORIGINS || 'not set',
      maxFileSize: process.env.MAX_FILE_SIZE || 'not set',
    },
  };

  res.status(200).json(health);
}
