import { MessageKind } from '../types/message.types.js';
import { createChildLogger } from '../shared/logger.js';
const log = createChildLogger('telegram-message-parser');
export function parseTelegramUpdate(update) {
    try {
        const msg = update.message;
        if (!msg)
            return null;
        // Ignore messages from bots
        if (msg.from?.is_bot)
            return null;
        const text = msg.text?.trim();
        if (!text)
            return null;
        return {
            jid: String(msg.chat.id),
            text,
            kind: MessageKind.Text,
            timestamp: msg.date,
            rawPayload: update,
        };
    }
    catch (error) {
        log.warn({ error, update }, 'Failed to parse Telegram update');
        return null;
    }
}
//# sourceMappingURL=message.parser.js.map