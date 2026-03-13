import type { FastifyInstance, FastifyRequest } from 'fastify';
import { parseEvolutionWebhook } from '../../whatsapp/message.parser.js';
import { handleIncomingMessage } from '../../conversation/router.js';
import { createChildLogger } from '../../shared/logger.js';

const log = createChildLogger('webhook-route');

export async function webhookRoutes(app: FastifyInstance) {
  app.post('/webhook/evolution', async (request: FastifyRequest, reply) => {
    const message = parseEvolutionWebhook(request.body);

    if (!message) {
      return reply.status(200).send({ ignored: true });
    }

    log.info({ jid: message.jid, text: message.text, kind: message.kind }, 'Incoming message');

    // Process asynchronously so we don't block the webhook response
    handleIncomingMessage(message).catch((error) => {
      log.error({ error, jid: message.jid }, 'Unhandled error in message processing');
    });

    return reply.status(200).send({ received: true });
  });
}
