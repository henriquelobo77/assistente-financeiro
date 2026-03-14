import Fastify from 'fastify';
import helmet from '@fastify/helmet';
import { healthRoutes } from './routes/health.route.js';
import { webhookRoutes } from './routes/webhook.route.js';
import { logger } from '../shared/logger.js';
export async function buildApp() {
    const app = Fastify({
        logger: false, // We use our own pino instance
    });
    await app.register(helmet);
    await app.register(healthRoutes);
    await app.register(webhookRoutes);
    app.setErrorHandler((error, _request, reply) => {
        logger.error({ error: error.message, stack: error.stack }, 'Unhandled route error');
        return reply.status(500).send({ error: 'Internal server error' });
    });
    return app;
}
//# sourceMappingURL=app.js.map