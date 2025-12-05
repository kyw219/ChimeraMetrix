import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleGenAI } from '@google/genai';
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
  private newGenAI: GoogleGenAI; // New SDK for image generation
  private model: any;
  private maxRetries: number = 2; // Reduced from 3 to 2 for faster response

  constructor(apiKey?: string) {
    const key = apiKey || process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error('GEMINI_API_KEY is required');
    }

    // Old SDK for text/video analysis
    this.genAI = new GoogleGenerativeAI(key);
    this.model = this.genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || 'gemini-1.5-pro',
    });

    // New SDK for image generation
    this.newGenAI = new GoogleGenAI({ apiKey: key });
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
   * Generate detailed cover prompt based on features
   */
  private generateCoverPromptFromFeatures(
    features: VideoFeatures,
    platform: string,
    title: string
  ): string {
    const aspectRatio = platform === 'youtube' ? '16:9' : '9:16';

    // Extract key phrase from title (2-3 words max for better fit)
    const headline = title
      .replace(/[🔥💥✨⚡️]/g, '')
      .trim()
      .split(/[:\-]/)[0]
      .trim()
      .split(' ')
      .slice(0, 3)
      .join(' ')
      .toUpperCase();

    return `Create a ${aspectRatio} ${platform} thumbnail with professional YouTube style.

🎯 PRIMARY GOAL: Create eye-catching thumbnail where ALL TEXT IS FULLY VISIBLE (not cut off by edges)

📐 IMAGE SPECIFICATIONS:
- Aspect ratio: ${aspectRatio}
- Platform: ${platform}
- Subject: ${features.category}
- Emotion: ${features.emotion}
- Visual style: ${features.visualStyle}

👤 SUBJECT COMPOSITION:
- Keep person's face and main subject in CENTER of frame
- Face should be the primary focal point
- Use rule-of-thirds for dynamic composition
- Maintain ${features.emotion} expression
- High contrast, bright lighting, sharp focus
- Slightly blur background to emphasize subject

🔤 TEXT OVERLAY - SINGLE LINE ONLY:
Text content: "${headline}"

TEXT PLACEMENT RULES (CRITICAL - MUST FOLLOW):
1. Place text in MIDDLE-LEFT or MIDDLE-RIGHT area (vertically centered, horizontally offset)
2. OR place text in LOWER-CENTER area (bottom third, but NOT at the very bottom)
3. NEVER place text at the very top, very bottom, or very edges
4. Text must be FULLY INSIDE the image with large margins

TEXT SPACING (ABSOLUTE REQUIREMENT):
- Minimum 20% margin from top edge
- Minimum 20% margin from bottom edge  
- Minimum 15% margin from left edge
- Minimum 15% margin from right edge
- If you cannot fit text with these margins, make text SMALLER

TEXT STYLE:
- Font: Bold, thick, impact-style
- Color: Bright yellow (#FFD700) OR white
- Outline: Thick black stroke (6-8px)
- Size: Large but must fit within safe margins
- Add drop shadow for depth
- Must be readable at thumbnail size

🎨 VISUAL TREATMENT:
- Enhance colors and contrast
- Add subtle vignette at edges
- Glow effect behind text for readability
- Keep overall composition clean and uncluttered
- Professional YouTube thumbnail aesthetic

✅ FINAL CHECKLIST BEFORE GENERATING:
□ Is the face/subject in the center and fully visible?
□ Is ALL text at least 20% away from top/bottom edges?
□ Is ALL text at least 15% away from left/right edges?
□ Can I see the complete text without any letters cut off?
□ Is the text large and bold enough to read at small size?
□ Does the composition look professional and clickable?

⛔ ABSOLUTE RULE: If text would be cut off by edges, MOVE IT INWARD or MAKE IT SMALLER. Never let text touch edges.`;
  }

  /**
   * Generate complete strategy with cover image based on video frame
   */
  async generateStrategy(
    features: VideoFeatures, 
    platform: string, 
    frameUrl?: string
  ): Promise<Strategy> {
    return this.retryWithBackoff(async () => {
      try {
        console.log('📝 Step 1: Generating strategy text...');
        
        // Step 1: 生成策略文字（title, hashtags, postingTime）
        const strategyPrompt = `Based on these video features for ${platform}, generate a content strategy in JSON format:

Features:
${JSON.stringify(features, null, 2)}

Generate:
{
  "title": "engaging title optimized for ${platform} (concise, under 60 characters)",
  "hashtags": "space-separated relevant hashtags",
  "postingTime": "optimal posting time (e.g., 7:00 PM EST)"
}

Provide only the JSON response, no additional text.`;

        const strategyResult = await this.model.generateContent(strategyPrompt);
        const strategyResponse = await strategyResult.response;
        let strategyText = strategyResponse.text();
        strategyText = strategyText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
        const strategyData = JSON.parse(strategyText);

        console.log('✅ Strategy text generated:', strategyData);

        // Step 2: 生成详细的封面描述
        console.log('🎨 Step 2: Generating cover image...');
        const coverPrompt = this.generateCoverPromptFromFeatures(
          features,
          platform,
          strategyData.title
        );

        console.log('📸 Cover prompt:', coverPrompt.substring(0, 200) + '...');

        // Step 3: 使用图片生成模型创建封面
        let coverImageUrl: string | undefined;
        const coverDescription = 'AI-generated thumbnail optimized for ' + platform;

        try {
          console.log('🎨 Generating cover image with gemini-2.5-flash-image...');
          
          // 如果有视频帧，基于帧生成封面（保留人脸等元素）
          if (frameUrl) {
            console.log('📸 Using video frame as reference:', frameUrl);
            
            // 下载帧
            const frameResponse = await fetch(frameUrl);
            const frameBuffer = await frameResponse.arrayBuffer();
            const frameBase64 = Buffer.from(frameBuffer).toString('base64');
            
            // 基于帧生成封面
            const response = await this.newGenAI.models.generateContent({
              model: 'gemini-2.5-flash-image',
              contents: [
                coverPrompt + '\n\nIMPORTANT: Keep the person/face from the original frame.',
                {
                  inlineData: {
                    data: frameBase64,
                    mimeType: 'image/jpeg',
                  },
                },
              ],
            });

            const parts = response.candidates?.[0]?.content?.parts || [];
            console.log('Parts received:', parts.length);
            
            for (const part of parts) {
              if (part.inlineData?.data) {
                console.log('✅ Cover generated with video frame reference!');
                const base64Data = part.inlineData.data;
                const mimeType = part.inlineData.mimeType || 'image/png';
                coverImageUrl = `data:${mimeType};base64,${base64Data}`;
                console.log('   Size:', base64Data.length, 'bytes');
                break;
              }
            }
          } else {
            // 没有帧时，纯文字生成
            console.log('📸 Generating cover from text prompt only...');
            
            const response = await this.newGenAI.models.generateContent({
              model: 'gemini-2.5-flash-image',
              contents: coverPrompt,
            });

            const parts = response.candidates?.[0]?.content?.parts || [];
            
            for (const part of parts) {
              if (part.inlineData?.data) {
                console.log('✅ Cover generated from text!');
                const base64Data = part.inlineData.data;
                const mimeType = part.inlineData.mimeType || 'image/png';
                coverImageUrl = `data:${mimeType};base64,${base64Data}`;
                break;
              }
            }
          }
        } catch (imageError) {
          console.error('❌ Image generation failed:', imageError);
          console.error('Error details:', imageError instanceof Error ? imageError.message : String(imageError));
          logger.warn('Cover image generation failed, using text description', { imageError });
        }

        const strategy: Strategy = {
          cover: coverDescription,
          coverImageUrl,
          title: strategyData.title,
          hashtags: strategyData.hashtags,
          postingTime: strategyData.postingTime,
        };

        logger.info('Strategy generated successfully', { 
          platform, 
          hasImage: !!coverImageUrl 
        });
        
        return strategy;
      } catch (error) {
        logger.error('Strategy generation failed', { error });
        throw new APIError('Failed to generate strategy', 502);
      }
    });
  }

  /**
   * Regenerate only the cover field with image
   */
  async regenerateCover(features: VideoFeatures, platform: string, title: string, frameUrl?: string): Promise<{ cover: string; coverImageUrl?: string }> {
    return this.retryWithBackoff(async () => {
      try {
        let coverImageUrl: string | undefined;
        const coverDescription = 'AI-generated thumbnail optimized for ' + platform;

        try {
          // Use the same high-quality prompt as generateStrategy
          const imagePrompt = this.generateCoverPromptFromFeatures(features, platform, title);
          
          if (frameUrl) {
            // Use frame as reference
            const frameResponse = await fetch(frameUrl);
            const frameBuffer = await frameResponse.arrayBuffer();
            const frameBase64 = Buffer.from(frameBuffer).toString('base64');
            
            const response = await this.newGenAI.models.generateContent({
              model: 'gemini-2.5-flash-image',
              contents: [
                imagePrompt + '\n\nIMPORTANT: Use the provided video frame as the base. Keep the person/face and main subject from the original frame.',
                {
                  inlineData: {
                    data: frameBase64,
                    mimeType: 'image/jpeg',
                  },
                },
              ],
            });

            const parts = response.candidates?.[0]?.content?.parts || [];
            for (const part of parts) {
              if (part.inlineData?.data) {
                const base64Data = part.inlineData.data;
                const mimeType = part.inlineData.mimeType || 'image/png';
                coverImageUrl = `data:${mimeType};base64,${base64Data}`;
                console.log('✅ Cover regenerated with frame reference');
                break;
              }
            }
          } else {
            // Text-only generation
            const response = await this.newGenAI.models.generateContent({
              model: 'gemini-2.5-flash-image',
              contents: imagePrompt,
            });

            const parts = response.candidates?.[0]?.content?.parts || [];
            for (const part of parts) {
              if (part.inlineData?.data) {
                const base64Data = part.inlineData.data;
                const mimeType = part.inlineData.mimeType || 'image/png';
                coverImageUrl = `data:${mimeType};base64,${base64Data}`;
                console.log('✅ Cover regenerated from text');
                break;
              }
            }
          }
        } catch (imageError) {
          console.error('❌ Image regeneration failed:', imageError);
          logger.warn('Cover image regeneration failed', { imageError });
        }

        return {
          cover: coverDescription,
          coverImageUrl,
        };
      } catch (error) {
        logger.error('Cover regeneration failed', { error });
        throw new APIError('Failed to regenerate cover', 502);
      }
    });
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
