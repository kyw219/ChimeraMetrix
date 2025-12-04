import * as fal from '@fal-ai/serverless-client';
import { logger } from './errors';

fal.config({
  credentials: process.env.FAL_API_KEY,
});

export interface VideoFrame {
  url: string;
  width: number;
  height: number;
  file_size: number;
}

/**
 * Extract middle frame from video using fal.ai
 */
export async function extractVideoFrame(videoBuffer: Buffer): Promise<VideoFrame> {
  try {
    console.log('🎬 Uploading video to fal.ai for frame extraction...');
    
    // Convert Buffer to Blob
    const blob = new Blob([videoBuffer], { type: 'video/mp4' });
    
    // Upload video to fal.ai
    const videoUrl = await fal.storage.upload(blob);
    console.log('✅ Video uploaded to fal.ai:', videoUrl);

    // Extract middle frame (most likely to contain main subject/face)
    console.log('📸 Extracting middle frame...');
    const result: any = await fal.subscribe('fal-ai/ffmpeg-api/extract-frame', {
      input: {
        video_url: videoUrl,
        frame_type: 'middle',
      },
    });

    const frame = result.images?.[0];
    if (!frame) {
      throw new Error('No frame extracted from video');
    }

    console.log('✅ Frame extracted:', frame.url);
    console.log('   Dimensions:', `${frame.width}x${frame.height}`);
    console.log('   Size:', frame.file_size, 'bytes');
    
    return {
      url: frame.url,
      width: frame.width,
      height: frame.height,
      file_size: frame.file_size,
    };
  } catch (error) {
    console.error('❌ Frame extraction failed:', error);
    logger.error('fal.ai frame extraction failed', { error });
    throw error;
  }
}

/**
 * Download frame image as buffer
 */
export async function downloadFrame(frameUrl: string): Promise<Buffer> {
  const response = await fetch(frameUrl);
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
