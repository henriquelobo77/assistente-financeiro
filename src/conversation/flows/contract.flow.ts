import type { FlowDefinition, StateHandler } from '../machine.js';
import { END_FLOW } from '../machine.js';
import { sendText } from '../../telegram/message.sender.js';
import { parseBRL, formatBRL, parseDate, formatDate, formatCpfCnpj } from '../../shared/formatters.js';
import type { RecurrencePeriod } from '../../types/contract.types.js';
import * as contractService from '../../services/contract.service.js';
import * as clientService from '../../services/client.service.js';

const selectAction: StateHandler = async (ctx, message) => {
  const MENU =
    '*Contratos*\n\n' +
    '1. Criar contrato\n' +
    '2. Listar contratos de cliente\n' +
    '0. Voltar ao menu';

  const choice = message.text.trim();

  switch (choice) {
    case '1':
      await sendText(ctx.operatorJid, 'Informe o CPF/CNPJ ou nome do cliente:');
      return { nextState: 'create_search_client', updatedData: {} };
    case '2':
      await sendText(ctx.operatorJid, 'Informe o CPF/CNPJ ou nome do cliente:');
      return { nextState: 'list_contracts' };
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
    await sendText(ctx.operatorJid, `Erro ao buscar cliente: ${result.error.message}\nTente novamente ou *0* para voltar.`);
    return { nextState: 'create_search_client' };
  }

  if (result.value.length === 0) {
    await sendText(ctx.operatorJid, 'Nenhum cliente encontrado. Tente outro termo ou *0* para voltar.');
    return { nextState: 'create_search_client' };
  }

  if (result.value.length === 1) {
    const client = result.value[0]!;
    await sendText(
      ctx.operatorJid,
      `Cliente: *${client.name}* (${formatCpfCnpj(client.cpfCnpj)})\n\nInforme o valor mensal do contrato (ex: 1500,00):`,
    );
    return {
      nextState: 'create_value',
      updatedData: { ...ctx.data, clientAsaasId: client.asaasId, clientName: client.name },
    };
  }

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
  await sendText(ctx.operatorJid, `Cliente: *${client.name}*\n\nInforme o valor mensal do contrato (ex: 1500,00):`);
  return {
    nextState: 'create_value',
    updatedData: { ...ctx.data, clientAsaasId: client.asaasId, clientName: client.name, searchResults: undefined },
  };
};

const createValue: StateHandler = async (ctx, message) => {
  const value = parseBRL(message.text);
  if (!value) {
    await sendText(ctx.operatorJid, 'Valor invalido. Informe no formato: 1500,00');
    return { nextState: 'create_value' };
  }

  await sendText(ctx.operatorJid, 'Data de inicio (DD/MM/AAAA):');
  return { nextState: 'create_start_date', updatedData: { ...ctx.data, value } };
};

const createStartDate: StateHandler = async (ctx, message) => {
  const date = parseDate(message.text);
  if (!date) {
    await sendText(ctx.operatorJid, 'Data invalida. Use DD/MM/AAAA:');
    return { nextState: 'create_start_date' };
  }

  await sendText(ctx.operatorJid, 'Data de fim (DD/MM/AAAA):');
  return { nextState: 'create_end_date', updatedData: { ...ctx.data, startDate: date } };
};

const createEndDate: StateHandler = async (ctx, message) => {
  const date = parseDate(message.text);
  if (!date) {
    await sendText(ctx.operatorJid, 'Data invalida. Use DD/MM/AAAA:');
    return { nextState: 'create_end_date' };
  }

  await sendText(
    ctx.operatorJid,
    'Recorrencia:\n\n1. Mensal\n2. Trimestral\n3. Semestral\n4. Anual',
  );
  return { nextState: 'create_recurrence', updatedData: { ...ctx.data, endDate: date } };
};

const RECURRENCE_MAP: Record<string, RecurrencePeriod> = {
  '1': 'monthly' as RecurrencePeriod,
  '2': 'quarterly' as RecurrencePeriod,
  '3': 'semiannual' as RecurrencePeriod,
  '4': 'annual' as RecurrencePeriod,
};

const RECURRENCE_LABELS: Record<string, string> = {
  monthly: 'Mensal',
  quarterly: 'Trimestral',
  semiannual: 'Semestral',
  annual: 'Anual',
};

const createRecurrence: StateHandler = async (ctx, message) => {
  const recurrence = RECURRENCE_MAP[message.text.trim()];
  if (!recurrence) {
    await sendText(ctx.operatorJid, 'Opcao invalida. Digite 1, 2, 3 ou 4.');
    return { nextState: 'create_recurrence' };
  }

  const data: Record<string, unknown> = { ...ctx.data, recurrence };
  const value = data.value as number;
  const startDate = data.startDate as string;
  const endDate = data.endDate as string;

  const summary =
    '*Confirma o contrato?*\n\n' +
    `Cliente: ${data.clientName as string}\n` +
    `Valor: ${formatBRL(value)}\n` +
    `Inicio: ${formatDate(startDate)}\n` +
    `Fim: ${formatDate(endDate)}\n` +
    `Recorrencia: ${RECURRENCE_LABELS[recurrence] ?? recurrence}\n` +
    '\n1. Confirmar\n2. Cancelar';

  await sendText(ctx.operatorJid, summary);
  return { nextState: 'create_confirm', updatedData: data };
};

const createConfirm: StateHandler = async (ctx, message) => {
  if (message.text.trim() === '1') {
    await sendText(ctx.operatorJid, 'Criando contrato, aguarde...');

    const result = await contractService.createContract({
      clientAsaasId: ctx.data.clientAsaasId as string,
      clientName: ctx.data.clientName as string,
      value: ctx.data.value as number,
      startDate: ctx.data.startDate as string,
      endDate: ctx.data.endDate as string,
      recurrence: ctx.data.recurrence as RecurrencePeriod,
    });

    if (!result.ok) {
      await sendText(ctx.operatorJid, `Erro ao criar contrato: ${result.error.message}`);
      return END_FLOW;
    }

    const contract = result.value;
    await sendText(
      ctx.operatorJid,
      `*Contrato criado com sucesso!*\n\n` +
        `Cliente: ${contract.clientName}\n` +
        `Valor: ${formatBRL(contract.value)}\n` +
        `Periodo: ${formatDate(contract.startDate)} a ${formatDate(contract.endDate)}\n` +
        `Recorrencia: ${RECURRENCE_LABELS[contract.recurrence] ?? contract.recurrence}\n` +
        `ID: ${contract.airtableId}`,
    );
    return END_FLOW;
  }

  await sendText(ctx.operatorJid, 'Contrato cancelado.');
  return END_FLOW;
};

const listContracts: StateHandler = async (ctx, message) => {
  const input = message.text.trim();

  const clientResult = await clientService.searchClients(input);
  if (!clientResult.ok || clientResult.value.length === 0) {
    await sendText(ctx.operatorJid, 'Cliente nao encontrado.');
    return END_FLOW;
  }

  const client = clientResult.value[0]!;
  await sendText(ctx.operatorJid, `Buscando contratos de *${client.name}*...`);

  const result = await contractService.listContractsByClient(client.asaasId);
  if (!result.ok) {
    await sendText(ctx.operatorJid, `Erro ao listar contratos: ${result.error.message}`);
    return END_FLOW;
  }

  if (result.value.length === 0) {
    await sendText(ctx.operatorJid, `Nenhum contrato encontrado para *${client.name}*.`);
    return END_FLOW;
  }

  const list = result.value
    .map(
      (c) =>
        `*${c.clientName}*\n` +
        `  Valor: ${formatBRL(c.value)}\n` +
        `  Periodo: ${formatDate(c.startDate)} a ${formatDate(c.endDate)}\n` +
        `  Recorrencia: ${RECURRENCE_LABELS[c.recurrence] ?? c.recurrence}\n` +
        `  Status: ${c.status}\n` +
        `  ID: ${c.airtableId}`,
    )
    .join('\n\n');

  await sendText(ctx.operatorJid, `*Contratos de ${client.name}:*\n\n${list}`);
  return END_FLOW;
};

export const contractFlow: FlowDefinition = {
  id: 'contract',
  initialState: 'select_action',
  states: {
    select_action: selectAction,
    create_search_client: createSearchClient,
    create_select_client: createSelectClient,
    create_value: createValue,
    create_start_date: createStartDate,
    create_end_date: createEndDate,
    create_recurrence: createRecurrence,
    create_confirm: createConfirm,
    list_contracts: listContracts,
  },
};
