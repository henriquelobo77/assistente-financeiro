import type { Result } from '../shared/result.js';
import type { Client, CreateClientInput } from '../types/client.types.js';
export declare function createClient(input: CreateClientInput): Promise<Result<Client>>;
export declare function searchClients(query: string): Promise<Result<Client[]>>;
export declare function getClientByAsaasId(asaasId: string): Promise<Result<Client>>;
//# sourceMappingURL=client.service.d.ts.map