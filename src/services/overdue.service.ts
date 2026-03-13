import type { Result } from '../shared/result.js';
import { ok, err } from '../shared/result.js';
import { ExternalApiError } from '../shared/errors.js';
import type { Charge } from '../types/charge.types.js';
import { createChildLogger } from '../shared/logger.js';
import { listOverdueCharges } from './charge.service.js';
import { getCustomerById } from '../integrations/asaas/asaas.customer.js';

const log = createChildLogger('overdue-service');

export interface OverdueReport {
  totalAmountCents: number;
  totalCount: number;
  charges: Charge[];
}

export async function getOverdueReport(): Promise<Result<OverdueReport>> {
  log.info('Generating overdue report');

  try {
    const overdueResult = await listOverdueCharges();

    if (!overdueResult.ok) {
      return overdueResult;
    }

    const charges = overdueResult.value;

    // Enrich top charges with customer names (limit to avoid API overload)
    const topCharges = charges
      .sort((a, b) => b.value - a.value)
      .slice(0, 20);

    const enrichedCharges = await Promise.all(
      topCharges.map(async (charge) => {
        try {
          const customer = await getCustomerById(charge.customerId);
          return { ...charge, customerName: customer.name };
        } catch {
          return charge;
        }
      }),
    );

    const totalAmountCents = charges.reduce((sum, c) => sum + c.value, 0);

    return ok({
      totalAmountCents,
      totalCount: charges.length,
      charges: enrichedCharges,
    });
  } catch (error) {
    log.error({ error }, 'Failed to generate overdue report');
    return err(new ExternalApiError('asaas', `Erro ao gerar relatorio: ${(error as Error).message}`, undefined, error));
  }
}

export async function getOverdueByClient(
  customerIdOrCpf: string,
): Promise<Result<OverdueReport>> {
  log.info({ customerIdOrCpf }, 'Getting overdue by client');

  try {
    // If it looks like a CPF/CNPJ, we need to search for the customer first
    const { listCustomers } = await import('../integrations/asaas/asaas.customer.js');
    const { listCharges } = await import('../integrations/asaas/asaas.charge.js');

    let customerId = customerIdOrCpf;
    const digits = customerIdOrCpf.replace(/\D/g, '');

    if (digits.length === 11 || digits.length === 14) {
      const customers = await listCustomers({ cpfCnpj: digits, limit: 1 });
      if (customers.data.length === 0) {
        return ok({ totalAmountCents: 0, totalCount: 0, charges: [] });
      }
      const customer = customers.data[0];
      if (!customer) {
        return ok({ totalAmountCents: 0, totalCount: 0, charges: [] });
      }
      customerId = customer.id;
    }

    const response = await listCharges({
      customer: customerId,
      status: 'OVERDUE',
      limit: 100,
    });

    const charges: Charge[] = response.data.map((raw) => ({
      id: raw.id,
      customerId: raw.customer,
      value: Math.round(raw.value * 100),
      netValue: Math.round(raw.netValue * 100),
      dueDate: raw.dueDate,
      billingType: raw.billingType as Charge['billingType'],
      status: raw.status as Charge['status'],
      description: raw.description,
      invoiceUrl: raw.invoiceUrl,
      bankSlipUrl: raw.bankSlipUrl,
    }));

    const totalAmountCents = charges.reduce((sum, c) => sum + c.value, 0);

    return ok({
      totalAmountCents,
      totalCount: charges.length,
      charges,
    });
  } catch (error) {
    log.error({ error, customerIdOrCpf }, 'Failed to get overdue by client');
    return err(new ExternalApiError('asaas', `Erro ao consultar inadimplencia: ${(error as Error).message}`, undefined, error));
  }
}
