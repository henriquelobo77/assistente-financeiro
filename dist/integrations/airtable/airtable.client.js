import Airtable from 'airtable';
import { env } from '../../config/env.js';
Airtable.configure({ apiKey: env.AIRTABLE_API_KEY });
const base = Airtable.base(env.AIRTABLE_BASE_ID);
export function getClientsTable() {
    return base(env.AIRTABLE_CLIENTS_TABLE);
}
export function getContractsTable() {
    return base(env.AIRTABLE_CONTRACTS_TABLE);
}
//# sourceMappingURL=airtable.client.js.map