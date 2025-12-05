import { VercelRequest, VercelResponse } from '@vercel/node';
import { GeminiClient } from '../lib/gemini';
import { csvDatabase } from '../lib/csv-db';
import { sessionManager } from '../lib/session';
import { applyCorsAndSecurity } from '../lib/cors';
import { formatErrorResponse, STATUS_CODES, logger } from '../lib/errors';
import { validateRequestBody, validatePlatform, validateSessionId } from '../lib/validators';
import { BacktestRequest, BacktestResponse, SimilarityQuery, PerformanceDrivers } from '../types';
import { findSimilarVideosFast } from '../lib/simple-matcher';

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

    logger.info('Backtest request received');

    // Validate request body
    const { sessionId, strategy, features, platform } = validateRequestBody<BacktestRequest>(
      req.body,
      ['sessionId', 'strategy', 'features', 'platform']
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

    // Session validation (optional in serverless)
    try {
      await sessionManager.getSessionData(sessionId);
      logger.info('Session retrieved for backtest', { sessionId });
    } catch (error) {
      // Session not found - this is OK in serverless, we have all data in request
      logger.warn('Session not found, using request data', { sessionId });
    }

    // Initialize CSV database
    await csvDatabase.initialize();

    const geminiClient = new GeminiClient();

    // Step 1: Use cover text description (skip imageToText to save time)
    const coverDescription = strategy.cover;
    logger.info('Using cover text description for similarity matching');

    // Step 2: Find 5 similar videos using semantic matching
    const similarityQuery: SimilarityQuery = {
      coverDescription,
      title: strategy.title,
      hashtags: strategy.hashtags,
      category: features.category,
      platform,
    };

    // Use fast keyword-based matching instead of slow Gemini API
    const allVideos = await csvDatabase.getAllVideoMetadata();
    
    // Filter by platform first
    const platformVideos = allVideos.filter(v => v.platform === platform);
    
    logger.info('Finding similar videos', { 
      total: allVideos.length, 
      platform: platformVideos.length,
      category: features.category 
    });
    
    // Use fast similarity matching (completes in milliseconds)
    const similarVideos = findSimilarVideosFast(similarityQuery, platformVideos);

    if (similarVideos.length !== 5) {
      throw new Error(`Expected 5 similar videos, got ${similarVideos.length}`);
    }

    logger.info('Similar videos found', { count: similarVideos.length });

    // Step 3: Retrieve time-series data for matched videos
    const videoIds = similarVideos.map((v) => v.videoId);
    const timeSeriesData = await csvDatabase.getTimeSeriesData(videoIds);

    // Step 4: Aggregate time-series data (calculate averages)
    const aggregatedMetrics = csvDatabase.aggregateTimeSeries(timeSeriesData);

    logger.info('Time-series data aggregated');

    // Step 5: Enrich similar videos with CTR and views data
    const enrichedSimilarVideos = similarVideos.map((video, index) => {
      const data = timeSeriesData[index];
      return {
        ...video,
        ctr: (data.ctr_24h * 100).toFixed(2) + '%',
        views24h: data.views_24h.toFixed(0),
      };
    });

    // Step 6: Analyze performance drivers (with timeout protection)
    let performanceDrivers: PerformanceDrivers;
    try {
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

      // Remove coverImageUrl from strategy to avoid sending large base64 data to Gemini
      const strategyForAnalysis = {
        cover: strategy.cover,
        title: strategy.title,
        description: strategy.description,
        hashtags: strategy.hashtags,
        postingTime: strategy.postingTime,
      };

      // Set a timeout for this API call
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Performance analysis timeout')), 45000)
      );
      
      performanceDrivers = await Promise.race([
        geminiClient.analyzePerformanceDrivers(strategyForAnalysis, videoMetadata),
        timeoutPromise
      ]) as PerformanceDrivers;

      logger.info('Performance drivers analyzed', { sessionId });
    } catch (error) {
      logger.warn('Performance driver analysis failed or timed out, using defaults', { error });
      // Use default performance drivers
      performanceDrivers = {
        coverDesign: { impact: 'High', reason: 'Visual appeal is crucial for click-through rates' },
        titleFraming: { impact: 'High', reason: 'Compelling titles drive initial interest' },
        hashtagCombination: { impact: 'Medium', reason: 'Hashtags help with discoverability' },
        postingTime: { impact: 'Medium', reason: 'Timing affects initial visibility' },
      };
    }

    // Return response
    const response: BacktestResponse = {
      predictions: aggregatedMetrics,
      matchedVideos: enrichedSimilarVideos,
      performanceDrivers,
    };

    logger.info('Backtest response prepared', {
      hasPredictions: !!aggregatedMetrics,
      hasMatchedVideos: enrichedSimilarVideos.length,
      hasPerformanceDrivers: !!performanceDrivers,
      predictionsKeys: Object.keys(aggregatedMetrics || {}),
    });

    res.status(STATUS_CODES.OK).json({
      success: true,
      data: response,
    });
  } catch (error) {
    logger.error('Backtest failed', { error });

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
