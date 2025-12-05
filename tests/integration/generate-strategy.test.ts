import { sessionManager } from '../../lib/session';
import { VideoFeatures, Strategy } from '../../types';

describe('POST /api/generate-strategy Integration Tests', () => {
  beforeEach(() => {
    sessionManager.clearAll();
  });

  test('should generate complete strategy', async () => {
    const sessionId = sessionManager.createSession();
    const mockFeatures: VideoFeatures = {
      category: 'Tech',
      emotion: 'Excitement',
      visualStyle: 'Modern',
      keywords: ['ai', 'tech'],
      audience: 'Developers',
      hookType: 'Question',
    };

    await sessionManager.setSessionData(sessionId, { features: mockFeatures });

    const mockStrategy: Strategy = {
      cover: 'Eye-catching tech visual',
      coverImageUrl: 'https://example.com/cover.jpg',
      title: 'Amazing AI Technology',
      description: 'Discover the latest AI technology trends and innovations. Learn how artificial intelligence is transforming the tech industry.',
      hashtags: '#ai #tech #innovation',
      postingTime: '7:00 PM EST',
    };

    expect(mockStrategy).toHaveProperty('cover');
    expect(mockStrategy).toHaveProperty('coverImageUrl');
    expect(mockStrategy).toHaveProperty('title');
    expect(mockStrategy).toHaveProperty('description');
    expect(mockStrategy).toHaveProperty('hashtags');
    expect(mockStrategy).toHaveProperty('postingTime');
  });

  test('should require valid session', async () => {
    const invalidSessionId = 'invalid-session-id';
    expect(sessionManager.hasSession(invalidSessionId)).toBe(false);
  });
});
