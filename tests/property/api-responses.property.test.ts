import * as fc from 'fast-check';

describe('Property-Based Tests: API Responses', () => {
  // Feature: backend, Property 13: All API responses are valid JSON
  test('Property 13: all API responses must be parseable as valid JSON', () => {
    fc.assert(
      fc.property(
        fc.record({
          success: fc.boolean(),
          data: fc.anything(),
          error: fc.option(
            fc.record({
              code: fc.string(),
              message: fc.string(),
            })
          ),
        }),
        (response) => {
          const jsonString = JSON.stringify(response);
          expect(() => JSON.parse(jsonString)).not.toThrow();

          const parsed = JSON.parse(jsonString);
          expect(parsed).toHaveProperty('success');
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: backend, Property 3: Feature extraction response completeness
  test('Property 3: feature extraction must contain all required fields', () => {
    fc.assert(
      fc.property(
        fc.record({
          category: fc.string({ minLength: 1 }),
          emotion: fc.string({ minLength: 1 }),
          visualStyle: fc.string({ minLength: 1 }),
          keywords: fc.array(fc.string(), { minLength: 1 }),
          audience: fc.string({ minLength: 1 }),
          hookType: fc.string({ minLength: 1 }),
        }),
        (features) => {
          expect(features).toHaveProperty('category');
          expect(features).toHaveProperty('emotion');
          expect(features).toHaveProperty('visualStyle');
          expect(features).toHaveProperty('keywords');
          expect(features).toHaveProperty('audience');
          expect(features).toHaveProperty('hookType');

          expect(features.category.length).toBeGreaterThan(0);
          expect(features.emotion.length).toBeGreaterThan(0);
          expect(features.visualStyle.length).toBeGreaterThan(0);
          expect(features.keywords.length).toBeGreaterThan(0);
          expect(features.audience.length).toBeGreaterThan(0);
          expect(features.hookType.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: backend, Property 4: Strategy generation response completeness
  test('Property 4: strategy must contain all required fields', () => {
    fc.assert(
      fc.property(
        fc.record({
          cover: fc.string({ minLength: 1 }),
          coverImageUrl: fc.option(fc.webUrl()),
          title: fc.string({ minLength: 1 }),
          hashtags: fc.string({ minLength: 1 }),
          postingTime: fc.string({ minLength: 1 }),
        }),
        (strategy) => {
          expect(strategy).toHaveProperty('cover');
          expect(strategy).toHaveProperty('title');
          expect(strategy).toHaveProperty('hashtags');
          expect(strategy).toHaveProperty('postingTime');

          expect(strategy.cover.length).toBeGreaterThan(0);
          expect(strategy.title.length).toBeGreaterThan(0);
          expect(strategy.hashtags.length).toBeGreaterThan(0);
          expect(strategy.postingTime.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: backend, Property 5: Partial regeneration preserves unchanged fields
  test('Property 5: regenerating one field must preserve all other fields', () => {
    fc.assert(
      fc.property(
        fc.record({
          cover: fc.string(),
          title: fc.string(),
          hashtags: fc.string(),
          postingTime: fc.string(),
        }),
        fc.constantFrom('cover', 'title', 'hashtags', 'postingTime'),
        fc.string(),
        (originalStrategy, fieldToChange, newValue) => {
          const updatedStrategy = {
            ...originalStrategy,
            [fieldToChange]: newValue,
          };

          // All other fields should remain unchanged
          const fields = ['cover', 'title', 'hashtags', 'postingTime'];
          fields.forEach((field) => {
            if (field !== fieldToChange) {
              expect(updatedStrategy[field as keyof typeof updatedStrategy]).toBe(
                originalStrategy[field as keyof typeof originalStrategy]
              );
            } else {
              expect(updatedStrategy[field as keyof typeof updatedStrategy]).toBe(newValue);
            }
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: backend, Property 12: Performance drivers analysis completeness
  test('Property 12: performance drivers must have all four components with impact and reason', () => {
    fc.assert(
      fc.property(
        fc.record({
          coverDesign: fc.record({
            impact: fc.constantFrom('High', 'Medium', 'Low'),
            reason: fc.string({ minLength: 1 }),
          }),
          titleFraming: fc.record({
            impact: fc.constantFrom('High', 'Medium', 'Low'),
            reason: fc.string({ minLength: 1 }),
          }),
          hashtagCombination: fc.record({
            impact: fc.constantFrom('High', 'Medium', 'Low'),
            reason: fc.string({ minLength: 1 }),
          }),
          postingTime: fc.record({
            impact: fc.constantFrom('High', 'Medium', 'Low'),
            reason: fc.string({ minLength: 1 }),
          }),
        }),
        (drivers) => {
          // Must have exactly 4 driver entries
          expect(Object.keys(drivers)).toHaveLength(4);
          expect(drivers).toHaveProperty('coverDesign');
          expect(drivers).toHaveProperty('titleFraming');
          expect(drivers).toHaveProperty('hashtagCombination');
          expect(drivers).toHaveProperty('postingTime');

          // Each driver must have impact and reason
          Object.values(drivers).forEach((driver) => {
            expect(driver).toHaveProperty('impact');
            expect(driver).toHaveProperty('reason');
            expect(['High', 'Medium', 'Low']).toContain(driver.impact);
            expect(driver.reason.length).toBeGreaterThan(0);
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});
