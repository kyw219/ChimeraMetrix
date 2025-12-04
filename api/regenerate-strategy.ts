import { VercelRequest, VercelResponse } from '@vercel/node';
import { GeminiClient } from '../lib/gemini';
import { sessionManager } from '../lib/session';
import { applyCorsAndSecurity } from '../lib/cors';
import { formatErrorResponse, STATUS_CODES, logger } from '../lib/errors';
import { validateRequestBody, validatePlatform, validateSessionId } from '../lib/validators';
import { RegenerateStrategyRequest, GenerateStrategyResponse, Strategy } from '../types';

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

    logger.info('Strategy regeneration request received');

    // Validate request body
    const { sessionId, features, platform, field, currentStrategy, frameUrl } = validateRequestBody<RegenerateStrategyRequest>(
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

    // Validate field if specified
    if (field && !['cover', 'title', 'hashtags', 'postingTime'].includes(field)) {
      res.status(STATUS_CODES.BAD_REQUEST).json(
        formatErrorResponse(new Error('Invalid field. Must be cover, title, hashtags, or postingTime'))
      );
      return;
    }

    // Use currentStrategy from request (for serverless compatibility)
    const existingStrategy = currentStrategy;

    // Use frameUrl from request body (passed from frontend)
    if (frameUrl) {
      logger.info('Using frame URL from request', { sessionId, frameUrl });
    } else {
      logger.warn('No frame URL provided', { sessionId });
    }

    logger.info('Regenerating strategy', { sessionId, field: field || 'all' });

    const geminiClient = new GeminiClient();
    let updatedStrategy: Strategy;

    if (field && existingStrategy) {
      // Regenerate only the specified field
      if (field === 'cover') {
        // Special handling for cover - regenerate with image
        const coverData = await geminiClient.regenerateCover(
          features, 
          platform, 
          existingStrategy.title,
          frameUrl
        );
        updatedStrategy = {
          ...existingStrategy,
          cover: coverData.cover,
          coverImageUrl: coverData.coverImageUrl,
        };
      } else {
        // For other fields, generate new strategy and pick the field
        const newStrategy = await geminiClient.generateStrategy(features, platform, frameUrl);
        updatedStrategy = {
          ...existingStrategy,
          [field]: newStrategy[field as keyof Strategy],
        };
      }

      logger.info('Field regenerated', { sessionId, field });
    } else {
      // Regenerate entire strategy (already includes image generation)
      updatedStrategy = await geminiClient.generateStrategy(features, platform, frameUrl);

      logger.info('Entire strategy regenerated', { sessionId });
    }

    // Try to store updated strategy in session (optional in serverless)
    try {
      const sessionData = await sessionManager.getSessionData(sessionId);
      await sessionManager.setSessionData(sessionId, {
        ...sessionData,
        strategy: updatedStrategy,
      });
      logger.info('Updated strategy stored in session', { sessionId });
    } catch (error) {
      logger.warn('Could not store strategy in session (serverless limitation)', { sessionId });
    }

    // Return response
    const response: GenerateStrategyResponse = {
      strategy: updatedStrategy,
    };

    res.status(STATUS_CODES.OK).json({
      success: true,
      data: response,
    });
  } catch (error) {
    logger.error('Strategy regeneration failed', { error });

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
