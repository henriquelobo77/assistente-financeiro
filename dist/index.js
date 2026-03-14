import { env } from './config/env.js';
import { logger } from './shared/logger.js';
import { buildApp } from './server/app.js';
import { registerFlow } from './conversation/router.js';
import { cleanExpiredSessions } from './conversation/session.store.js';
// Import flows
import { mainMenuFlow } from './conversation/flows/main-menu.flow.js';
import { chargeFlow } from './conversation/flows/charge.flow.js';
import { clientFlow } from './conversation/flows/client.flow.js';
import { contractFlow } from './conversation/flows/contract.flow.js';
import { overdueFlow } from './conversation/flows/overdue.flow.js';
async function main() {
    // Register all conversation flows
    registerFlow(mainMenuFlow);
    registerFlow(chargeFlow);
    registerFlow(clientFlow);
    registerFlow(contractFlow);
    registerFlow(overdueFlow);
    // Build and start HTTP server
    const app = await buildApp();
    await app.listen({ port: env.PORT, host: '0.0.0.0' });
    logger.info({ port: env.PORT, env: env.NODE_ENV }, 'Server started');
    // Periodic session cleanup (every 5 minutes)
    const cleanupInterval = setInterval(cleanExpiredSessions, 5 * 60 * 1000);
    // Graceful shutdown
    const shutdown = async (signal) => {
        logger.info({ signal }, 'Shutting down');
        clearInterval(cleanupInterval);
        await app.close();
        process.exit(0);
    };
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
}
main().catch((error) => {
    logger.fatal({ error }, 'Failed to start');
    process.exit(1);
});
//# sourceMappingURL=index.js.map