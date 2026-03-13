import type { ConversationContext } from './context.js';
import type { MessageIn } from '../types/message.types.js';
import type { Logger } from '../shared/logger.js';

export interface StateTransition {
  nextState: string;
  nextFlow?: string | null;
  updatedData?: Record<string, unknown>;
}

export const END_FLOW: StateTransition = {
  nextState: 'idle',
  nextFlow: null,
  updatedData: {},
};

export type StateHandler = (
  ctx: ConversationContext,
  message: MessageIn,
) => Promise<StateTransition>;

export interface FlowDefinition {
  id: string;
  initialState: string;
  states: Record<string, StateHandler>;
}

export function applyTransition(
  ctx: ConversationContext,
  transition: StateTransition,
): ConversationContext {
  return {
    ...ctx,
    flowId: transition.nextFlow !== undefined ? transition.nextFlow : ctx.flowId,
    stateId: transition.nextState,
    data: transition.updatedData !== undefined ? transition.updatedData : ctx.data,
    lastActivityAt: Date.now(),
  };
}

export async function processMessage(
  ctx: ConversationContext,
  message: MessageIn,
  flows: Map<string, FlowDefinition>,
  logger: Logger,
): Promise<ConversationContext> {
  const flowId = ctx.flowId;
  const stateId = ctx.stateId;

  if (!flowId) {
    const mainMenu = flows.get('main-menu');
    if (!mainMenu) {
      logger.error('main-menu flow not found');
      return ctx;
    }

    const handler = mainMenu.states[mainMenu.initialState];
    if (!handler) {
      logger.error({ state: mainMenu.initialState }, 'State handler not found in main-menu');
      return ctx;
    }

    const transition = await handler(ctx, message);
    return applyTransition(ctx, transition);
  }

  const flow = flows.get(flowId);
  if (!flow) {
    logger.error({ flowId }, 'Flow not found');
    return applyTransition(ctx, END_FLOW);
  }

  const handler = flow.states[stateId];
  if (!handler) {
    logger.error({ flowId, stateId }, 'State not found in flow');
    return applyTransition(ctx, END_FLOW);
  }

  const transition = await handler(ctx, message);
  return applyTransition(ctx, transition);
}
