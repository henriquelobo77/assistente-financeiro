import { MessageKind } from '../types/message.types.js';
import { createChildLogger } from '../shared/logger.js';
const log = createChildLogger('message-parser');
export function parseEvolutionWebhook(payload) {
    try {
        const p = payload;
        if (p.event !== 'messages.upsert')
            return null;
        if (p.data.key.fromMe)
            return null;
        const msg = p.data.message;
        if (!msg)
            return null;
        let text = '';
        let kind = MessageKind.Text;
        if (msg.buttonsResponseMessage) {
            text = msg.buttonsResponseMessage.selectedButtonId;
            kind = MessageKind.ButtonReply;
        }
        else if (msg.listResponseMessage) {
            text = msg.listResponseMessage.singleSelectReply.selectedRowId;
            kind = MessageKind.ListReply;
        }
        else if (msg.conversation) {
            text = msg.conversation;
        }
        else if (msg.extendedTextMessage?.text) {
            text = msg.extendedTextMessage.text;
        }
        if (!text.trim())
            return null;
        return {
            jid: p.data.key.remoteJid,
            text: text.trim(),
            kind,
            timestamp: p.data.messageTimestamp,
            rawPayload: payload,
        };
    }
    catch (error) {
        log.warn({ error, payload }, 'Failed to parse Evolution webhook');
        return null;
    }
}
//# sourceMappingURL=message.parser.js.map