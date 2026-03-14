import { type ConversationContext } from './context.js';
export declare function getOrCreateSession(jid: string): ConversationContext;
export declare function saveSession(ctx: ConversationContext): void;
export declare function deleteSession(jid: string): void;
export declare function cleanExpiredSessions(): void;
//# sourceMappingURL=session.store.d.ts.map