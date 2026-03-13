import type { FlowDefinition, StateHandler } from '../machine.js';
import { END_FLOW } from '../machine.js';
import { sendText } from '../../whatsapp/message.sender.js';
import { parseBRL, formatBRL, parseDate, formatDate, formatCpfCnpj } from '../../shared/formatters.js';
import type { BillingType } from '../../types/charge.types.js';
import * as chargeService from '../../services/charge.service.js';
import * as clientService from '../../services/client.service.js';

const selectAction: StateHandler = async (ctx, message) => {
  const MENU =
    '*Cobrancas*\n\n' +
    '1. Criar cobranca\n' +
    '2. Listar cobrancas de cliente\n' +
    '3. Cancelar cobranca\n' +
    '0. Voltar ao menu';

  const choice = message.text.trim();

  switch (choice) {
    case '1':
      await sendText(ctx.operatorJid, 'Informe o CPF/CNPJ ou nome do cliente:');
      return { nextState: 'create_search_client' };
    case '2':
      await sendText(ctx.operatorJid, 'Informe o CPF/CNPJ ou nome do cliente:');
      return { nextState: 'list_search_client' };
    case '3':
      await sendText(ctx.operatorJid, 'Informe o ID da cobranca (ex: pay_xxxx):');
      return { nextState: 'cancel_charge_id' };
    case '0':
      return END_FLOW;
    default:
      await sendText(ctx.operatorJid, MENU);
      return { nextState: 'select_action' };
  }
};

const createSearchClient: StateHandler = async (ctx, message) => {
  const input = message.text.trim();

  const result = await clientService.searchClients(input);
  if (!result.ok) {
    await sendText(ctx.operatorJid, `Erro ao buscar cliente: ${result.error.message}\n\nTente novamente ou digite *0* para voltar.`);
    return { nextState: 'create_search_client' };
  }

  if (result.value.length === 0) {
    await sendText(ctx.operatorJid, 'Nenhum cliente encontrado. Tente outro termo ou digite *0* para voltar.');
    return { nextState: 'create_search_client' };
  }

  if (result.value.length === 1) {
    const client = result.value[0]!;
    await sendText(
      ctx.operatorJid,
      `Cliente encontrado: *${client.name}* (${formatCpfCnpj(client.cpfCnpj)})\n\nInforme o valor da cobranca (ex: 150,00):`,
    );
    return {
      nextState: 'create_value',
      updatedData: { ...ctx.data, customerId: client.asaasId, customerName: client.name },
    };
  }

  // Multiple results - let operator choose
  const list = result.value
    .slice(0, 5)
    .map((c, i) => `${i + 1}. ${c.name} - ${formatCpfCnpj(c.cpfCnpj)}`)
    .join('\n');

  await sendText(ctx.operatorJid, `Clientes encontrados:\n\n${list}\n\nDigite o numero para selecionar:`);
  return {
    nextState: 'create_select_client',
    updatedData: { ...ctx.data, searchResults: result.value.slice(0, 5) },
  };
};

const createSelectClient: StateHandler = async (ctx, message) => {
  const choice = parseInt(message.text.trim(), 10);
  const results = ctx.data.searchResults as Array<{ asaasId: string; name: string; cpfCnpj: string }>;

  if (isNaN(choice) || choice < 1 || choice > results.length) {
    await sendText(ctx.operatorJid, `Opcao invalida. Digite de 1 a ${results.length}:`);
    return { nextState: 'create_select_client' };
  }

  const client = results[choice - 1]!;
  await sendText(ctx.operatorJid, `Cliente: *${client.name}*\n\nInforme o valor da cobranca (ex: 150,00):`);
  return {
    nextState: 'create_value',
    updatedData: { ...ctx.data, customerId: client.asaasId, customerName: client.name, searchResults: undefined },
  };
};

const createValue: StateHandler = async (ctx, message) => {
  const valueInCents = parseBRL(message.text);
  if (!valueInCents) {
    await sendText(ctx.operatorJid, 'Valor invalido. Informe no formato: 150,00');
    return { nextState: 'create_value' };
  }

  await sendText(ctx.operatorJid, 'Informe a data de vencimento (DD/MM/AAAA):');
  return {
    nextState: 'create_due_date',
    updatedData: { ...ctx.data, value: valueInCents },
  };
};

const createDueDate: StateHandler = async (ctx, message) => {
  const isoDate = parseDate(message.text);
  if (!isoDate) {
    await sendText(ctx.operatorJid, 'Data invalida. Use o formato DD/MM/AAAA (ex: 15/04/2026):');
    return { nextState: 'create_due_date' };
  }

  await sendText(
    ctx.operatorJid,
    'Forma de pagamento:\n\n1. Boleto\n2. PIX\n3. Cartao de credito',
  );
  return {
    nextState: 'create_billing_type',
    updatedData: { ...ctx.data, dueDate: isoDate },
  };
};

const BILLING_MAP: Record<string, BillingType> = {
  '1': 'BOLETO' as BillingType,
  '2': 'PIX' as BillingType,
  '3': 'CREDIT_CARD' as BillingType,
};

const BILLING_LABELS: Record<string, string> = {
  BOLETO: 'Boleto',
  PIX: 'PIX',
  CREDIT_CARD: 'Cartao de credito',
};

const createBillingType: StateHandler = async (ctx, message) => {
  const billingType = BILLING_MAP[message.text.trim()];
  if (!billingType) {
    await sendText(ctx.operatorJid, 'Opcao invalida. Digite 1, 2 ou 3.');
    return { nextState: 'create_billing_type' };
  }

  await sendText(ctx.operatorJid, 'Descricao da cobranca (ou *pular*):');
  return {
    nextState: 'create_description',
    updatedData: { ...ctx.data, billingType },
  };
};

const createDescription: StateHandler = async (ctx, message) => {
  const desc = message.text.trim().toLowerCase() === 'pular' ? undefined : message.text.trim();
  const data: Record<string, unknown> = { ...ctx.data, description: desc };

  const value = data.value as number;
  const dueDate = data.dueDate as string;
  const billingType = data.billingType as string;

  const summary =
    '*Confirma a cobranca?*\n\n' +
    `Cliente: ${data.customerName as string}\n` +
    `Valor: ${formatBRL(value)}\n` +
    `Vencimento: ${formatDate(dueDate)}\n` +
    `Forma: ${BILLING_LABELS[billingType] ?? billingType}\n` +
    (desc ? `Descricao: ${desc}\n` : '') +
    '\n1. Confirmar\n2. Cancelar';

  await sendText(ctx.operatorJid, summary);
  return { nextState: 'create_confirm', updatedData: data };
};

const createConfirm: StateHandler = async (ctx, message) => {
  const choice = message.text.trim();

  if (choice === '1') {
    await sendText(ctx.operatorJid, 'Criando cobranca, aguarde...');

    const result = await chargeService.createCharge({
      customerId: ctx.data.customerId as string,
      value: ctx.data.value as number,
      dueDate: ctx.data.dueDate as string,
      billingType: ctx.data.billingType as BillingType,
      description: ctx.data.description as string | undefined,
    });

    if (!result.ok) {
      await sendText(ctx.operatorJid, `Erro ao criar cobranca: ${result.error.message}`);
      return END_FLOW;
    }

    const charge = result.value;
    let msg =
      `*Cobranca criada com sucesso!*\n\n` +
      `ID: ${charge.id}\n` +
      `Valor: ${formatBRL(charge.value)}\n` +
      `Vencimento: ${formatDate(charge.dueDate)}\n` +
      `Status: ${charge.status}`;

    if (charge.invoiceUrl) msg += `\nLink: ${charge.invoiceUrl}`;
    if (charge.bankSlipUrl) msg += `\nBoleto: ${charge.bankSlipUrl}`;
    if (charge.pixCopiaECola) msg += `\nPIX Copia e Cola: ${charge.pixCopiaECola}`;

    await sendText(ctx.operatorJid, msg);
    return END_FLOW;
  }

  await sendText(ctx.operatorJid, 'Cobranca cancelada.');
  return END_FLOW;
};

const listSearchClient: StateHandler = async (ctx, message) => {
  const input = message.text.trim();

  const clientResult = await clientService.searchClients(input);
  if (!clientResult.ok || clientResult.value.length === 0) {
    await sendText(ctx.operatorJid, 'Cliente nao encontrado. Verifique os dados e tente novamente.');
    return END_FLOW;
  }

  const client = clientResult.value[0]!;
  await sendText(ctx.operatorJid, `Buscando cobrancas de *${client.name}*...`);

  const chargesResult = await chargeService.listChargesByCustomer(client.asaasId);
  if (!chargesResult.ok) {
    await sendText(ctx.operatorJid, `Erro ao listar cobrancas: ${chargesResult.error.message}`);
    return END_FLOW;
  }

  const charges = chargesResult.value.data;
  if (charges.length === 0) {
    await sendText(ctx.operatorJid, `Nenhuma cobranca encontrada para *${client.name}*.`);
    return END_FLOW;
  }

  const list = charges
    .slice(0, 10)
    .map(
      (c) =>
        `- ${c.id} | ${formatBRL(c.value)} | Venc: ${formatDate(c.dueDate)} | ${c.status}`,
    )
    .join('\n');

  const total = chargesResult.value.totalCount;
  await sendText(
    ctx.operatorJid,
    `*Cobrancas de ${client.name}* (${total} total)\n\n${list}${total > 10 ? '\n\n...(mostrando 10 primeiras)' : ''}`,
  );
  return END_FLOW;
};

const cancelChargeId: StateHandler = async (ctx, message) => {
  const chargeId = message.text.trim();

  if (!chargeId.startsWith('pay_')) {
    await sendText(ctx.operatorJid, 'ID invalido. O ID da cobranca deve comecar com "pay_".\nTente novamente ou digite *0* para voltar.');
    return { nextState: 'cancel_charge_id' };
  }

  await sendText(ctx.operatorJid, `Cancelando cobranca ${chargeId}...`);
  const result = await chargeService.cancelCharge(chargeId);

  if (!result.ok) {
    await sendText(ctx.operatorJid, `Erro ao cancelar: ${result.error.message}`);
    return END_FLOW;
  }

  await sendText(ctx.operatorJid, `Cobranca ${chargeId} cancelada com sucesso.`);
  return END_FLOW;
};

export const chargeFlow: FlowDefinition = {
  id: 'charge',
  initialState: 'select_action',
  states: {
    select_action: selectAction,
    create_search_client: createSearchClient,
    create_select_client: createSelectClient,
    create_value: createValue,
    create_due_date: createDueDate,
    create_billing_type: createBillingType,
    create_description: createDescription,
    create_confirm: createConfirm,
    list_search_client: listSearchClient,
    cancel_charge_id: cancelChargeId,
  },
};
