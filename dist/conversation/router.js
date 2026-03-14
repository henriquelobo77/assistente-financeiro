import { processMessage, END_FLOW, applyTransition } from './machine.js';
import { getOrCreateSession, saveSession } from './session.store.js';
import { isOperatorAllowed } from '../auth/operator.guard.js';
import { createChildLogger } from '../shared/logger.js';
import { sendText } from '../telegram/message.sender.js';
import { MENU_TEXT } from './flows/main-menu.flow.js';
const log = createChildLogger('router');
const flows = new Map();
export function registerFlow(flow) {
    flows.set(flow.id, flow);
    log.info({ flowId: flow.id }, 'Flow registered');
}
export async function handleIncomingMessage(message) {
    if (!isOperatorAllowed(message.jid)) {
        log.warn({ jid: message.jid }, 'Unauthorized operator, ignoring message');
        return;
    }
    const lowerText = message.text.toLowerCase().trim();
    let ctx = getOrCreateSession(message.jid);
    if (lowerText === 'ajuda') {
        await sendText(message.jid, '*Comandos disponiveis:*\n' +
            '- *menu* ou *0* - Voltar ao menu principal\n' +
            '- *cancelar* - Cancelar operacao atual\n' +
            '- *ajuda* - Mostrar esta mensagem');
        return;
    }
    // Global "menu" / "cancelar" — reset to idle, then show main menu
    if ((lowerText === 'menu' || lowerText === 'cancelar') && ctx.flowId) {
        ctx = applyTransition(ctx, END_FLOW);
        saveSession(ctx);
        await sendText(message.jid, MENU_TEXT);
        return;
    }
    try {
        const updatedCtx = await processMessage(ctx, message, flows, log);
        saveSession(updatedCtx);
        // After processing, if we ended up idle (END_FLOW), show the main menu
        // so the user always has a prompt to act on.
        // Skip if we were already idle before processing (main-menu handler
        // already sent either the menu or the sub-menu text).
        if (!updatedCtx.flowId && updatedCtx.stateId === 'idle' && ctx.flowId) {
            await sendText(message.jid, MENU_TEXT);
        }
    }
    catch (error) {
        log.error({ error, jid: message.jid, flowId: ctx.flowId, stateId: ctx.stateId }, 'Error processing message');
        await sendText(message.jid, 'Ocorreu um erro ao processar sua mensagem. Tente novamente ou digite *menu* para voltar ao inicio.');
    }
}
//# sourceMappingURL=router.js.map