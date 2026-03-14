import { createChildLogger } from './logger.js';
const log = createChildLogger('retry');
const DEFAULT_OPTIONS = {
    maxAttempts: 3,
    baseDelayMs: 1000,
    maxDelayMs: 10000,
};
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
export async function withRetry(fn, label, options = {}) {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    let lastError;
    for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
        try {
            return await fn();
        }
        catch (error) {
            lastError = error;
            if (opts.retryableCheck && !opts.retryableCheck(error)) {
                throw error;
            }
            if (attempt === opts.maxAttempts) {
                break;
            }
            const delay = Math.min(opts.baseDelayMs * 2 ** (attempt - 1), opts.maxDelayMs);
            log.warn({ attempt, maxAttempts: opts.maxAttempts, delay, label }, 'Retrying after error');
            await sleep(delay);
        }
    }
    throw lastError;
}
//# sourceMappingURL=retry.js.map