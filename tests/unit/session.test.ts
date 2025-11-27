import { SessionManager } from '../../lib/session';
import { NotFoundError } from '../../lib/errors';

describe('SessionManager', () => {
  let sessionManager: SessionManager;

  beforeEach(() => {
    sessionManager = new SessionManager(3600000); // 1 hour
  });

  afterEach(() => {
    sessionManager.clearAll();
  });

  describe('createSession', () => {
    test('should create a new session and return UUID', () => {
      const sessionId = sessionManager.createSession();
      
      expect(sessionId).toBeDefined();
      expect(typeof sessionId).toBe('string');
      expect(sessionId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    });

    test('should create unique session IDs', () => {
      const id1 = sessionManager.createSession();
      const id2 = sessionManager.createSession();
      
      expect(id1).not.toBe(id2);
    });
  });

  describe('setSessionData', () => {
    test('should store data in existing session', async () => {
      const sessionId = sessionManager.createSession();
      const features = {
        category: 'Tech',
        emotion: 'Excited',
        visualStyle: 'Modern',
        keywords: ['ai', 'tech'],
        audience: 'Developers',
        hookType: 'Question',
      };

      await sessionManager.setSessionData(sessionId, { features });
      const data = await sessionManager.getSessionData(sessionId);

      expect(data.features).toEqual(features);
    });

    test('should throw NotFoundError for non-existent session', async () => {
      await expect(
        sessionManager.setSessionData('invalid-id', { features: {} as any })
      ).rejects.toThrow(NotFoundError);
    });

    test('should update lastAccessedAt timestamp', async () => {
      const sessionId = sessionManager.createSession();
      const initialData = await sessionManager.getSessionData(sessionId);
      
      await new Promise((resolve) => setTimeout(resolve, 10));
      await sessionManager.setSessionData(sessionId, { features: {} as any });
      
      const updatedData = await sessionManager.getSessionData(sessionId);
      expect(updatedData.lastAccessedAt).toBeGreaterThan(initialData.lastAccessedAt);
    });
  });

  describe('getSessionData', () => {
    test('should retrieve session data', async () => {
      const sessionId = sessionManager.createSession();
      const data = await sessionManager.getSessionData(sessionId);

      expect(data).toBeDefined();
      expect(data.createdAt).toBeDefined();
      expect(data.lastAccessedAt).toBeDefined();
    });

    test('should throw NotFoundError for non-existent session', async () => {
      await expect(
        sessionManager.getSessionData('invalid-id')
      ).rejects.toThrow(NotFoundError);
    });

    test('should throw NotFoundError for expired session', async () => {
      const shortTimeout = new SessionManager(100); // 100ms timeout
      const sessionId = shortTimeout.createSession();

      await new Promise((resolve) => setTimeout(resolve, 150));

      await expect(
        shortTimeout.getSessionData(sessionId)
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('hasSession', () => {
    test('should return true for existing session', () => {
      const sessionId = sessionManager.createSession();
      expect(sessionManager.hasSession(sessionId)).toBe(true);
    });

    test('should return false for non-existent session', () => {
      expect(sessionManager.hasSession('invalid-id')).toBe(false);
    });
  });

  describe('deleteSession', () => {
    test('should delete existing session', () => {
      const sessionId = sessionManager.createSession();
      expect(sessionManager.hasSession(sessionId)).toBe(true);

      sessionManager.deleteSession(sessionId);
      expect(sessionManager.hasSession(sessionId)).toBe(false);
    });
  });

  describe('cleanupExpired', () => {
    test('should remove expired sessions', async () => {
      const shortTimeout = new SessionManager(100); // 100ms timeout
      const id1 = shortTimeout.createSession();
      const id2 = shortTimeout.createSession();

      await new Promise((resolve) => setTimeout(resolve, 150));

      const cleanedCount = await shortTimeout.cleanupExpired();
      expect(cleanedCount).toBe(2);
      expect(shortTimeout.hasSession(id1)).toBe(false);
      expect(shortTimeout.hasSession(id2)).toBe(false);
    });

    test('should not remove active sessions', async () => {
      const sessionId = sessionManager.createSession();
      const cleanedCount = await sessionManager.cleanupExpired();

      expect(cleanedCount).toBe(0);
      expect(sessionManager.hasSession(sessionId)).toBe(true);
    });
  });

  describe('getSessionCount', () => {
    test('should return correct session count', () => {
      expect(sessionManager.getSessionCount()).toBe(0);

      sessionManager.createSession();
      expect(sessionManager.getSessionCount()).toBe(1);

      sessionManager.createSession();
      expect(sessionManager.getSessionCount()).toBe(2);
    });
  });

  describe('clearAll', () => {
    test('should remove all sessions', () => {
      sessionManager.createSession();
      sessionManager.createSession();
      expect(sessionManager.getSessionCount()).toBe(2);

      sessionManager.clearAll();
      expect(sessionManager.getSessionCount()).toBe(0);
    });
  });
});
