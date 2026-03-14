export interface ConversationContext {
    operatorJid: string;
    flowId: string | null;
    stateId: string;
    data: Record<string, unknown>;
    lastActivityAt: number;
}
export declare function createContext(operatorJid: string): ConversationContext;
//# sourceMappingURL=context.d.ts.map