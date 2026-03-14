import type { AirtableClientRecord } from './airtable.types.js';
export declare function createClientRecord(fields: AirtableClientRecord['fields']): Promise<string>;
export declare function findClientByAsaasId(asaasId: string): Promise<AirtableClientRecord | null>;
export declare function findClientByCpfCnpj(cpfCnpj: string): Promise<AirtableClientRecord | null>;
//# sourceMappingURL=airtable.clients.d.ts.map