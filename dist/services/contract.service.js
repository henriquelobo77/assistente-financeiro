import { ok, err } from '../shared/result.js';
import { ExternalApiError } from '../shared/errors.js';
import { ContractStatus } from '../types/contract.types.js';
import * as airtableContracts from '../integrations/airtable/airtable.contracts.js';
import { createChildLogger } from '../shared/logger.js';
const log = createChildLogger('contract-service');
function mapAirtableToContract(record) {
    const f = record.fields;
    return {
        airtableId: record.id,
        clientAsaasId: f.ClientAsaasId,
        clientName: f.ClientName,
        value: f.Value ?? 0,
        startDate: f.StartDate,
        endDate: f.EndDate,
        recurrence: f.Recurrence,
        status: f.Status ?? ContractStatus.Active,
        description: f.Description,
    };
}
export async function createContract(input) {
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
    }
    catch (error) {
        log.error({ error, input: { clientAsaasId: input.clientAsaasId } }, 'Failed to create contract');
        return err(new ExternalApiError('airtable', `Erro ao criar contrato: ${error.message}`, undefined, error));
    }
}
export async function listContractsByClient(clientAsaasId) {
    log.info({ clientAsaasId }, 'Listing contracts');
    try {
        const records = await airtableContracts.listContractsByClient(clientAsaasId);
        const contracts = records.map(mapAirtableToContract);
        return ok(contracts);
    }
    catch (error) {
        log.error({ error, clientAsaasId }, 'Failed to list contracts');
        return err(new ExternalApiError('airtable', `Erro ao listar contratos: ${error.message}`, undefined, error));
    }
}
export async function updateContractStatus(airtableId, status) {
    log.info({ airtableId, status }, 'Updating contract status');
    try {
        await airtableContracts.updateContractStatus(airtableId, status);
        return ok(undefined);
    }
    catch (error) {
        log.error({ error, airtableId }, 'Failed to update contract status');
        return err(new ExternalApiError('airtable', `Erro ao atualizar contrato: ${error.message}`, undefined, error));
    }
}
//# sourceMappingURL=contract.service.js.map