import { asaasClient } from './asaas.client.js';
import { withRetry } from '../../shared/retry.js';
export async function createCharge(data) {
    return withRetry(async () => {
        const response = await asaasClient.post('/payments', data);
        return response.data;
    }, 'asaas.createCharge');
}
export async function getChargeById(id) {
    return withRetry(async () => {
        const response = await asaasClient.get(`/payments/${id}`);
        return response.data;
    }, 'asaas.getChargeById');
}
export async function listCharges(params) {
    const queryParams = {
        customer: params.customer,
        status: params.status,
        offset: params.offset,
        limit: params.limit,
    };
    if (params.dueDate?.ge)
        queryParams['dueDate[ge]'] = params.dueDate.ge;
    if (params.dueDate?.le)
        queryParams['dueDate[le]'] = params.dueDate.le;
    return withRetry(async () => {
        const response = await asaasClient.get('/payments', { params: queryParams });
        return response.data;
    }, 'asaas.listCharges');
}
export async function cancelCharge(id) {
    return withRetry(async () => {
        const response = await asaasClient.delete(`/payments/${id}`);
        return response.data;
    }, 'asaas.cancelCharge');
}
export async function getPixQrCode(chargeId) {
    return withRetry(async () => {
        const response = await asaasClient.get(`/payments/${chargeId}/pixQrCode`);
        return response.data;
    }, 'asaas.getPixQrCode');
}
//# sourceMappingURL=asaas.charge.js.map