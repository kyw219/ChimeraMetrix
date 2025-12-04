import { ThumbnailDescription } from '../types';
import { logger } from './errors';

/**
 * Banana API Client for generating YouTube thumbnails
 */
export class BananaClient {
  private apiKey: string;
  private apiUrl: string = 'https://api.banana.dev/start/v4';

  constructor() {
    this.apiKey = process.env.BANANA_API_KEY || '';
    if (!this.apiKey) {
      logger.warn('Banana API key not configured');
    }
  }

  /**
   * Generate thumbnail image from structured description
   */
  async generateThumbnail(description: ThumbnailDescription): Promise<string> {
    if (!this.apiKey) {
      throw new Error('Banana API key not configured');
    }

    try {
      // Build optimized prompt for Banana
      const prompt = this.buildBananaPrompt(description);

      logger.info('Generating thumbnail with Banana', { prompt: prompt.substring(0, 100) });

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          modelKey: 'your-model-key', // You'll need to replace this with your actual model key
          modelInputs: {
            prompt,
            negative_prompt: 'blurry, low quality, distorted, ugly, bad anatomy, watermark, text artifacts',
            width: 1280,
            height: 720,
            num_inference_steps: 30,
            guidance_scale: 7.5,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Banana API error: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Extract image URL from response
      const imageUrl = data.modelOutputs?.[0]?.image_base64 
        ? `data:image/png;base64,${data.modelOutputs[0].image_base64}`
        : data.modelOutputs?.[0]?.image_url;

      if (!imageUrl) {
        throw new Error('No image URL in Banana response');
      }

      logger.info('Thumbnail generated successfully');
      return imageUrl;
    } catch (error) {
      logger.error('Banana thumbnail generation failed', { error });
      throw error;
    }
  }

  /**
   * Build optimized prompt for Banana from structured description
   */
  private buildBananaPrompt(desc: ThumbnailDescription): string {
    const parts: string[] = [];

    // Main subject
    parts.push(`Main subject: ${desc.main_subject}`);

    // Objects
    if (desc.extracted_objects.length > 0) {
      parts.push(`Objects: ${desc.extracted_objects.join(', ')}`);
    }

    // Background
    parts.push(`Background: ${desc.background_style}`);

    // Composition
    parts.push(`Composition: subject ${desc.composition.subject_position}, text ${desc.composition.text_position}, ${desc.composition.object_positioning}`);

    // Lighting
    parts.push(`Lighting: ${desc.lighting_effects}`);

    // Mood
    parts.push(`Mood: ${desc.emotion_mood}`);

    // Text overlay
    parts.push(`Text overlay: "${desc.text_overlay.title}" (${desc.text_overlay.font_style})`);
    if (desc.text_overlay.subtitle) {
      parts.push(`Subtitle: "${desc.text_overlay.subtitle}"`);
    }

    // Colors
    parts.push(`Colors: primary ${desc.color_palette.primary}, secondary ${desc.color_palette.secondary}, accent ${desc.color_palette.accent}`);

    // Style modifiers for high-quality YouTube thumbnail
    parts.push('Style: professional YouTube thumbnail, high contrast, eye-catching, 4K quality, sharp details, dramatic lighting');

    return parts.join('. ');
  }
}
