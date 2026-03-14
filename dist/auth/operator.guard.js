import { getAllowedOperators } from '../config/env.js';
import { createChildLogger } from '../shared/logger.js';
const log = createChildLogger('operator-guard');
let allowedSet = null;
function getSet() {
    if (!allowedSet) {
        allowedSet = new Set(getAllowedOperators());
        log.info({ count: allowedSet.size }, 'Loaded allowed operators');
    }
    return allowedSet;
}
export function isOperatorAllowed(jid) {
    const set = getSet();
    // Direct match (works for both WhatsApp JIDs and Telegram chat IDs)
    if (set.has(jid))
        return true;
    // Also try matching without WhatsApp suffix for backwards compatibility
    // e.g. if ALLOWED_OPERATORS has "5511999998888" and jid is "5511999998888@s.whatsapp.net"
    for (const allowed of set) {
        if (jid.startsWith(allowed) || allowed.startsWith(jid))
            return true;
    }
    return false;
}
//# sourceMappingURL=operator.guard.js.map