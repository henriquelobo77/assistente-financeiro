export interface ConversationContext {
  operatorJid: string;
  flowId: string | null;
  stateId: string;
  data: Record<string, unknown>;
  lastActivityAt: number;
}

export function createContext(operatorJid: string): ConversationContext {
  return {
    operatorJid,
    flowId: null,
    stateId: 'idle',
    data: {},
    lastActivityAt: Date.now(),
  };
}
