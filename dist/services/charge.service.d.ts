import type { Result } from '../shared/result.js';
import type { Charge, CreateChargeInput } from '../types/charge.types.js';
import type { PaginatedResponse } from '../types/common.types.js';
export declare function createCharge(input: CreateChargeInput): Promise<Result<Charge>>;
export declare function listChargesByCustomer(customerId: string): Promise<Result<PaginatedResponse<Charge>>>;
export declare function listOverdueCharges(): Promise<Result<Charge[]>>;
export declare function cancelCharge(chargeId: string): Promise<Result<Charge>>;
//# sourceMappingURL=charge.service.d.ts.map