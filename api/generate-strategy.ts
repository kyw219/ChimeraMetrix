import { VercelRequest, VercelResponse } from '@vercel/node';
import { GeminiClient } from '../lib/gemini';
import { sessionManager } from '../lib/session';
import { applyCorsAndSecurity } from '../lib/cors';
import { formatErrorResponse, STATUS_CODES, logger } from '../lib/errors';
import { validateRequestBody, validatePlatform, validateSessionId } from '../lib/validators';
import { GenerateStrategyRequest, GenerateStrategyResponse } from '../types';

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

    logger.info('Strategy generation request received');

    // Validate request body
    const { sessionId, features, platform } = validateRequestBody<GenerateStrategyRequest>(
      req.body,
      ['sessionId', 'features', 'platform']
    );

    // Validate session ID format
    if (!validateSessionId(sessionId)) {
      res.status(STATUS_CODES.BAD_REQUEST).json(
        formatErrorResponse(new Error('Invalid session ID format'))
      );
      return;
    }

    // Validate platform
    if (!validatePlatform(platform)) {
      res.status(STATUS_CODES.BAD_REQUEST).json(
        formatErrorResponse(new Error('Invalid platform. Must be youtube, tiktok, or shorts'))
      );
      return;
    }

    // Get video buffer from request body or session
    let videoBuffer: Buffer | undefined;
    
    const requestBody = req.body as GenerateStrategyRequest;
    if (requestBody.videoBase64) {
      videoBuffer = Buffer.from(requestBody.videoBase64, 'base64');
      console.log('📹 Using video buffer from request:', videoBuffer.length, 'bytes');
    } else {
      // Fallback: try session (may not work in serverless)
      try {
        const sessionData = await sessionManager.getSessionData(sessionId);
        if (sessionData.videoBuffer) {
          videoBuffer = Buffer.from(sessionData.videoBuffer, 'base64');
          console.log('📹 Retrieved video buffer from session:', videoBuffer.length, 'bytes');
        }
      } catch (error) {
        console.log('⚠️ Could not retrieve video buffer from session');
      }
    }

    // Generate strategy using Gemini (with video buffer for image generation)
    const geminiClient = new GeminiClient();
    const strategy = await geminiClient.generateStrategy(features, platform, videoBuffer);

    // Try to store strategy in session (optional, may fail in serverless)
    try {
      const sessionData = await sessionManager.getSessionData(sessionId);
      await sessionManager.setSessionData(sessionId, {
        ...sessionData,
        strategy,
      });
      logger.info('Strategy stored in session', { sessionId });
    } catch (error) {
      // Session not found or expired - this is OK in serverless environment
      logger.warn('Could not store strategy in session (serverless limitation)', { sessionId });
    }

    logger.info('Strategy generated successfully', { sessionId });

    // Return response
    const response: GenerateStrategyResponse = {
      strategy,
    };

    res.status(STATUS_CODES.OK).json({
      success: true,
      data: response,
    });
  } catch (error) {
    logger.error('Strategy generation failed', { error });

    const isDev = process.env.NODE_ENV !== "production";
    const errorResponse = formatErrorResponse(error as Error, isDev);

    // Determine status code
    let statusCode: number = STATUS_CODES.INTERNAL_SERVER_ERROR;
    if (error instanceof Error) {
      if (error.message.includes('not found') || error.message.includes('expired')) {
        statusCode = STATUS_CODES.NOT_FOUND;
      } else if (error.message.includes('validation') || error.message.includes('Invalid')) {
        statusCode = STATUS_CODES.BAD_REQUEST;
      } else if (error.message.includes('API') || error.message.includes('Gemini')) {
        statusCode = STATUS_CODES.BAD_GATEWAY;
      }
    }

    res.status(statusCode).json(errorResponse);
  }
}
