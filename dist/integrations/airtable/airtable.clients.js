import { getClientsTable } from './airtable.client.js';
import { withRetry } from '../../shared/retry.js';
export async function createClientRecord(fields) {
    return withRetry(async () => {
        const records = await getClientsTable().create([{ fields }]);
        const record = records[0];
        if (!record)
            throw new Error('Failed to create Airtable client record');
        return record.id;
    }, 'airtable.createClient');
}
export async function findClientByAsaasId(asaasId) {
    return withRetry(async () => {
        const records = await getClientsTable()
            .select({
            filterByFormula: `{AsaasId} = "${asaasId}"`,
            maxRecords: 1,
        })
            .firstPage();
        const record = records[0];
        if (!record)
            return null;
        return {
            id: record.id,
            fields: record.fields,
        };
    }, 'airtable.findClientByAsaasId');
}
export async function findClientByCpfCnpj(cpfCnpj) {
    return withRetry(async () => {
        const records = await getClientsTable()
            .select({
            filterByFormula: `{CpfCnpj} = "${cpfCnpj}"`,
            maxRecords: 1,
        })
            .firstPage();
        const record = records[0];
        if (!record)
            return null;
        return {
            id: record.id,
            fields: record.fields,
        };
    }, 'airtable.findClientByCpfCnpj');
}
//# sourceMappingURL=airtable.clients.js.map