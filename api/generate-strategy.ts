import { VercelRequest, VercelResponse } from '@vercel/node';
import { GeminiClient } from '../lib/gemini';
import { sessionManager } from '../lib/session';
import { applyCorsAndSecurity } from '../lib/cors';
import { formatErrorResponse, sanitizeError, STATUS_CODES, Logger } from '../lib/errors';
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

    Logger.info('Strategy generation request received');

    // Validate request body
    const validation = validateRequestBody<GenerateStrategyRequest>(
      req.body,
      ['sessionId', 'features', 'platform']
    );

    if (!validation.valid) {
      res.status(STATUS_CODES.BAD_REQUEST).json(
        formatErrorResponse(new Error(validation.error))
      );
      return;
    }

    const { sessionId, features, platform } = validation.data!;

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

    // Retrieve session data
    const sessionData = await sessionManager.getSessionData(sessionId);
    Logger.info('Session retrieved', { sessionId });

    // Generate strategy using Gemini
    const geminiClient = new GeminiClient();
    const strategy = await geminiClient.generateStrategy(features, platform);

    // Generate cover image
    const coverImageUrl = await geminiClient.generateCoverImage(strategy.cover);
    strategy.coverImageUrl = coverImageUrl;

    // Store strategy in session
    await sessionManager.setSessionData(sessionId, {
      ...sessionData,
      strategy,
    });

    Logger.info('Strategy generated successfully', { sessionId });

    // Return response
    const response: GenerateStrategyResponse = {
      strategy,
    };

    res.status(STATUS_CODES.OK).json({
      success: true,
      data: response,
    });
  } catch (error) {
    Logger.error('Strategy generation failed', { error });

    const isProduction = process.env.NODE_ENV === 'production';
    const errorResponse = sanitizeError(error as Error, isProduction);

    // Determine status code
    let statusCode = STATUS_CODES.INTERNAL_SERVER_ERROR;
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
