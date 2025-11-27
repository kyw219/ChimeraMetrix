import { validateOrigin, sanitizeResponse } from '../../lib/cors';

describe('CORS Utilities', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    process.env.ALLOWED_ORIGINS = 'http://localhost:3000,https://example.com';
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('validateOrigin', () => {
    test('should accept allowed origins', () => {
      expect(validateOrigin('http://localhost:3000')).toBe(true);
      expect(validateOrigin('https://example.com')).toBe(true);
    });

    test('should reject unauthorized origins', () => {
      expect(validateOrigin('https://evil.com')).toBe(false);
      expect(validateOrigin('http://localhost:8080')).toBe(false);
    });

    test('should reject undefined origin', () => {
      expect(validateOrigin(undefined)).toBe(false);
    });
  });

  describe('sanitizeResponse', () => {
    beforeEach(() => {
      process.env.GEMINI_API_KEY = 'test-api-key-12345';
    });

    test('should redact API keys from strings', () => {
      const data = 'API key is test-api-key-12345';
      const sanitized = sanitizeResponse(data);
      
      expect(sanitized).not.toContain('test-api-key-12345');
      expect(sanitized).toContain('[REDACTED]');
    });

    test('should redact sensitive keys from objects', () => {
      const data = {
        apiKey: 'secret-key',
        api_key: 'another-secret',
        normalField: 'normal-value',
      };
      
      const sanitized = sanitizeResponse(data);
      expect(sanitized.apiKey).toBe('[REDACTED]');
      expect(sanitized.api_key).toBe('[REDACTED]');
      expect(sanitized.normalField).toBe('normal-value');
    });

    test('should handle nested objects', () => {
      const data = {
        user: {
          name: 'John',
          secret: 'password',
        },
        apiKey: 'key123',
      };
      
      const sanitized = sanitizeResponse(data);
      expect(sanitized.user.name).toBe('John');
      expect(sanitized.user.secret).toBe('[REDACTED]');
      expect(sanitized.apiKey).toBe('[REDACTED]');
    });

    test('should handle arrays', () => {
      const data = [
        { apiKey: 'key1' },
        { apiKey: 'key2' },
      ];
      
      const sanitized = sanitizeResponse(data);
      expect(sanitized[0].apiKey).toBe('[REDACTED]');
      expect(sanitized[1].apiKey).toBe('[REDACTED]');
    });
  });
});
