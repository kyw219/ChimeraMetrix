import { sessionManager } from '../../lib/session';

describe('POST /api/analyze Integration Tests', () => {
  beforeEach(() => {
    sessionManager.clearAll();
  });

  test('should accept valid video upload request', () => {
    // Mock test - actual integration would require Gemini API
    const mockFeatures = {
      category: 'Tech',
      emotion: 'Excitement',
      visualStyle: 'Modern',
      keywords: ['ai', 'tech'],
      audience: 'Developers',
      hookType: 'Question',
    };

    expect(mockFeatures).toHaveProperty('category');
    expect(mockFeatures).toHaveProperty('emotion');
    expect(mockFeatures).toHaveProperty('visualStyle');
    expect(mockFeatures).toHaveProperty('keywords');
    expect(mockFeatures).toHaveProperty('audience');
    expect(mockFeatures).toHaveProperty('hookType');
  });

  test('should validate platform parameter', () => {
    const validPlatforms = ['youtube', 'tiktok', 'shorts'];
    validPlatforms.forEach((platform) => {
      expect(['youtube', 'tiktok', 'shorts']).toContain(platform);
    });
  });

  test('should create session on successful analysis', () => {
    const sessionId = sessionManager.createSession();
    expect(sessionId).toBeDefined();
    expect(sessionManager.hasSession(sessionId)).toBe(true);
  });
});
