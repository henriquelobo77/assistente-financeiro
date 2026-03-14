import type { AirtableContractRecord } from './airtable.types.js';
export declare function createContractRecord(fields: AirtableContractRecord['fields']): Promise<string>;
export declare function listContractsByClient(clientAsaasId: string): Promise<AirtableContractRecord[]>;
export declare function updateContractStatus(recordId: string, status: string): Promise<void>;
//# sourceMappingURL=airtable.contracts.d.ts.map