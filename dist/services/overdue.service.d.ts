import type { Result } from '../shared/result.js';
import type { Charge } from '../types/charge.types.js';
export interface OverdueReport {
    totalAmountCents: number;
    totalCount: number;
    charges: Charge[];
}
export declare function getOverdueReport(): Promise<Result<OverdueReport>>;
export declare function getOverdueByClient(customerIdOrCpf: string): Promise<Result<OverdueReport>>;
//# sourceMappingURL=overdue.service.d.ts.map