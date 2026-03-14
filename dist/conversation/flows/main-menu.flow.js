import { sendText } from '../../whatsapp/message.sender.js';
const MENU_TEXT = '*Assistente Financeiro DedicarMed*\n\n' +
    'Escolha uma opcao:\n\n' +
    '1. Cobrancas\n' +
    '2. Clientes\n' +
    '3. Contratos\n' +
    '4. Inadimplencia\n\n' +
    '_Digite o numero da opcao desejada_';
const FLOW_MAP = {
    '1': { flowId: 'charge', initialState: 'select_action' },
    '2': { flowId: 'client', initialState: 'select_action' },
    '3': { flowId: 'contract', initialState: 'select_action' },
    '4': { flowId: 'overdue', initialState: 'select_action' },
};
const showMenu = async (ctx, message) => {
    const choice = message.text.trim();
    const target = FLOW_MAP[choice];
    if (target) {
        return {
            nextState: target.initialState,
            nextFlow: target.flowId,
            updatedData: {},
        };
    }
    await sendText(ctx.operatorJid, MENU_TEXT);
    return { nextState: 'idle', nextFlow: null };
};
export const mainMenuFlow = {
    id: 'main-menu',
    initialState: 'show_menu',
    states: {
        show_menu: showMenu,
    },
};
//# sourceMappingURL=main-menu.flow.js.map