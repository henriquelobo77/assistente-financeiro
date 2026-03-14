import { createContext } from './context.js';
import { env } from '../config/env.js';
import { createChildLogger } from '../shared/logger.js';
const log = createChildLogger('session-store');
const sessions = new Map();
export function getOrCreateSession(jid) {
    const existing = sessions.get(jid);
    if (existing) {
        const ttlMs = env.SESSION_TTL_MINUTES * 60 * 1000;
        if (Date.now() - existing.lastActivityAt > ttlMs) {
            log.info({ jid }, 'Session expired, creating new one');
            sessions.delete(jid);
        }
        else {
            return existing;
        }
    }
    const ctx = createContext(jid);
    sessions.set(jid, ctx);
    return ctx;
}
export function saveSession(ctx) {
    sessions.set(ctx.operatorJid, ctx);
}
export function deleteSession(jid) {
    sessions.delete(jid);
}
export function cleanExpiredSessions() {
    const ttlMs = env.SESSION_TTL_MINUTES * 60 * 1000;
    const now = Date.now();
    let cleaned = 0;
    for (const [jid, ctx] of sessions) {
        if (now - ctx.lastActivityAt > ttlMs) {
            sessions.delete(jid);
            cleaned++;
        }
    }
    if (cleaned > 0) {
        log.info({ cleaned }, 'Cleaned expired sessions');
    }
}
//# sourceMappingURL=session.store.js.map