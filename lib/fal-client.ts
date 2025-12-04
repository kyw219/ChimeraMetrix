import * as fal from '@fal-ai/serverless-client';
import { logger } from './errors';

fal.config({
  credentials: process.env.FAL_API_KEY,
});

export interface VideoFrame {
  url: string;
  timestamp: number;
}

/**
 * Extract key frames from video using fal.ai
 */
export async function extractVideoFrames(videoBuffer: Buffer): Promise<VideoFrame[]> {
  try {
    console.log('🎬 Uploading video to fal.ai for frame extraction...');
    
    // Upload video to fal.ai
    const videoUrl = await fal.storage.upload(videoBuffer);
    console.log('✅ Video uploaded:', videoUrl);

    // Extract frames
    const result = await fal.subscribe('fal-ai/video-to-frames', {
      input: {
        video_url: videoUrl,
        num_frames: 5, // Extract 5 key frames
      },
    });

    console.log('✅ Frames extracted:', result.data.frames?.length || 0);
    
    return result.data.frames || [];
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
