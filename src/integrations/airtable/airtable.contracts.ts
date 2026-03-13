import { getContractsTable } from './airtable.client.js';
import type { AirtableContractRecord } from './airtable.types.js';
import { withRetry } from '../../shared/retry.js';

export async function createContractRecord(
  fields: AirtableContractRecord['fields'],
): Promise<string> {
  return withRetry(
    async () => {
      const records = await getContractsTable().create([{ fields }]);
      const record = records[0];
      if (!record) throw new Error('Failed to create Airtable contract record');
      return record.id;
    },
    'airtable.createContract',
  );
}

export async function listContractsByClient(
  clientAsaasId: string,
): Promise<AirtableContractRecord[]> {
  return withRetry(
    async () => {
      const records = await getContractsTable()
        .select({
          filterByFormula: `{ClientAsaasId} = "${clientAsaasId}"`,
        })
        .firstPage();

      return records.map((r) => ({
        id: r.id,
        fields: r.fields as AirtableContractRecord['fields'],
      }));
    },
    'airtable.listContractsByClient',
  );
}

export async function updateContractStatus(
  recordId: string,
  status: string,
): Promise<void> {
  return withRetry(
    async () => {
      await getContractsTable().update(recordId, { Status: status });
    },
    'airtable.updateContractStatus',
  );
}
