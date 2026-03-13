import type { Result } from '../shared/result.js';
import { ok, err } from '../shared/result.js';
import { ExternalApiError } from '../shared/errors.js';
import type { Contract, CreateContractInput } from '../types/contract.types.js';
import { ContractStatus } from '../types/contract.types.js';
import * as airtableContracts from '../integrations/airtable/airtable.contracts.js';
import { createChildLogger } from '../shared/logger.js';

const log = createChildLogger('contract-service');

function mapAirtableToContract(record: { id: string; fields: Record<string, unknown> }): Contract {
  const f = record.fields;
  return {
    airtableId: record.id,
    clientAsaasId: f.ClientAsaasId as string,
    clientName: f.ClientName as string,
    value: (f.Value as number) ?? 0,
    startDate: f.StartDate as string,
    endDate: f.EndDate as string,
    recurrence: f.Recurrence as Contract['recurrence'],
    status: (f.Status as ContractStatus) ?? ContractStatus.Active,
    description: f.Description as string | undefined,
  };
}

export async function createContract(input: CreateContractInput): Promise<Result<Contract>> {
  log.info({ clientAsaasId: input.clientAsaasId, value: input.value }, 'Creating contract');

  try {
    const recordId = await airtableContracts.createContractRecord({
      ClientAsaasId: input.clientAsaasId,
      ClientName: input.clientName,
      Value: input.value / 100, // Store in reais
      StartDate: input.startDate,
      EndDate: input.endDate,
      Recurrence: input.recurrence,
      Status: ContractStatus.Active,
      Description: input.description,
      CreatedAt: new Date().toISOString(),
    });

    log.info({ recordId }, 'Contract created in Airtable');

    return ok({
      airtableId: recordId,
      clientAsaasId: input.clientAsaasId,
      clientName: input.clientName,
      value: input.value,
      startDate: input.startDate,
      endDate: input.endDate,
      recurrence: input.recurrence,
      status: ContractStatus.Active,
      description: input.description,
    });
  } catch (error) {
    log.error({ error, input: { clientAsaasId: input.clientAsaasId } }, 'Failed to create contract');
    return err(new ExternalApiError('airtable', `Erro ao criar contrato: ${(error as Error).message}`, undefined, error));
  }
}

export async function listContractsByClient(clientAsaasId: string): Promise<Result<Contract[]>> {
  log.info({ clientAsaasId }, 'Listing contracts');

  try {
    const records = await airtableContracts.listContractsByClient(clientAsaasId);
    const contracts = records.map(mapAirtableToContract);

    return ok(contracts);
  } catch (error) {
    log.error({ error, clientAsaasId }, 'Failed to list contracts');
    return err(new ExternalApiError('airtable', `Erro ao listar contratos: ${(error as Error).message}`, undefined, error));
  }
}

export async function updateContractStatus(
  airtableId: string,
  status: ContractStatus,
): Promise<Result<void>> {
  log.info({ airtableId, status }, 'Updating contract status');

  try {
    await airtableContracts.updateContractStatus(airtableId, status);
    return ok(undefined);
  } catch (error) {
    log.error({ error, airtableId }, 'Failed to update contract status');
    return err(new ExternalApiError('airtable', `Erro ao atualizar contrato: ${(error as Error).message}`, undefined, error));
  }
}
