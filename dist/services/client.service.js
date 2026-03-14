import { ok, err } from '../shared/result.js';
import { ExternalApiError } from '../shared/errors.js';
import { createChildLogger } from '../shared/logger.js';
import { createCustomer, getCustomerById, listCustomers } from '../integrations/asaas/asaas.customer.js';
import { createClientRecord, findClientByAsaasId } from '../integrations/airtable/airtable.clients.js';
import { cleanCpfCnpj } from '../shared/formatters.js';
const log = createChildLogger('client-service');
export async function createClient(input) {
    log.info({ name: input.name, cpfCnpj: input.cpfCnpj }, 'Creating client');
    try {
        // 1. Create customer in ASAAS
        const asaasCustomer = await createCustomer({
            name: input.name,
            cpfCnpj: cleanCpfCnpj(input.cpfCnpj),
            email: input.email,
            mobilePhone: input.phone,
        });
        log.info({ asaasId: asaasCustomer.id }, 'Customer created in ASAAS');
        // 2. Create record in Airtable with ASAAS ID
        let airtableId;
        try {
            airtableId = await createClientRecord({
                Name: input.name,
                CpfCnpj: cleanCpfCnpj(input.cpfCnpj),
                Email: input.email,
                Phone: input.phone,
                AsaasId: asaasCustomer.id,
                CreatedAt: new Date().toISOString(),
            });
            log.info({ airtableId }, 'Client record created in Airtable');
        }
        catch (airtableError) {
            // Log but don't fail - ASAAS is source of truth
            log.error({ error: airtableError, asaasId: asaasCustomer.id }, 'Failed to create Airtable record, ASAAS customer was created');
        }
        // 3. Return unified Client
        return ok({
            asaasId: asaasCustomer.id,
            airtableId,
            name: asaasCustomer.name,
            cpfCnpj: asaasCustomer.cpfCnpj,
            email: asaasCustomer.email,
            phone: asaasCustomer.mobilePhone,
        });
    }
    catch (error) {
        log.error({ error, input: { name: input.name } }, 'Failed to create client');
        return err(new ExternalApiError('asaas', `Erro ao criar cliente: ${error.message}`, undefined, error));
    }
}
export async function searchClients(query) {
    log.info({ query }, 'Searching clients');
    try {
        const cleanedQuery = cleanCpfCnpj(query);
        const isCpfCnpj = cleanedQuery.length === 11 || cleanedQuery.length === 14;
        const params = isCpfCnpj ? { cpfCnpj: cleanedQuery } : { name: query };
        const response = await listCustomers({ ...params, limit: 10 });
        const clients = await Promise.all(response.data
            .filter((c) => !c.deleted)
            .map(async (c) => {
            // Try to enrich with Airtable data
            let airtableId;
            try {
                const airtableRecord = await findClientByAsaasId(c.id);
                airtableId = airtableRecord?.id;
            }
            catch {
                // Ignore Airtable errors during search enrichment
            }
            return {
                asaasId: c.id,
                airtableId,
                name: c.name,
                cpfCnpj: c.cpfCnpj,
                email: c.email,
                phone: c.mobilePhone,
            };
        }));
        return ok(clients);
    }
    catch (error) {
        log.error({ error, query }, 'Failed to search clients');
        return err(new ExternalApiError('asaas', `Erro ao buscar clientes: ${error.message}`, undefined, error));
    }
}
export async function getClientByAsaasId(asaasId) {
    log.info({ asaasId }, 'Getting client');
    try {
        const customer = await getCustomerById(asaasId);
        const airtableRecord = await findClientByAsaasId(asaasId).catch(() => null);
        return ok({
            asaasId: customer.id,
            airtableId: airtableRecord?.id,
            name: customer.name,
            cpfCnpj: customer.cpfCnpj,
            email: customer.email,
            phone: customer.mobilePhone,
        });
    }
    catch (error) {
        log.error({ error, asaasId }, 'Failed to get client');
        return err(new ExternalApiError('asaas', `Erro ao buscar cliente: ${error.message}`, undefined, error));
    }
}
//# sourceMappingURL=client.service.js.map