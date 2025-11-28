import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  VideoFeatures,
  Strategy,
  VideoMetadata,
  SimilarVideo,
  PerformanceDrivers,
  SimilarityQuery,
} from '../types';
import { APIError, logger } from './errors';

export class GeminiClient {
  private genAI: GoogleGenerativeAI;
  private model: any;
  private maxRetries: number = 3;

  constructor(apiKey?: string) {
    const key = apiKey || process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error('GEMINI_API_KEY is required');
    }

    this.genAI = new GoogleGenerativeAI(key);
    this.model = this.genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || 'gemini-1.5-pro',
    });
  }

  /**
   * Retry logic with exponential backoff
   */
  private async retryWithBackoff<T>(
    fn: () => Promise<T>,
    attempt: number = 0
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      if (attempt >= this.maxRetries - 1) {
        throw error;
      }

      const delay = Math.pow(2, attempt) * 1000; // 0s, 1s, 2s
      logger.warn(`Retry attempt ${attempt + 1} after ${delay}ms`, { error });
      await new Promise((resolve) => setTimeout(resolve, delay));
      return this.retryWithBackoff(fn, attempt + 1);
    }
  }

  /**
   * Analyze video and extract features
   */
  async analyzeVideo(videoBuffer: Buffer, platform: string): Promise<VideoFeatures> {
    console.log('🔍 analyzeVideo called');
    console.log('   - Buffer size:', videoBuffer.length);
    console.log('   - Platform:', platform);
    
    return this.retryWithBackoff(async () => {
      try {
        console.log('📝 Preparing Gemini prompt...');
        const prompt = `Analyze this ${platform} video and extract the following features in JSON format:
{
  "category": "main content category (e.g., Food & Cooking, Tech, Gaming)",
  "emotion": "primary emotion conveyed (e.g., Excitement & Curiosity, Calm & Relaxing)",
  "visualStyle": "visual style description (e.g., High-contrast close-up shots, Cinematic wide angles)",
  "keywords": ["array", "of", "relevant", "keywords"],
  "audience": "target audience description (e.g., Gen Z food enthusiasts, Tech professionals)",
  "hookType": "type of hook used (e.g., Visual Hook, Question Hook, Shock Hook)"
}

Provide only the JSON response, no additional text.`;

        console.log('🚀 Calling Gemini API...');
        console.log('   - Model:', process.env.GEMINI_MODEL || 'gemini-1.5-pro');
        console.log('   - Video base64 length:', videoBuffer.toString('base64').length);
        
        const result = await this.model.generateContent([
          prompt,
          {
            inlineData: {
              data: videoBuffer.toString('base64'),
              mimeType: 'video/mp4',
            },
          },
        ]);

        console.log('✅ Gemini API call completed');
        const response = await result.response;
        console.log('📄 Parsing response...');
        let text = response.text();
        console.log('📝 Raw response text:', text.substring(0, 200) + '...');
        
        // Clean up markdown code blocks if present
        text = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
        console.log('🧹 Cleaned text:', text.substring(0, 200) + '...');
        
        const features = JSON.parse(text);
        console.log('✅ Features parsed successfully:', features);

        logger.info('Video analyzed successfully', { platform });
        return features as VideoFeatures;
      } catch (error) {
        console.error('❌ Gemini API error:', error);
        console.error('   - Error type:', error?.constructor?.name);
        console.error('   - Error message:', error instanceof Error ? error.message : String(error));
        console.error('   - Error stack:', error instanceof Error ? error.stack : 'N/A');
        console.error('   - Full error:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
        logger.error('Video analysis failed', { error });
        
        // Preserve original error message
        const errorMessage = error instanceof Error ? error.message : 'Failed to analyze video';
        throw new APIError(`Gemini API Error: ${errorMessage}`, 502);
      }
    });
  }

  /**
   * Generate complete strategy
   */
  async generateStrategy(features: VideoFeatures, platform: string): Promise<Strategy> {
    return this.retryWithBackoff(async () => {
      try {
        const prompt = `Based on these video features for ${platform}, generate a content strategy in JSON format:

Features:
${JSON.stringify(features, null, 2)}

Generate:
{
  "cover": "detailed description of an eye-catching cover image (describe visual elements, colors, composition)",
  "title": "engaging title optimized for ${platform}",
  "hashtags": "space-separated relevant hashtags",
  "postingTime": "optimal posting time (e.g., 7:00 PM EST)"
}

Provide only the JSON response, no additional text.`;

        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();
        // Clean up markdown code blocks if present
        text = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
        const strategy = JSON.parse(text);

        logger.info('Strategy generated successfully', { platform });
        return strategy as Strategy;
      } catch (error) {
        logger.error('Strategy generation failed', { error });
        throw new APIError('Failed to generate strategy', 502);
      }
    });
  }

  /**
   * Generate cover image (placeholder - returns description)
   */
  async generateCoverImage(description: string): Promise<string> {
    // Note: Gemini API doesn't support image generation yet
    // This is a placeholder that returns a URL format
    // In production, integrate with an image generation API
    logger.info('Cover image generation requested', { description });
    return `https://placeholder.com/cover?desc=${encodeURIComponent(description)}`;
  }

  /**
   * Convert cover image to text description
   */
  async imageToText(imageUrl: string): Promise<string> {
    return this.retryWithBackoff(async () => {
      try {
        const prompt = `Describe this cover image in detail, focusing on:
- Visual elements and composition
- Colors and style
- Subject matter
- Overall mood and appeal

Provide a concise description (2-3 sentences).`;

        // Note: In production, fetch the image and pass it to Gemini
        // For now, we'll use a text-based approach
        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        logger.info('Image converted to text', { imageUrl });
        return text;
      } catch (error) {
        logger.error('Image to text conversion failed', { error });
        throw new APIError('Failed to convert image to text', 502);
      }
    });
  }

  /**
   * Find similar videos using semantic matching
   */
  async findSimilarVideos(
    query: SimilarityQuery,
    historicalData: VideoMetadata[]
  ): Promise<SimilarVideo[]> {
    return this.retryWithBackoff(async () => {
      try {
        const prompt = `Given this video query:
Platform: ${query.platform}
Category: ${query.category}
Cover: ${query.coverDescription}
Title: ${query.title}
Hashtags: ${query.hashtags}

Find the 5 most similar videos from this historical data and return EXACTLY 5 results in JSON format:
[
  {
    "videoId": "id from historical data",
    "similarity": 0.95 (score between 0 and 1)
  },
  ... (exactly 5 entries)
]

Historical data:
${JSON.stringify(historicalData.slice(0, 100), null, 2)}

Provide only the JSON array, no additional text. MUST return exactly 5 results.`;

        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();
        // Clean up markdown code blocks if present
        text = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
        const matches = JSON.parse(text);

        // Ensure exactly 5 results
        const topMatches = matches.slice(0, 5);
        if (topMatches.length < 5) {
          throw new Error('Gemini returned fewer than 5 matches');
        }

        // Enrich with metadata
        const enriched: SimilarVideo[] = topMatches.map((match: any) => {
          const video = historicalData.find((v) => v.videoId === match.videoId);
          return {
            videoId: match.videoId,
            title: video?.title || 'Unknown',
            similarity: Math.min(1, Math.max(0, match.similarity)), // Clamp to [0, 1]
            ctr: 'N/A', // Will be filled from time-series data
            views24h: 'N/A', // Will be filled from time-series data
          };
        });

        logger.info('Similar videos found', { count: enriched.length });
        return enriched;
      } catch (error) {
        logger.error('Similarity matching failed', { error });
        throw new APIError('Failed to find similar videos', 502);
      }
    });
  }

  /**
   * Analyze performance drivers
   */
  async analyzePerformanceDrivers(
    strategy: Strategy,
    matchedVideos: VideoMetadata[]
  ): Promise<PerformanceDrivers> {
    return this.retryWithBackoff(async () => {
      try {
        const prompt = `Analyze how each element of this strategy impacts performance based on similar videos:

Strategy:
${JSON.stringify(strategy, null, 2)}

Similar Videos:
${JSON.stringify(matchedVideos, null, 2)}

Analyze the impact of each strategy component and return in JSON format:
{
  "coverDesign": {
    "impact": "High" | "Medium" | "Low",
    "reason": "brief explanation"
  },
  "titleFraming": {
    "impact": "High" | "Medium" | "Low",
    "reason": "brief explanation"
  },
  "hashtagCombination": {
    "impact": "High" | "Medium" | "Low",
    "reason": "brief explanation"
  },
  "postingTime": {
    "impact": "High" | "Medium" | "Low",
    "reason": "brief explanation"
  }
}

Provide only the JSON response, no additional text.`;

        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();
        // Clean up markdown code blocks if present
        text = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
        const drivers = JSON.parse(text);

        logger.info('Performance drivers analyzed');
        return drivers as PerformanceDrivers;
      } catch (error) {
        logger.error('Performance driver analysis failed', { error });
        throw new APIError('Failed to analyze performance drivers', 502);
      }
    });
  }
}
