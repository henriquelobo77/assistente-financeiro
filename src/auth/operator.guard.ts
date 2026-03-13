import { getAllowedOperators } from '../config/env.js';
import { createChildLogger } from '../shared/logger.js';

const log = createChildLogger('operator-guard');

let allowedSet: Set<string> | null = null;

function getSet(): Set<string> {
  if (!allowedSet) {
    allowedSet = new Set(getAllowedOperators());
    log.info({ count: allowedSet.size }, 'Loaded allowed operators');
  }
  return allowedSet;
}

export function isOperatorAllowed(jid: string): boolean {
  return getSet().has(jid);
}
