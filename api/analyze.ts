import { VercelRequest, VercelResponse } from '@vercel/node';
import { FileUploadHandler } from '../lib/file-handler';
import { GeminiClient } from '../lib/gemini';
import { sessionManager } from '../lib/session';
import { applyCorsAndSecurity } from '../lib/cors';
import { formatErrorResponse, formatErrorResponse, STATUS_CODES, logger } from '../lib/errors';
import { validatePlatform } from '../lib/validators';
import { AnalyzeResponse } from '../types';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Apply CORS and security checks
    applyCorsAndSecurity(req, res);

    // Only accept POST requests
    if (req.method !== 'POST') {
      res.status(STATUS_CODES.BAD_REQUEST).json(
        formatErrorResponse(new Error('Method not allowed'))
      );
      return;
    }

    logger.info('Video analysis request received');

    // Parse form data
    const fileHandler = new FileUploadHandler();
    const { video, videoPath, platform, filename, size } = await fileHandler.parseFormData(req);

    // Validate platform
    if (!validatePlatform(platform)) {
      await fileHandler.cleanup(videoPath);
      res.status(STATUS_CODES.BAD_REQUEST).json(
        formatErrorResponse(new Error('Invalid platform. Must be youtube, tiktok, or shorts'))
      );
      return;
    }

    logger.info('Video file validated', { filename, size, platform });

    // Analyze video using Gemini
    const geminiClient = new GeminiClient();
    const features = await geminiClient.analyzeVideo(video, platform);

    // Create session and store features
    const sessionId = sessionManager.createSession();
    await sessionManager.setSessionData(sessionId, { features });

    // Clean up temporary file
    await fileHandler.cleanup(videoPath);

    logger.info('Video analysis completed', { sessionId });

    // Return response
    const response: AnalyzeResponse = {
      sessionId,
      features,
    };

    res.status(STATUS_CODES.OK).json({
      success: true,
      data: response,
    });
  } catch (error) {
    logger.error('Video analysis failed', { error });

    const isDev = process.env.NODE_ENV !== 'production';
    const errorResponse = formatErrorResponse(error as Error, isDev);

    // Determine status code
    let statusCode: number = STATUS_CODES.INTERNAL_SERVER_ERROR;
    if (error instanceof Error) {
      if (error.message.includes('validation') || error.message.includes('Invalid')) {
        statusCode = STATUS_CODES.BAD_REQUEST;
      } else if (error.message.includes('too large')) {
        statusCode = STATUS_CODES.PAYLOAD_TOO_LARGE;
      } else if (error.message.includes('API') || error.message.includes('Gemini')) {
        statusCode = STATUS_CODES.BAD_GATEWAY;
      }
    }

    res.status(statusCode).json(errorResponse);
  }
}
