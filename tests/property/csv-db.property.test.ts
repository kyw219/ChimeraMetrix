import * as fc from 'fast-check';
import { CSVDatabase } from '../../lib/csv-db';
import { TimeSeriesData } from '../../types';

describe('Property-Based Tests: CSV Database', () => {
  // Feature: backend, Property 10: Aggregation produces correct averages
  test('Property 10: aggregated values should equal manual average calculation', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            videoId: fc.string(),
            views_1h: fc.float({ min: 0, max: 1000000 }),
            views_3h: fc.float({ min: 0, max: 1000000 }),
            views_6h: fc.float({ min: 0, max: 1000000 }),
            views_12h: fc.float({ min: 0, max: 1000000 }),
            views_24h: fc.float({ min: 0, max: 1000000 }),
            ctr_1h: fc.float({ min: 0, max: 1 }),
            ctr_3h: fc.float({ min: 0, max: 1 }),
            ctr_6h: fc.float({ min: 0, max: 1 }),
            ctr_12h: fc.float({ min: 0, max: 1 }),
            ctr_24h: fc.float({ min: 0, max: 1 }),
            likes_1h: fc.float({ min: 0, max: 100000 }),
            likes_3h: fc.float({ min: 0, max: 100000 }),
            likes_6h: fc.float({ min: 0, max: 100000 }),
            likes_12h: fc.float({ min: 0, max: 100000 }),
            likes_24h: fc.float({ min: 0, max: 100000 }),
          }),
          { minLength: 5, maxLength: 5 }
        ),
        (timeSeriesData: TimeSeriesData[]) => {
          const db = new CSVDatabase();
          const aggregated = db.aggregateTimeSeries(timeSeriesData);

          // Verify views averages
          const manualViewsAvg24h =
            timeSeriesData.reduce((sum, d) => sum + d.views_24h, 0) / 5;
          expect(Math.abs(aggregated.views[4].value - Math.round(manualViewsAvg24h))).toBeLessThan(1);

          // Verify CTR averages
          const manualCtrAvg24h =
            timeSeriesData.reduce((sum, d) => sum + d.ctr_24h, 0) / 5;
          expect(Math.abs(aggregated.ctr[4].value - manualCtrAvg24h)).toBeLessThan(0.0001);

          // Verify likes averages
          const manualLikesAvg24h =
            timeSeriesData.reduce((sum, d) => sum + d.likes_24h, 0) / 5;
          expect(Math.abs(aggregated.likes[4].value - Math.round(manualLikesAvg24h))).toBeLessThan(1);
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: backend, Property 11: Aggregated data has correct structure
  test('Property 11: aggregated data must have exactly 5 time points for each metric', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            videoId: fc.string(),
            views_1h: fc.float({ min: 0, max: 1000000 }),
            views_3h: fc.float({ min: 0, max: 1000000 }),
            views_6h: fc.float({ min: 0, max: 1000000 }),
            views_12h: fc.float({ min: 0, max: 1000000 }),
            views_24h: fc.float({ min: 0, max: 1000000 }),
            ctr_1h: fc.float({ min: 0, max: 1 }),
            ctr_3h: fc.float({ min: 0, max: 1 }),
            ctr_6h: fc.float({ min: 0, max: 1 }),
            ctr_12h: fc.float({ min: 0, max: 1 }),
            ctr_24h: fc.float({ min: 0, max: 1 }),
            likes_1h: fc.float({ min: 0, max: 100000 }),
            likes_3h: fc.float({ min: 0, max: 100000 }),
            likes_6h: fc.float({ min: 0, max: 100000 }),
            likes_12h: fc.float({ min: 0, max: 100000 }),
            likes_24h: fc.float({ min: 0, max: 100000 }),
          }),
          { minLength: 5, maxLength: 5 }
        ),
        (timeSeriesData: TimeSeriesData[]) => {
          const db = new CSVDatabase();
          const aggregated = db.aggregateTimeSeries(timeSeriesData);

          // Must have exactly 5 time points
          expect(aggregated.views).toHaveLength(5);
          expect(aggregated.ctr).toHaveLength(5);
          expect(aggregated.likes).toHaveLength(5);

          // Each time point must have time and value
          aggregated.views.forEach((point) => {
            expect(point).toHaveProperty('time');
            expect(point).toHaveProperty('value');
            expect(typeof point.value).toBe('number');
          });

          aggregated.ctr.forEach((point) => {
            expect(point).toHaveProperty('time');
            expect(point).toHaveProperty('value');
            expect(typeof point.value).toBe('number');
          });

          aggregated.likes.forEach((point) => {
            expect(point).toHaveProperty('time');
            expect(point).toHaveProperty('value');
            expect(typeof point.value).toBe('number');
          });

          // Must have metrics summary
          expect(aggregated.metrics).toHaveProperty('views24h');
          expect(aggregated.metrics).toHaveProperty('ctr24h');
          expect(aggregated.metrics).toHaveProperty('likes24h');
        }
      ),
      { numRuns: 100 }
    );
  });
});
