import { csvDatabase } from '../../lib/csv-db';
import { sessionManager } from '../../lib/session';

describe('POST /api/backtest Integration Tests', () => {
  beforeAll(async () => {
    await csvDatabase.initialize();
  });

  beforeEach(() => {
    sessionManager.clearAll();
  });

  test('should retrieve time-series data from CSV', async () => {
    const metadata = await csvDatabase.getAllVideoMetadata();
    expect(metadata.length).toBeGreaterThan(0);

    const videoIds = metadata.slice(0, 5).map((v) => v.videoId);
    const timeSeriesData = await csvDatabase.getTimeSeriesData(videoIds);

    expect(timeSeriesData).toHaveLength(5);
    timeSeriesData.forEach((data) => {
      expect(data).toHaveProperty('videoId');
      expect(data).toHaveProperty('views_24h');
      expect(data).toHaveProperty('ctr_24h');
      expect(data).toHaveProperty('likes_24h');
    });
  });

  test('should aggregate time-series data correctly', async () => {
    const metadata = await csvDatabase.getAllVideoMetadata();
    const videoIds = metadata.slice(0, 5).map((v) => v.videoId);
    const timeSeriesData = await csvDatabase.getTimeSeriesData(videoIds);

    const aggregated = csvDatabase.aggregateTimeSeries(timeSeriesData);

    expect(aggregated.views).toHaveLength(5);
    expect(aggregated.ctr).toHaveLength(5);
    expect(aggregated.likes).toHaveLength(5);
    expect(aggregated.metrics).toHaveProperty('views24h');
    expect(aggregated.metrics).toHaveProperty('ctr24h');
    expect(aggregated.metrics).toHaveProperty('likes24h');
  });

  test('should validate session exists', () => {
    const sessionId = sessionManager.createSession();
    expect(sessionManager.hasSession(sessionId)).toBe(true);
  });
});
