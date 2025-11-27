import { v4 as uuidv4 } from 'uuid';
import { SessionData } from '../types';
import { NotFoundError, Logger } from './errors';

export class SessionManager {
  private sessions: Map<string, SessionData>;
  private sessionTimeout: number;

  constructor(sessionTimeout: number = 3600000) {
    // Default 1 hour in milliseconds
    this.sessions = new Map();
    this.sessionTimeout = sessionTimeout;
  }

  /**
   * Create a new session and return its ID
   */
  createSession(): string {
    const sessionId = uuidv4();
    const now = Date.now();

    this.sessions.set(sessionId, {
      createdAt: now,
      lastAccessedAt: now,
    });

    Logger.info('Session created', { sessionId });
    return sessionId;
  }

  /**
   * Store data in a session
   */
  async setSessionData(sessionId: string, data: Partial<SessionData>): Promise<void> {
    const session = this.sessions.get(sessionId);

    if (!session) {
      throw new NotFoundError('Session not found', { sessionId });
    }

    // Update session data
    this.sessions.set(sessionId, {
      ...session,
      ...data,
      lastAccessedAt: Date.now(),
    });

    Logger.debug('Session data updated', { sessionId });
  }

  /**
   * Retrieve session data
   */
  async getSessionData(sessionId: string): Promise<SessionData> {
    const session = this.sessions.get(sessionId);

    if (!session) {
      throw new NotFoundError('Session not found', { sessionId });
    }

    // Check if session has expired
    const now = Date.now();
    if (now - session.lastAccessedAt > this.sessionTimeout) {
      this.sessions.delete(sessionId);
      throw new NotFoundError('Session expired', { sessionId });
    }

    // Update last accessed time
    session.lastAccessedAt = now;
    this.sessions.set(sessionId, session);

    return session;
  }

  /**
   * Check if session exists
   */
  hasSession(sessionId: string): boolean {
    return this.sessions.has(sessionId);
  }

  /**
   * Delete a session
   */
  deleteSession(sessionId: string): void {
    this.sessions.delete(sessionId);
    Logger.info('Session deleted', { sessionId });
  }

  /**
   * Clean up expired sessions
   */
  async cleanupExpired(): Promise<number> {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [sessionId, session] of this.sessions.entries()) {
      if (now - session.lastAccessedAt > this.sessionTimeout) {
        this.sessions.delete(sessionId);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      Logger.info('Expired sessions cleaned up', { count: cleanedCount });
    }

    return cleanedCount;
  }

  /**
   * Get total number of active sessions
   */
  getSessionCount(): number {
    return this.sessions.size;
  }

  /**
   * Clear all sessions (for testing)
   */
  clearAll(): void {
    this.sessions.clear();
    Logger.warn('All sessions cleared');
  }
}

// Export singleton instance
export const sessionManager = new SessionManager(
  parseInt(process.env.SESSION_TIMEOUT || '3600') * 1000
);
