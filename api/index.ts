import { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(_req: VercelRequest, res: VercelResponse) {
  res.status(200).json({
    success: true,
    message: 'ChimeraMatrix Backend API',
    version: '1.0.0',
    endpoints: [
      {
        path: '/api/analyze',
        method: 'POST',
        description: 'Upload and analyze video content',
      },
      {
        path: '/api/generate-strategy',
        method: 'POST',
        description: 'Generate content strategy',
      },
      {
        path: '/api/regenerate-strategy',
        method: 'POST',
        description: 'Regenerate strategy (full or partial)',
      },
      {
        path: '/api/backtest',
        method: 'POST',
        description: 'Predict performance based on historical data',
      },
    ],
    status: 'operational',
    timestamp: new Date().toISOString(),
  });
}
