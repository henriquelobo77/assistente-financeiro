import { MessageKind, type MessageIn } from '../types/message.types.js';
import { createChildLogger } from '../shared/logger.js';

const log = createChildLogger('telegram-message-parser');

export interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from?: {
      id: number;
      is_bot: boolean;
      first_name: string;
      username?: string;
    };
    chat: {
      id: number;
      type: string;
    };
    date: number;
    text?: string;
  };
}

export function parseTelegramUpdate(update: TelegramUpdate): MessageIn | null {
  try {
    const msg = update.message;
    if (!msg) return null;

    // Ignore messages from bots
    if (msg.from?.is_bot) return null;

    const text = msg.text?.trim();
    if (!text) return null;

    return {
      jid: String(msg.chat.id),
      text,
      kind: MessageKind.Text,
      timestamp: msg.date,
      rawPayload: update,
    };
  } catch (error) {
    log.warn({ error, update }, 'Failed to parse Telegram update');
    return null;
  }
}
