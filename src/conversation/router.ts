import type { MessageIn } from '../types/message.types.js';
import type { FlowDefinition } from './machine.js';
import { processMessage, END_FLOW, applyTransition } from './machine.js';
import { getOrCreateSession, saveSession } from './session.store.js';
import { isOperatorAllowed } from '../auth/operator.guard.js';
import { createChildLogger } from '../shared/logger.js';
import { sendText } from '../telegram/message.sender.js';

const log = createChildLogger('router');

const GLOBAL_COMMANDS = ['menu', '0', 'cancelar', 'ajuda'];

const flows = new Map<string, FlowDefinition>();

export function registerFlow(flow: FlowDefinition): void {
  flows.set(flow.id, flow);
  log.info({ flowId: flow.id }, 'Flow registered');
}

export async function handleIncomingMessage(message: MessageIn): Promise<void> {
  if (!isOperatorAllowed(message.jid)) {
    log.warn({ jid: message.jid }, 'Unauthorized operator, ignoring message');
    return;
  }

  const lowerText = message.text.toLowerCase().trim();

  let ctx = getOrCreateSession(message.jid);

  if (lowerText === 'ajuda') {
    await sendText(
      message.jid,
      '*Comandos disponiveis:*\n' +
        '- *menu* ou *0* - Voltar ao menu principal\n' +
        '- *cancelar* - Cancelar operacao atual\n' +
        '- *ajuda* - Mostrar esta mensagem',
    );
    return;
  }

  if ((lowerText === 'menu' || lowerText === 'cancelar') && ctx.flowId) {
    ctx = applyTransition(ctx, END_FLOW);
    saveSession(ctx);
  }

  try {
    const updatedCtx = await processMessage(ctx, message, flows, log);
    saveSession(updatedCtx);
  } catch (error) {
    log.error({ error, jid: message.jid, flowId: ctx.flowId, stateId: ctx.stateId }, 'Error processing message');
    await sendText(
      message.jid,
      'Ocorreu um erro ao processar sua mensagem. Tente novamente ou digite *menu* para voltar ao inicio.',
    );
  }
}
