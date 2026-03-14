import type { Result } from '../shared/result.js';
import type { Contract, CreateContractInput } from '../types/contract.types.js';
import { ContractStatus } from '../types/contract.types.js';
export declare function createContract(input: CreateContractInput): Promise<Result<Contract>>;
export declare function listContractsByClient(clientAsaasId: string): Promise<Result<Contract[]>>;
export declare function updateContractStatus(airtableId: string, status: ContractStatus): Promise<Result<void>>;
//# sourceMappingURL=contract.service.d.ts.map