import { getClientsTable } from './airtable.client.js';
import type { AirtableClientRecord } from './airtable.types.js';
import { withRetry } from '../../shared/retry.js';

export async function createClientRecord(fields: AirtableClientRecord['fields']): Promise<string> {
  return withRetry(
    async () => {
      const records = await getClientsTable().create([{ fields }]);
      const record = records[0];
      if (!record) throw new Error('Failed to create Airtable client record');
      return record.id;
    },
    'airtable.createClient',
  );
}

export async function findClientByAsaasId(
  asaasId: string,
): Promise<AirtableClientRecord | null> {
  return withRetry(
    async () => {
      const records = await getClientsTable()
        .select({
          filterByFormula: `{AsaasId} = "${asaasId}"`,
          maxRecords: 1,
        })
        .firstPage();

      const record = records[0];
      if (!record) return null;

      return {
        id: record.id,
        fields: record.fields as AirtableClientRecord['fields'],
      };
    },
    'airtable.findClientByAsaasId',
  );
}

export async function findClientByCpfCnpj(
  cpfCnpj: string,
): Promise<AirtableClientRecord | null> {
  return withRetry(
    async () => {
      const records = await getClientsTable()
        .select({
          filterByFormula: `{CpfCnpj} = "${cpfCnpj}"`,
          maxRecords: 1,
        })
        .firstPage();

      const record = records[0];
      if (!record) return null;

      return {
        id: record.id,
        fields: record.fields as AirtableClientRecord['fields'],
      };
    },
    'airtable.findClientByCpfCnpj',
  );
}
