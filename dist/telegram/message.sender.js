import { telegramClient } from './telegram.client.js';
import { createChildLogger } from '../shared/logger.js';
import { withRetry } from '../shared/retry.js';
const log = createChildLogger('telegram-message-sender');
export async function sendText(jid, text) {
    await withRetry(async () => {
        await telegramClient.post('sendMessage', {
            chat_id: jid,
            text,
            parse_mode: 'Markdown',
        });
    }, 'telegram.sendText');
    log.debug({ jid }, 'Sent text message');
}
export async function sendList(jid, title, description, _buttonText, sections) {
    let text = `*${title}*\n${description}\n`;
    for (const section of sections) {
        if (section.title) {
            text += `\n*${section.title}*\n`;
        }
        for (let i = 0; i < section.rows.length; i++) {
            const row = section.rows[i];
            text += `${i + 1}. ${row.title}`;
            if (row.description) {
                text += ` - ${row.description}`;
            }
            text += '\n';
        }
    }
    await withRetry(async () => {
        await telegramClient.post('sendMessage', {
            chat_id: jid,
            text,
            parse_mode: 'Markdown',
        });
    }, 'telegram.sendList');
    log.debug({ jid, title }, 'Sent list message');
}
export async function sendButtons(jid, text, buttons) {
    let formatted = text + '\n';
    for (let i = 0; i < buttons.length; i++) {
        const btn = buttons[i];
        formatted += `\n${i + 1}. ${btn.buttonText.displayText}`;
    }
    await withRetry(async () => {
        await telegramClient.post('sendMessage', {
            chat_id: jid,
            text: formatted,
            parse_mode: 'Markdown',
        });
    }, 'telegram.sendButtons');
    log.debug({ jid }, 'Sent buttons message');
}
//# sourceMappingURL=message.sender.js.map