import { ok, err } from '../shared/result.js';
import { ExternalApiError } from '../shared/errors.js';
import { BillingType } from '../types/charge.types.js';
import * as asaasCharge from '../integrations/asaas/asaas.charge.js';
import { createChildLogger } from '../shared/logger.js';
const log = createChildLogger('charge-service');
function mapAsaasToCharge(raw) {
    return {
        id: raw.id,
        customerId: raw.customer,
        value: Math.round(raw.value * 100),
        netValue: Math.round(raw.netValue * 100),
        dueDate: raw.dueDate,
        billingType: raw.billingType,
        status: raw.status,
        description: raw.description,
        invoiceUrl: raw.invoiceUrl,
        bankSlipUrl: raw.bankSlipUrl,
    };
}
export async function createCharge(input) {
    log.info({ customerId: input.customerId, value: input.value }, 'Creating charge');
    try {
        const asaasResponse = await asaasCharge.createCharge({
            customer: input.customerId,
            billingType: input.billingType,
            value: input.value / 100, // ASAAS expects value in reais
            dueDate: input.dueDate,
            description: input.description,
        });
        const charge = mapAsaasToCharge(asaasResponse);
        // If PIX, fetch QR code
        if (input.billingType === BillingType.Pix) {
            try {
                const pixData = await asaasCharge.getPixQrCode(asaasResponse.id);
                charge.pixQrCodeBase64 = pixData.encodedImage;
                charge.pixCopiaECola = pixData.payload;
            }
            catch (pixError) {
                log.warn({ error: pixError, chargeId: asaasResponse.id }, 'Failed to get PIX QR code');
            }
        }
        log.info({ chargeId: charge.id }, 'Charge created successfully');
        return ok(charge);
    }
    catch (error) {
        log.error({ error, input: { customerId: input.customerId } }, 'Failed to create charge');
        return err(new ExternalApiError('asaas', `Erro ao criar cobranca: ${error.message}`, undefined, error));
    }
}
export async function listChargesByCustomer(customerId) {
    log.info({ customerId }, 'Listing charges');
    try {
        const response = await asaasCharge.listCharges({ customer: customerId, limit: 20 });
        const charges = response.data.map(mapAsaasToCharge);
        return ok({
            data: charges,
            hasMore: response.hasMore,
            totalCount: response.totalCount,
        });
    }
    catch (error) {
        log.error({ error, customerId }, 'Failed to list charges');
        return err(new ExternalApiError('asaas', `Erro ao listar cobrancas: ${error.message}`, undefined, error));
    }
}
export async function listOverdueCharges() {
    log.info('Listing overdue charges');
    try {
        const allOverdue = [];
        let offset = 0;
        let hasMore = true;
        while (hasMore) {
            const response = await asaasCharge.listCharges({
                status: 'OVERDUE',
                offset,
                limit: 100,
            });
            allOverdue.push(...response.data.map(mapAsaasToCharge));
            hasMore = response.hasMore;
            offset += response.limit;
        }
        log.info({ count: allOverdue.length }, 'Overdue charges fetched');
        return ok(allOverdue);
    }
    catch (error) {
        log.error({ error }, 'Failed to list overdue charges');
        return err(new ExternalApiError('asaas', `Erro ao listar inadimplencia: ${error.message}`, undefined, error));
    }
}
export async function cancelCharge(chargeId) {
    log.info({ chargeId }, 'Cancelling charge');
    try {
        const response = await asaasCharge.cancelCharge(chargeId);
        return ok(mapAsaasToCharge(response));
    }
    catch (error) {
        log.error({ error, chargeId }, 'Failed to cancel charge');
        return err(new ExternalApiError('asaas', `Erro ao cancelar cobranca: ${error.message}`, undefined, error));
    }
}
//# sourceMappingURL=charge.service.js.map