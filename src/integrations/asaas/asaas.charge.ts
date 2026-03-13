import { asaasClient } from './asaas.client.js';
import type {
  AsaasChargeRequest,
  AsaasChargeResponse,
  AsaasPixQrCodeResponse,
  AsaasListResponse,
} from './asaas.types.js';
import { withRetry } from '../../shared/retry.js';

export async function createCharge(data: AsaasChargeRequest): Promise<AsaasChargeResponse> {
  return withRetry(
    async () => {
      const response = await asaasClient.post<AsaasChargeResponse>('/payments', data);
      return response.data;
    },
    'asaas.createCharge',
  );
}

export async function getChargeById(id: string): Promise<AsaasChargeResponse> {
  return withRetry(
    async () => {
      const response = await asaasClient.get<AsaasChargeResponse>(`/payments/${id}`);
      return response.data;
    },
    'asaas.getChargeById',
  );
}

export async function listCharges(params: {
  customer?: string;
  status?: string;
  dueDate?: { ge?: string; le?: string };
  offset?: number;
  limit?: number;
}): Promise<AsaasListResponse<AsaasChargeResponse>> {
  const queryParams: Record<string, string | number | undefined> = {
    customer: params.customer,
    status: params.status,
    offset: params.offset,
    limit: params.limit,
  };

  if (params.dueDate?.ge) queryParams['dueDate[ge]'] = params.dueDate.ge;
  if (params.dueDate?.le) queryParams['dueDate[le]'] = params.dueDate.le;

  return withRetry(
    async () => {
      const response = await asaasClient.get<AsaasListResponse<AsaasChargeResponse>>(
        '/payments',
        { params: queryParams },
      );
      return response.data;
    },
    'asaas.listCharges',
  );
}

export async function cancelCharge(id: string): Promise<AsaasChargeResponse> {
  return withRetry(
    async () => {
      const response = await asaasClient.delete<AsaasChargeResponse>(`/payments/${id}`);
      return response.data;
    },
    'asaas.cancelCharge',
  );
}

export async function getPixQrCode(chargeId: string): Promise<AsaasPixQrCodeResponse> {
  return withRetry(
    async () => {
      const response = await asaasClient.get<AsaasPixQrCodeResponse>(
        `/payments/${chargeId}/pixQrCode`,
      );
      return response.data;
    },
    'asaas.getPixQrCode',
  );
}
