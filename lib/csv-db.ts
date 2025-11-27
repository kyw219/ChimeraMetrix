import { parse } from 'csv-parse/sync';
import { promises as fs } from 'fs';
import {
  VideoMetadata,
  TimeSeriesData,
  AggregatedMetrics,
} from '../types';
import { NotFoundError, logger } from './errors';

interface CSVRow {
  video_id: string;
  platform: string;
  category: string;
  title: string;
  cover_description: string;
  hashtags: string;
  posting_hour: string;
  views_1h: string;
  views_3h: string;
  views_6h: string;
  views_12h: string;
  views_24h: string;
  ctr_1h: string;
  ctr_3h: string;
  ctr_6h: string;
  ctr_12h: string;
  ctr_24h: string;
  likes_1h: string;
  likes_3h: string;
  likes_6h: string;
  likes_12h: string;
  likes_24h: string;
}

export class CSVDatabase {
  private data: CSVRow[] | null = null;
  private csvPath: string;

  constructor(csvPath: string = 'backtest-data.csv') {
    this.csvPath = csvPath;
  }

  /**
   * Initialize and load CSV data
   */
  async initialize(): Promise<void> {
    if (this.data !== null) {
      return; // Already initialized
    }

    try {
      const csvContent = await fs.readFile(this.csvPath, 'utf-8');
      this.data = parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });

      logger.info('CSV database initialized', {
        path: this.csvPath,
        rows: this.data.length,
      });
    } catch (error) {
      logger.error('Failed to load CSV database', { error });
      throw new Error('Failed to load CSV database');
    }
  }

  /**
   * Ensure database is initialized
   */
  private async ensureInitialized(): Promise<void> {
    if (this.data === null) {
      await this.initialize();
    }
  }

  /**
   * Get all video metadata for similarity matching
   */
  async getAllVideoMetadata(): Promise<VideoMetadata[]> {
    await this.ensureInitialized();

    if (!this.data) {
      throw new Error('CSV data not initialized');
    }

    return this.data.map((row) => ({
      videoId: row.video_id,
      platform: row.platform,
      category: row.category,
      title: row.title,
      coverDescription: row.cover_description,
      hashtags: row.hashtags,
      postingHour: parseInt(row.posting_hour) || 0,
    }));
  }

  /**
   * Get videos by IDs
   */
  async getVideosByIds(videoIds: string[]): Promise<CSVRow[]> {
    await this.ensureInitialized();

    const videos = this.data!.filter((row) => videoIds.includes(row.video_id));

    if (videos.length === 0) {
      throw new NotFoundError('No videos found with provided IDs', { videoIds });
    }

    const foundIds = videos.map((v) => v.video_id);
    const missingIds = videoIds.filter((id) => !foundIds.includes(id));

    if (missingIds.length > 0) {
      logger.warn('Some video IDs not found', { missingIds });
    }

    return videos;
  }

  /**
   * Get time-series data for specific videos
   */
  async getTimeSeriesData(videoIds: string[]): Promise<TimeSeriesData[]> {
    const videos = await this.getVideosByIds(videoIds);

    return videos.map((row) => ({
      videoId: row.video_id,
      views_1h: parseFloat(row.views_1h) || 0,
      views_3h: parseFloat(row.views_3h) || 0,
      views_6h: parseFloat(row.views_6h) || 0,
      views_12h: parseFloat(row.views_12h) || 0,
      views_24h: parseFloat(row.views_24h) || 0,
      ctr_1h: parseFloat(row.ctr_1h) || 0,
      ctr_3h: parseFloat(row.ctr_3h) || 0,
      ctr_6h: parseFloat(row.ctr_6h) || 0,
      ctr_12h: parseFloat(row.ctr_12h) || 0,
      ctr_24h: parseFloat(row.ctr_24h) || 0,
      likes_1h: parseFloat(row.likes_1h) || 0,
      likes_3h: parseFloat(row.likes_3h) || 0,
      likes_6h: parseFloat(row.likes_6h) || 0,
      likes_12h: parseFloat(row.likes_12h) || 0,
      likes_24h: parseFloat(row.likes_24h) || 0,
    }));
  }

  /**
   * Aggregate time-series data (calculate averages)
   */
  aggregateTimeSeries(data: TimeSeriesData[]): AggregatedMetrics {
    if (data.length === 0) {
      throw new Error('Cannot aggregate empty data');
    }

    const count = data.length;

    // Calculate averages for each time point
    const avgViews = {
      '1h': data.reduce((sum, d) => sum + d.views_1h, 0) / count,
      '3h': data.reduce((sum, d) => sum + d.views_3h, 0) / count,
      '6h': data.reduce((sum, d) => sum + d.views_6h, 0) / count,
      '12h': data.reduce((sum, d) => sum + d.views_12h, 0) / count,
      '24h': data.reduce((sum, d) => sum + d.views_24h, 0) / count,
    };

    const avgCtr = {
      '1h': data.reduce((sum, d) => sum + d.ctr_1h, 0) / count,
      '3h': data.reduce((sum, d) => sum + d.ctr_3h, 0) / count,
      '6h': data.reduce((sum, d) => sum + d.ctr_6h, 0) / count,
      '12h': data.reduce((sum, d) => sum + d.ctr_12h, 0) / count,
      '24h': data.reduce((sum, d) => sum + d.ctr_24h, 0) / count,
    };

    const avgLikes = {
      '1h': data.reduce((sum, d) => sum + d.likes_1h, 0) / count,
      '3h': data.reduce((sum, d) => sum + d.likes_3h, 0) / count,
      '6h': data.reduce((sum, d) => sum + d.likes_6h, 0) / count,
      '12h': data.reduce((sum, d) => sum + d.likes_12h, 0) / count,
      '24h': data.reduce((sum, d) => sum + d.likes_24h, 0) / count,
    };

    return {
      views: [
        { time: '1h', value: Math.round(avgViews['1h']) },
        { time: '3h', value: Math.round(avgViews['3h']) },
        { time: '6h', value: Math.round(avgViews['6h']) },
        { time: '12h', value: Math.round(avgViews['12h']) },
        { time: '24h', value: Math.round(avgViews['24h']) },
      ],
      ctr: [
        { time: '1h', value: parseFloat(avgCtr['1h'].toFixed(4)) },
        { time: '3h', value: parseFloat(avgCtr['3h'].toFixed(4)) },
        { time: '6h', value: parseFloat(avgCtr['6h'].toFixed(4)) },
        { time: '12h', value: parseFloat(avgCtr['12h'].toFixed(4)) },
        { time: '24h', value: parseFloat(avgCtr['24h'].toFixed(4)) },
      ],
      likes: [
        { time: '1h', value: Math.round(avgLikes['1h']) },
        { time: '3h', value: Math.round(avgLikes['3h']) },
        { time: '6h', value: Math.round(avgLikes['6h']) },
        { time: '12h', value: Math.round(avgLikes['12h']) },
        { time: '24h', value: Math.round(avgLikes['24h']) },
      ],
      metrics: {
        views24h: avgViews['24h'].toFixed(0),
        ctr24h: (avgCtr['24h'] * 100).toFixed(2) + '%',
        likes24h: avgLikes['24h'].toFixed(0),
      },
    };
  }

  /**
   * Get database statistics
   */
  async getStats(): Promise<{ totalVideos: number; platforms: string[]; categories: string[] }> {
    await this.ensureInitialized();

    const platforms = [...new Set(this.data!.map((row) => row.platform))];
    const categories = [...new Set(this.data!.map((row) => row.category))];

    return {
      totalVideos: this.data!.length,
      platforms,
      categories,
    };
  }
}

// Export singleton instance
export const csvDatabase = new CSVDatabase();
