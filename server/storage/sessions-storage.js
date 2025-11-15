class SessionsStorage {
  constructor() {
    this.sessions = new Map();
  }

  create(userId) {
    const sessionId = this.generateSessionId();
    const session = {
      userId,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours
    };

    this.sessions.set(sessionId, session);
    console.log(`[SessionsStorage] Session created for user ${userId}: ${sessionId}`);
    return sessionId;
  }

  get(sessionId) {
    // Nettoyage automatique passif
    this.cleanup();

    const session = this.sessions.get(sessionId);

    if (!session) return undefined;

    if (session.expiresAt < new Date()) {
      this.sessions.delete(sessionId);
      console.log(`[SessionsStorage] Session expired: ${sessionId}`);
      return undefined;
    }

    return session;
  }

  delete(sessionId) {
    this.sessions.delete(sessionId);
    console.log(`[SessionsStorage] Session deleted: ${sessionId}`);
  }

  getUserId(sessionId) {
    const session = this.get(sessionId);
    return session ? session.userId : undefined;
  }

  generateSessionId() {
    const random = Math.random().toString(36).slice(2);
    const timestamp = Date.now().toString(36);
    return `sess_${timestamp}_${random}`;
  }

  cleanup() {
    const now = new Date();
    let count = 0;

    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.expiresAt < now) {
        this.sessions.delete(sessionId);
        count++;
      }
    }

    if (count > 0) {
      console.log(`[SessionsStorage] Cleaned up ${count} expired sessions`);
    }
  }
}

export const sessionsStorage = new SessionsStorage();
