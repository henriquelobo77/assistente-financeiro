import type { FlowDefinition, StateHandler } from '../machine.js';
import { END_FLOW } from '../machine.js';
import { sendText } from '../../whatsapp/message.sender.js';
import { isValidCpfCnpj, formatCpfCnpj } from '../../shared/formatters.js';
import * as clientService from '../../services/client.service.js';

const selectAction: StateHandler = async (ctx, message) => {
  const MENU =
    '*Clientes*\n\n' +
    '1. Cadastrar cliente\n' +
    '2. Buscar cliente\n' +
    '0. Voltar ao menu';

  const choice = message.text.trim();

  switch (choice) {
    case '1':
      await sendText(ctx.operatorJid, 'Informe o *nome completo* do cliente:');
      return { nextState: 'create_name', updatedData: {} };
    case '2':
      await sendText(ctx.operatorJid, 'Informe nome, CPF/CNPJ ou email do cliente:');
      return { nextState: 'search_client' };
    case '0':
      return END_FLOW;
    default:
      await sendText(ctx.operatorJid, MENU);
      return { nextState: 'select_action' };
  }
};

const createName: StateHandler = async (ctx, message) => {
  const name = message.text.trim();
  if (name.length < 3) {
    await sendText(ctx.operatorJid, 'Nome muito curto. Informe o nome completo:');
    return { nextState: 'create_name' };
  }

  await sendText(ctx.operatorJid, 'Informe o *CPF ou CNPJ* (somente numeros):');
  return { nextState: 'create_cpf', updatedData: { ...ctx.data, name } };
};

const createCpf: StateHandler = async (ctx, message) => {
  const cpfCnpj = message.text.replace(/\D/g, '');
  if (!isValidCpfCnpj(cpfCnpj)) {
    await sendText(ctx.operatorJid, 'CPF/CNPJ invalido. Informe 11 (CPF) ou 14 (CNPJ) digitos:');
    return { nextState: 'create_cpf' };
  }

  await sendText(ctx.operatorJid, 'Informe o *email* (ou *pular*):');
  return { nextState: 'create_email', updatedData: { ...ctx.data, cpfCnpj } };
};

const createEmail: StateHandler = async (ctx, message) => {
  const text = message.text.trim();
  const email = text.toLowerCase() === 'pular' ? undefined : text;

  await sendText(ctx.operatorJid, 'Informe o *telefone* com DDD (ou *pular*):');
  return { nextState: 'create_phone', updatedData: { ...ctx.data, email } };
};

const createPhone: StateHandler = async (ctx, message) => {
  const text = message.text.trim();
  const phone = text.toLowerCase() === 'pular' ? undefined : text.replace(/\D/g, '');

  const data: Record<string, unknown> = { ...ctx.data, phone };
  const summary =
    '*Confirma o cadastro?*\n\n' +
    `Nome: ${data.name as string}\n` +
    `CPF/CNPJ: ${formatCpfCnpj(data.cpfCnpj as string)}\n` +
    (data.email ? `Email: ${data.email as string}\n` : '') +
    (data.phone ? `Telefone: ${data.phone as string}\n` : '') +
    '\n1. Confirmar\n2. Cancelar';

  await sendText(ctx.operatorJid, summary);
  return { nextState: 'create_confirm', updatedData: data };
};

const createConfirm: StateHandler = async (ctx, message) => {
  if (message.text.trim() === '1') {
    await sendText(ctx.operatorJid, 'Cadastrando cliente, aguarde...');

    const result = await clientService.createClient({
      name: ctx.data.name as string,
      cpfCnpj: ctx.data.cpfCnpj as string,
      email: ctx.data.email as string | undefined,
      phone: ctx.data.phone as string | undefined,
    });

    if (!result.ok) {
      await sendText(ctx.operatorJid, `Erro ao cadastrar cliente: ${result.error.message}`);
      return END_FLOW;
    }

    const client = result.value;
    await sendText(
      ctx.operatorJid,
      `*Cliente cadastrado com sucesso!*\n\n` +
        `Nome: ${client.name}\n` +
        `CPF/CNPJ: ${formatCpfCnpj(client.cpfCnpj)}\n` +
        `ID ASAAS: ${client.asaasId}` +
        (client.airtableId ? `\nID Airtable: ${client.airtableId}` : ''),
    );
    return END_FLOW;
  }

  await sendText(ctx.operatorJid, 'Cadastro cancelado.');
  return END_FLOW;
};

const searchClient: StateHandler = async (ctx, message) => {
  const query = message.text.trim();
  await sendText(ctx.operatorJid, `Buscando "${query}"...`);

  const result = await clientService.searchClients(query);

  if (!result.ok) {
    await sendText(ctx.operatorJid, `Erro na busca: ${result.error.message}`);
    return END_FLOW;
  }

  if (result.value.length === 0) {
    await sendText(ctx.operatorJid, 'Nenhum cliente encontrado.');
    return END_FLOW;
  }

  const list = result.value
    .slice(0, 10)
    .map(
      (c) =>
        `*${c.name}*\n` +
        `  CPF/CNPJ: ${formatCpfCnpj(c.cpfCnpj)}\n` +
        `  ID: ${c.asaasId}` +
        (c.email ? `\n  Email: ${c.email}` : '') +
        (c.phone ? `\n  Tel: ${c.phone}` : ''),
    )
    .join('\n\n');

  await sendText(ctx.operatorJid, `*Resultados (${result.value.length}):*\n\n${list}`);
  return END_FLOW;
};

export const clientFlow: FlowDefinition = {
  id: 'client',
  initialState: 'select_action',
  states: {
    select_action: selectAction,
    create_name: createName,
    create_cpf: createCpf,
    create_email: createEmail,
    create_phone: createPhone,
    create_confirm: createConfirm,
    search_client: searchClient,
  },
};
