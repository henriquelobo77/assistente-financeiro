import { getContractsTable } from './airtable.client.js';
import { withRetry } from '../../shared/retry.js';
export async function createContractRecord(fields) {
    return withRetry(async () => {
        const records = await getContractsTable().create([{ fields }]);
        const record = records[0];
        if (!record)
            throw new Error('Failed to create Airtable contract record');
        return record.id;
    }, 'airtable.createContract');
}
export async function listContractsByClient(clientAsaasId) {
    return withRetry(async () => {
        const records = await getContractsTable()
            .select({
            filterByFormula: `{ClientAsaasId} = "${clientAsaasId}"`,
        })
            .firstPage();
        return records.map((r) => ({
            id: r.id,
            fields: r.fields,
        }));
    }, 'airtable.listContractsByClient');
}
export async function updateContractStatus(recordId, status) {
    return withRetry(async () => {
        await getContractsTable().update(recordId, { Status: status });
    }, 'airtable.updateContractStatus');
}
//# sourceMappingURL=airtable.contracts.js.map