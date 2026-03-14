import { END_FLOW } from '../machine.js';
import { sendText } from '../../telegram/message.sender.js';
import { formatBRL, formatDate } from '../../shared/formatters.js';
import * as overdueService from '../../services/overdue.service.js';
const selectAction = async (ctx, message) => {
    const MENU = '*Inadimplencia*\n\n' +
        '1. Gerar relatorio geral\n' +
        '2. Consultar por cliente\n' +
        '0. Voltar ao menu';
    const choice = message.text.trim();
    switch (choice) {
        case '1': {
            // Inline execution — no extra state needed, no extra message required
            await sendText(ctx.operatorJid, 'Gerando relatorio de inadimplencia, aguarde...');
            const result = await overdueService.getOverdueReport();
            if (!result.ok) {
                await sendText(ctx.operatorJid, `Erro ao gerar relatorio: ${result.error.message}`);
                return END_FLOW;
            }
            const report = result.value;
            if (report.totalCount === 0) {
                await sendText(ctx.operatorJid, '*Relatorio de Inadimplencia*\n\nNenhuma cobranca em atraso!');
                return END_FLOW;
            }
            const topList = report.charges
                .slice(0, 10)
                .map((c, i) => `${i + 1}. ${c.customerName ?? c.customerId}\n` +
                `   Valor: ${formatBRL(c.value)} | Venc: ${formatDate(c.dueDate)}`)
                .join('\n');
            const msg = `*Relatorio de Inadimplencia*\n\n` +
                `Total em atraso: *${formatBRL(report.totalAmountCents)}*\n` +
                `Quantidade: *${report.totalCount}* cobrancas\n\n` +
                `*Top ${Math.min(10, report.charges.length)} maiores:*\n${topList}`;
            await sendText(ctx.operatorJid, msg);
            return END_FLOW;
        }
        case '2':
            await sendText(ctx.operatorJid, 'Informe o CPF/CNPJ ou nome do cliente (ou *0* para voltar):');
            return { nextState: 'report_by_client' };
        case '0':
            return END_FLOW;
        default:
            await sendText(ctx.operatorJid, MENU);
            return { nextState: 'select_action' };
    }
};
const reportByClient = async (ctx, message) => {
    const input = message.text.trim();
    if (input === '0')
        return END_FLOW;
    await sendText(ctx.operatorJid, `Consultando inadimplencia para "${input}"...`);
    const result = await overdueService.getOverdueByClient(input);
    if (!result.ok) {
        await sendText(ctx.operatorJid, `Erro na consulta: ${result.error.message}`);
        return END_FLOW;
    }
    const report = result.value;
    if (report.totalCount === 0) {
        await sendText(ctx.operatorJid, `Nenhuma cobranca em atraso encontrada para "${input}".`);
        return END_FLOW;
    }
    const list = report.charges
        .map((c) => `- ${c.id} | ${formatBRL(c.value)} | Venc: ${formatDate(c.dueDate)}`)
        .join('\n');
    await sendText(ctx.operatorJid, `*Inadimplencia - ${input}*\n\n` +
        `Total: *${formatBRL(report.totalAmountCents)}*\n` +
        `Quantidade: *${report.totalCount}*\n\n${list}`);
    return END_FLOW;
};
export const overdueFlow = {
    id: 'overdue',
    initialState: 'select_action',
    states: {
        select_action: selectAction,
        report_by_client: reportByClient,
    },
};
//# sourceMappingURL=overdue.flow.js.map