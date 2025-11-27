import * as fc from 'fast-check';
import { sanitizeResponse, validateOrigin } from '../../lib/cors';

describe('Property-Based Tests: Security', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    process.env.GEMINI_API_KEY = 'test-secret-key-12345';
    process.env.ALLOWED_ORIGINS = 'http://localhost:3000,https://example.com';
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  // Feature: backend, Property 17: API keys are never exposed in responses
  test('Property 17: sanitized responses must never contain API keys', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.string(),
          fc.record({
            data: fc.string(),
            apiKey: fc.string(),
            nested: fc.record({
              secret: fc.string(),
              value: fc.string(),
            }),
          }),
          fc.array(fc.record({ apiKey: fc.string(), data: fc.string() }))
        ),
        (data) => {
          const sanitized = sanitizeResponse(data);
          const sanitizedString = JSON.stringify(sanitized);

          // Should not contain the actual API key
          if (process.env.GEMINI_API_KEY) {
            expect(sanitizedString).not.toContain(process.env.GEMINI_API_KEY);
          }

          // Sensitive keys should be redacted
          if (typeof sanitized === 'object' && sanitized !== null) {
            const checkForSensitiveKeys = (obj: any): void => {
              if (Array.isArray(obj)) {
                obj.forEach(checkForSensitiveKeys);
              } else if (typeof obj === 'object' && obj !== null) {
                Object.entries(obj).forEach(([key, value]) => {
                  if (
                    key.toLowerCase().includes('apikey') ||
                    key.toLowerCase().includes('api_key') ||
                    key.toLowerCase().includes('secret') ||
                    key.toLowerCase().includes('token')
                  ) {
                    expect(value).toBe('[REDACTED]');
                  } else if (typeof value === 'object') {
                    checkForSensitiveKeys(value);
                  }
                });
              }
            };
            checkForSensitiveKeys(sanitized);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: backend, Property 15: Origin validation blocks unauthorized domains
  test('Property 15: unauthorized origins must be rejected', () => {
    fc.assert(
      fc.property(
        fc.webUrl(),
        (origin) => {
          const isValid = validateOrigin(origin);
          const allowedOrigins = ['http://localhost:3000', 'https://example.com'];

          if (allowedOrigins.includes(origin)) {
            expect(isValid).toBe(true);
          } else {
            expect(isValid).toBe(false);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: backend, Property 14: CORS headers are present
  test('Property 14: valid origins should result in CORS headers being set', () => {
    const allowedOrigins = ['http://localhost:3000', 'https://example.com'];

    allowedOrigins.forEach((origin) => {
      const isValid = validateOrigin(origin);
      expect(isValid).toBe(true);
    });
  });
});
