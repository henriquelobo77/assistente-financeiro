import { asaasClient } from './asaas.client.js';
import type {
  AsaasCustomerRequest,
  AsaasCustomerResponse,
  AsaasListResponse,
} from './asaas.types.js';
import { withRetry } from '../../shared/retry.js';

export async function createCustomer(
  data: AsaasCustomerRequest,
): Promise<AsaasCustomerResponse> {
  return withRetry(
    async () => {
      const response = await asaasClient.post<AsaasCustomerResponse>('/customers', data);
      return response.data;
    },
    'asaas.createCustomer',
  );
}

export async function getCustomerById(id: string): Promise<AsaasCustomerResponse> {
  return withRetry(
    async () => {
      const response = await asaasClient.get<AsaasCustomerResponse>(`/customers/${id}`);
      return response.data;
    },
    'asaas.getCustomerById',
  );
}

export async function listCustomers(params: {
  name?: string;
  cpfCnpj?: string;
  email?: string;
  offset?: number;
  limit?: number;
}): Promise<AsaasListResponse<AsaasCustomerResponse>> {
  return withRetry(
    async () => {
      const response = await asaasClient.get<AsaasListResponse<AsaasCustomerResponse>>(
        '/customers',
        { params },
      );
      return response.data;
    },
    'asaas.listCustomers',
  );
}
