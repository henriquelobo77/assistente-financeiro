import { sendText } from '../../telegram/message.sender.js';
export const MENU_TEXT = '*Assistente Financeiro DedicarMed*\n\n' +
    'Escolha uma opcao:\n\n' +
    '1. Cobrancas\n' +
    '2. Clientes\n' +
    '3. Contratos\n' +
    '4. Inadimplencia\n\n' +
    '_Digite o numero da opcao desejada_';
const SUB_MENUS = {
    '1': {
        flowId: 'charge',
        text: '*Cobrancas*\n\n1. Criar cobranca\n2. Listar cobrancas de cliente\n3. Cancelar cobranca\n0. Voltar ao menu',
    },
    '2': {
        flowId: 'client',
        text: '*Clientes*\n\n1. Cadastrar cliente\n2. Buscar cliente\n0. Voltar ao menu',
    },
    '3': {
        flowId: 'contract',
        text: '*Contratos*\n\n1. Criar contrato\n2. Listar contratos de cliente\n0. Voltar ao menu',
    },
    '4': {
        flowId: 'overdue',
        text: '*Inadimplencia*\n\n1. Gerar relatorio geral\n2. Consultar por cliente\n0. Voltar ao menu',
    },
};
const showMenu = async (ctx, message) => {
    const choice = message.text.trim();
    const target = SUB_MENUS[choice];
    if (target) {
        await sendText(ctx.operatorJid, target.text);
        return {
            nextState: 'select_action',
            nextFlow: target.flowId,
            updatedData: {},
        };
    }
    // Invalid choice or first contact — show main menu and stay idle
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