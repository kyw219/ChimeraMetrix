import { VercelRequest, VercelResponse } from '@vercel/node';
import { GeminiClient } from '../lib/gemini';
import { csvDatabase } from '../lib/csv-db';
import { sessionManager } from '../lib/session';
import { applyCorsAndSecurity } from '../lib/cors';
import { formatErrorResponse, sanitizeError, STATUS_CODES, Logger } from '../lib/errors';
import { validateRequestBody, validatePlatform, validateSessionId } from '../lib/validators';
import { BacktestRequest, BacktestResponse, SimilarityQuery } from '../types';

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

    Logger.info('Backtest request received');

    // Validate request body
    const validation = validateRequestBody<BacktestRequest>(
      req.body,
      ['sessionId', 'strategy', 'features', 'platform']
    );

    if (!validation.valid) {
      res.status(STATUS_CODES.BAD_REQUEST).json(
        formatErrorResponse(new Error(validation.error))
      );
      return;
    }

    const { sessionId, strategy, features, platform } = validation.data!;

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
    await sessionManager.getSessionData(sessionId);
    Logger.info('Session retrieved for backtest', { sessionId });

    // Initialize CSV database
    await csvDatabase.initialize();

    const geminiClient = new GeminiClient();

    // Step 1: Convert cover image to text description
    let coverDescription = strategy.cover;
    if (strategy.coverImageUrl) {
      try {
        coverDescription = await geminiClient.imageToText(strategy.coverImageUrl);
        Logger.info('Cover image converted to text');
      } catch (error) {
        Logger.warn('Failed to convert cover image, using text description', { error });
      }
    }

    // Step 2: Find 5 similar videos using semantic matching
    const similarityQuery: SimilarityQuery = {
      coverDescription,
      title: strategy.title,
      hashtags: strategy.hashtags,
      category: features.category,
      platform,
    };

    const allVideos = await csvDatabase.getAllVideoMetadata();
    const similarVideos = await geminiClient.findSimilarVideos(similarityQuery, allVideos);

    if (similarVideos.length !== 5) {
      throw new Error(`Expected 5 similar videos, got ${similarVideos.length}`);
    }

    Logger.info('Similar videos found', { count: similarVideos.length });

    // Step 3: Retrieve time-series data for matched videos
    const videoIds = similarVideos.map((v) => v.videoId);
    const timeSeriesData = await csvDatabase.getTimeSeriesData(videoIds);

    // Step 4: Aggregate time-series data (calculate averages)
    const aggregatedMetrics = csvDatabase.aggregateTimeSeries(timeSeriesData);

    Logger.info('Time-series data aggregated');

    // Step 5: Enrich similar videos with CTR and views data
    const enrichedSimilarVideos = similarVideos.map((video, index) => {
      const data = timeSeriesData[index];
      return {
        ...video,
        ctr: (data.ctr_24h * 100).toFixed(2) + '%',
        views24h: data.views_24h.toFixed(0),
      };
    });

    // Step 6: Analyze performance drivers
    const matchedVideoMetadata = await csvDatabase.getVideosByIds(videoIds);
    const videoMetadata = matchedVideoMetadata.map((row) => ({
      videoId: row.video_id,
      platform: row.platform,
      category: row.category,
      title: row.title,
      coverDescription: row.cover_description,
      hashtags: row.hashtags,
      postingHour: parseInt(row.posting_hour) || 0,
    }));

    const performanceDrivers = await geminiClient.analyzePerformanceDrivers(
      strategy,
      videoMetadata
    );

    Logger.info('Performance drivers analyzed', { sessionId });

    // Return response
    const response: BacktestResponse = {
      predictions: aggregatedMetrics,
      matchedVideos: enrichedSimilarVideos,
      performanceDrivers,
    };

    res.status(STATUS_CODES.OK).json({
      success: true,
      data: response,
    });
  } catch (error) {
    Logger.error('Backtest failed', { error });

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
