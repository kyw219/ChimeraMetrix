import { CSVDatabase } from '../../lib/csv-db';
import { NotFoundError } from '../../lib/errors';

describe('CSVDatabase', () => {
  let db: CSVDatabase;

  beforeAll(async () => {
    db = new CSVDatabase('backtest-data.csv');
    await db.initialize();
  });

  describe('initialize', () => {
    test('should load CSV data successfully', async () => {
      const stats = await db.getStats();
      expect(stats.totalVideos).toBeGreaterThan(0);
    });

    test('should not reload if already initialized', async () => {
      await db.initialize(); // Should not throw
      const stats = await db.getStats();
      expect(stats.totalVideos).toBeGreaterThan(0);
    });
  });

  describe('getAllVideoMetadata', () => {
    test('should return array of video metadata', async () => {
      const metadata = await db.getAllVideoMetadata();
      
      expect(Array.isArray(metadata)).toBe(true);
      expect(metadata.length).toBeGreaterThan(0);
      
      const first = metadata[0];
      expect(first).toHaveProperty('videoId');
      expect(first).toHaveProperty('platform');
      expect(first).toHaveProperty('category');
      expect(first).toHaveProperty('title');
      expect(first).toHaveProperty('coverDescription');
      expect(first).toHaveProperty('hashtags');
      expect(first).toHaveProperty('postingHour');
    });
  });

  describe('getVideosByIds', () => {
    test('should return videos for valid IDs', async () => {
      const metadata = await db.getAllVideoMetadata();
      const testIds = metadata.slice(0, 3).map((v) => v.videoId);
      
      const videos = await db.getVideosByIds(testIds);
      expect(videos.length).toBe(3);
    });

    test('should throw NotFoundError for invalid IDs', async () => {
      await expect(
        db.getVideosByIds(['invalid-id-1', 'invalid-id-2'])
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('getTimeSeriesData', () => {
    test('should return time-series data with all fields', async () => {
      const metadata = await db.getAllVideoMetadata();
      const testIds = [metadata[0].videoId];
      
      const timeSeries = await db.getTimeSeriesData(testIds);
      expect(timeSeries.length).toBe(1);
      
      const data = timeSeries[0];
      expect(data).toHaveProperty('videoId');
      expect(data).toHaveProperty('views_1h');
      expect(data).toHaveProperty('views_24h');
      expect(data).toHaveProperty('ctr_1h');
      expect(data).toHaveProperty('ctr_24h');
      expect(data).toHaveProperty('likes_1h');
      expect(data).toHaveProperty('likes_24h');
    });
  });

  describe('aggregateTimeSeries', () => {
    test('should calculate correct averages', async () => {
      const metadata = await db.getAllVideoMetadata();
      const testIds = metadata.slice(0, 5).map((v) => v.videoId);
      const timeSeries = await db.getTimeSeriesData(testIds);
      
      const aggregated = db.aggregateTimeSeries(timeSeries);
      
      expect(aggregated.views).toHaveLength(5);
      expect(aggregated.ctr).toHaveLength(5);
      expect(aggregated.likes).toHaveLength(5);
      
      expect(aggregated.metrics).toHaveProperty('views24h');
      expect(aggregated.metrics).toHaveProperty('ctr24h');
      expect(aggregated.metrics).toHaveProperty('likes24h');
    });

    test('should throw error for empty data', () => {
      expect(() => db.aggregateTimeSeries([])).toThrow();
    });
  });
});
