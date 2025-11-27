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
    const { sessionId, features, platform, field } = validateRequestBody<RegenerateStrategyRequest>(
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

    // Retrieve session data
    const sessionData = await sessionManager.getSessionData(sessionId);
    const existingStrategy = sessionData.strategy;

    if (!existingStrategy) {
      res.status(STATUS_CODES.BAD_REQUEST).json(
        formatErrorResponse(new Error('No existing strategy found. Generate a strategy first.'))
      );
      return;
    }

    logger.info('Regenerating strategy', { sessionId, field: field || 'all' });

    const geminiClient = new GeminiClient();
    let updatedStrategy: Strategy;

    if (field) {
      // Regenerate only the specified field
      const newStrategy = await geminiClient.generateStrategy(features, platform);

      updatedStrategy = {
        ...existingStrategy,
        [field]: newStrategy[field as keyof Strategy],
      };

      // If regenerating cover, also regenerate cover image
      if (field === 'cover') {
        const coverImageUrl = await geminiClient.generateCoverImage(updatedStrategy.cover);
        updatedStrategy.coverImageUrl = coverImageUrl;
      }

      logger.info('Field regenerated', { sessionId, field });
    } else {
      // Regenerate entire strategy
      updatedStrategy = await geminiClient.generateStrategy(features, platform);
      const coverImageUrl = await geminiClient.generateCoverImage(updatedStrategy.cover);
      updatedStrategy.coverImageUrl = coverImageUrl;

      logger.info('Entire strategy regenerated', { sessionId });
    }

    // Store updated strategy in session
    await sessionManager.setSessionData(sessionId, {
      ...sessionData,
      strategy: updatedStrategy,
    });

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
