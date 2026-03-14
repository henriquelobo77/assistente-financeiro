import type { ConversationContext } from './context.js';
import type { MessageIn } from '../types/message.types.js';
import type { Logger } from '../shared/logger.js';
export interface StateTransition {
    nextState: string;
    nextFlow?: string | null;
    updatedData?: Record<string, unknown>;
}
export declare const END_FLOW: StateTransition;
export type StateHandler = (ctx: ConversationContext, message: MessageIn) => Promise<StateTransition>;
export interface FlowDefinition {
    id: string;
    initialState: string;
    states: Record<string, StateHandler>;
}
export declare function applyTransition(ctx: ConversationContext, transition: StateTransition): ConversationContext;
export declare function processMessage(ctx: ConversationContext, message: MessageIn, flows: Map<string, FlowDefinition>, logger: Logger): Promise<ConversationContext>;
//# sourceMappingURL=machine.d.ts.map