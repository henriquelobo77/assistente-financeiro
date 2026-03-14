export const END_FLOW = {
    nextState: 'idle',
    nextFlow: null,
    updatedData: {},
};
export function applyTransition(ctx, transition) {
    return {
        ...ctx,
        flowId: transition.nextFlow !== undefined ? transition.nextFlow : ctx.flowId,
        stateId: transition.nextState,
        data: transition.updatedData !== undefined ? transition.updatedData : ctx.data,
        lastActivityAt: Date.now(),
    };
}
export async function processMessage(ctx, message, flows, logger) {
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
//# sourceMappingURL=machine.js.map