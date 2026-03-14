import type { AsaasChargeRequest, AsaasChargeResponse, AsaasPixQrCodeResponse, AsaasListResponse } from './asaas.types.js';
export declare function createCharge(data: AsaasChargeRequest): Promise<AsaasChargeResponse>;
export declare function getChargeById(id: string): Promise<AsaasChargeResponse>;
export declare function listCharges(params: {
    customer?: string;
    status?: string;
    dueDate?: {
        ge?: string;
        le?: string;
    };
    offset?: number;
    limit?: number;
}): Promise<AsaasListResponse<AsaasChargeResponse>>;
export declare function cancelCharge(id: string): Promise<AsaasChargeResponse>;
export declare function getPixQrCode(chargeId: string): Promise<AsaasPixQrCodeResponse>;
//# sourceMappingURL=asaas.charge.d.ts.map