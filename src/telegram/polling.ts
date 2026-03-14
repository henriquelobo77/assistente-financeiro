import { telegramClient } from './telegram.client.js';
import { parseTelegramUpdate, type TelegramUpdate } from './message.parser.js';
import { handleIncomingMessage } from '../conversation/router.js';
import { createChildLogger } from '../shared/logger.js';

const log = createChildLogger('telegram-polling');

let running = false;
let offset = 0;

export function startPolling(): void {
  if (running) return;
  running = true;
  log.info('Telegram long-polling started');
  poll();
}

export function stopPolling(): void {
  running = false;
  log.info('Telegram long-polling stopped');
}

async function poll(): Promise<void> {
  while (running) {
    try {
      const response = await telegramClient.get<{ ok: boolean; result: TelegramUpdate[] }>(
        'getUpdates',
        {
          params: {
            offset,
            timeout: 30,
          },
          timeout: 35000,
        },
      );

      const updates = response.data.result;

      for (const update of updates) {
        offset = update.update_id + 1;

        const message = parseTelegramUpdate(update);
        if (message) {
          try {
            await handleIncomingMessage(message);
          } catch (error) {
            log.error({ error, updateId: update.update_id }, 'Error handling Telegram message');
          }
        }
      }
    } catch (error) {
      log.error({ error }, 'Error fetching Telegram updates');
      // Wait a bit before retrying on error
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }
}
