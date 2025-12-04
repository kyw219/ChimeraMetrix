import { VideoMetadata, SimilarityQuery, SimilarVideo } from '../types';

/**
 * Simple keyword-based similarity matching (fast alternative to Gemini)
 * This avoids API calls and completes in milliseconds
 */
export function findSimilarVideosFast(
  query: SimilarityQuery,
  videos: VideoMetadata[]
): SimilarVideo[] {
  // Calculate similarity score for each video
  const scored = videos.map(video => ({
    video,
    score: calculateSimilarity(query, video),
  }));

  // Sort by score and take top 5
  const top5 = scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  // Convert to SimilarVideo format
  return top5.map(({ video, score }) => ({
    videoId: video.videoId,
    title: video.title,
    similarity: score,
    ctr: 'N/A', // Will be filled from time-series data
    views24h: 'N/A', // Will be filled from time-series data
  }));
}

function calculateSimilarity(query: SimilarityQuery, video: VideoMetadata): number {
  let score = 0;

  // 1. Category match (40% weight)
  if (video.category.toLowerCase() === query.category.toLowerCase()) {
    score += 0.4;
  } else if (
    video.category.toLowerCase().includes(query.category.toLowerCase().split(' ')[0]) ||
    query.category.toLowerCase().includes(video.category.toLowerCase())
  ) {
    score += 0.2;
  }

  // 2. Platform match (10% weight)
  if (video.platform === query.platform) {
    score += 0.1;
  }

  // 3. Hashtag overlap (25% weight)
  const queryHashtags = extractHashtags(query.hashtags);
  const videoHashtags = extractHashtags(video.hashtags);
  const hashtagOverlap = calculateOverlap(queryHashtags, videoHashtags);
  score += hashtagOverlap * 0.25;

  // 4. Title similarity (15% weight)
  const titleSimilarity = calculateTextSimilarity(query.title, video.title);
  score += titleSimilarity * 0.15;

  // 5. Cover description similarity (10% weight)
  const coverSimilarity = calculateTextSimilarity(
    query.coverDescription,
    video.coverDescription
  );
  score += coverSimilarity * 0.1;

  return Math.min(1, score); // Cap at 1.0
}

function extractHashtags(text: string): string[] {
  const matches = text.match(/#\w+/g) || [];
  return matches.map(tag => tag.toLowerCase());
}

function calculateOverlap(arr1: string[], arr2: string[]): number {
  if (arr1.length === 0 || arr2.length === 0) return 0;
  
  const set1 = new Set(arr1);
  const set2 = new Set(arr2);
  
  let overlap = 0;
  set1.forEach(item => {
    if (set2.has(item)) overlap++;
  });
  
  return overlap / Math.max(set1.size, set2.size);
}

function calculateTextSimilarity(text1: string, text2: string): number {
  const words1 = tokenize(text1);
  const words2 = tokenize(text2);
  
  return calculateOverlap(words1, words2);
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2); // Filter out short words
}
