// Core data models
export interface VideoFeatures {
  category: string;
  emotion: string;
  visualStyle: string;
  keywords: string[];
  audience: string;
  hookType: string;
}

export interface Strategy {
  cover: string;
  coverImageUrl?: string;
  title: string;
  hashtags: string;
  postingTime: string;
}

export interface VideoMetadata {
  videoId: string;
  platform: string;
  category: string;
  title: string;
  coverDescription: string;
  hashtags: string;
  postingHour: number;
}

export interface TimeSeriesData {
  videoId: string;
  views_1h: number;
  views_3h: number;
  views_6h: number;
  views_12h: number;
  views_24h: number;
  ctr_1h: number;
  ctr_3h: number;
  ctr_6h: number;
  ctr_12h: number;
  ctr_24h: number;
  likes_1h: number;
  likes_3h: number;
  likes_6h: number;
  likes_12h: number;
  likes_24h: number;
}

export interface AggregatedMetrics {
  views: Array<{ time: string; value: number }>;
  ctr: Array<{ time: string; value: number }>;
  likes: Array<{ time: string; value: number }>;
  metrics: {
    views24h: string;
    ctr24h: string;
    likes24h: string;
  };
}

export interface PerformanceDrivers {
  coverDesign: {
    impact: 'High' | 'Medium' | 'Low';
    reason: string;
  };
  titleFraming: {
    impact: 'High' | 'Medium' | 'Low';
    reason: string;
  };
  hashtagCombination: {
    impact: 'High' | 'Medium' | 'Low';
    reason: string;
  };
  postingTime: {
    impact: 'High' | 'Medium' | 'Low';
    reason: string;
  };
}

// API request/response types
export interface AnalyzeRequest {
  video: Buffer;
  platform: string;
}

export interface AnalyzeResponse {
  sessionId: string;
  features: VideoFeatures;
}

export interface GenerateStrategyRequest {
  sessionId: string;
  features: VideoFeatures;
  platform: string;
}

export interface RegenerateStrategyRequest {
  sessionId: string;
  features: VideoFeatures;
  platform: string;
  field?: 'cover' | 'title' | 'hashtags' | 'postingTime';
  currentStrategy?: Strategy;
}

export interface BacktestRequest {
  sessionId: string;
  strategy: Strategy;
  features: VideoFeatures;
  platform: string;
}

export interface BacktestResponse {
  predictions: AggregatedMetrics;
  matchedVideos: Array<{
    videoId: string;
    title: string;
    similarity: number;
    ctr: string;
    views24h: string;
  }>;
  performanceDrivers: PerformanceDrivers;
}

// Response wrappers
export interface SuccessResponse<T = any> {
  success: true;
  data: T;
}

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

export type ApiResponse<T = any> = SuccessResponse<T> | ErrorResponse;

// Additional response types
export interface GenerateStrategyResponse {
  strategy: Strategy;
}

export interface SimilarVideo {
  videoId: string;
  title: string;
  similarity: number;
  ctr: string;
  views24h: string;
}

// Session Types
export interface SessionData {
  features?: VideoFeatures;
  strategy?: Strategy;
  createdAt: number;
  lastAccessedAt: number;
}

// Similarity Query Types
export interface SimilarityQuery {
  coverDescription: string;
  title: string;
  hashtags: string;
  category: string;
  platform: string;
}
