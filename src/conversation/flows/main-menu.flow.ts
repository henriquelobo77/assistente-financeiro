import type { FlowDefinition, StateHandler } from '../machine.js';
import { sendText } from '../../telegram/message.sender.js';

const MENU_TEXT =
  '*Assistente Financeiro DedicarMed*\n\n' +
  'Escolha uma opcao:\n\n' +
  '1. Cobrancas\n' +
  '2. Clientes\n' +
  '3. Contratos\n' +
  '4. Inadimplencia\n\n' +
  '_Digite o numero da opcao desejada_';

const SUB_MENUS: Record<string, { flowId: string; initialState: string; text: string }> = {
  '1': {
    flowId: 'charge',
    initialState: 'select_action',
    text: '*Cobrancas*\n\n1. Criar cobranca\n2. Listar cobrancas de cliente\n3. Cancelar cobranca\n0. Voltar ao menu',
  },
  '2': {
    flowId: 'client',
    initialState: 'select_action',
    text: '*Clientes*\n\n1. Cadastrar cliente\n2. Buscar cliente\n0. Voltar ao menu',
  },
  '3': {
    flowId: 'contract',
    initialState: 'select_action',
    text: '*Contratos*\n\n1. Criar contrato\n2. Listar contratos de cliente\n0. Voltar ao menu',
  },
  '4': {
    flowId: 'overdue',
    initialState: 'select_action',
    text: '*Inadimplencia*\n\n1. Gerar relatorio geral\n2. Consultar por cliente\n0. Voltar ao menu',
  },
};

const showMenu: StateHandler = async (ctx, message) => {
  const choice = message.text.trim();
  const target = SUB_MENUS[choice];

  if (target) {
    await sendText(ctx.operatorJid, target.text);
    return {
      nextState: target.initialState,
      nextFlow: target.flowId,
      updatedData: {},
    };
  }

  await sendText(ctx.operatorJid, MENU_TEXT);
  return { nextState: 'idle', nextFlow: null };
};

export const mainMenuFlow: FlowDefinition = {
  id: 'main-menu',
  initialState: 'show_menu',
  states: {
    show_menu: showMenu,
  },
};
