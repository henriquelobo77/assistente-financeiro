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
    return getSet().has(jid);
}
//# sourceMappingURL=operator.guard.js.map