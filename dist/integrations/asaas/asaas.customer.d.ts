import type { AsaasCustomerRequest, AsaasCustomerResponse, AsaasListResponse } from './asaas.types.js';
export declare function createCustomer(data: AsaasCustomerRequest): Promise<AsaasCustomerResponse>;
export declare function getCustomerById(id: string): Promise<AsaasCustomerResponse>;
export declare function listCustomers(params: {
    name?: string;
    cpfCnpj?: string;
    email?: string;
    offset?: number;
    limit?: number;
}): Promise<AsaasListResponse<AsaasCustomerResponse>>;
//# sourceMappingURL=asaas.customer.d.ts.map