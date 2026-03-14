import { asaasClient } from './asaas.client.js';
import { withRetry } from '../../shared/retry.js';
export async function createCustomer(data) {
    return withRetry(async () => {
        const response = await asaasClient.post('/customers', data);
        return response.data;
    }, 'asaas.createCustomer');
}
export async function getCustomerById(id) {
    return withRetry(async () => {
        const response = await asaasClient.get(`/customers/${id}`);
        return response.data;
    }, 'asaas.getCustomerById');
}
export async function listCustomers(params) {
    return withRetry(async () => {
        const response = await asaasClient.get('/customers', { params });
        return response.data;
    }, 'asaas.listCustomers');
}
//# sourceMappingURL=asaas.customer.js.map