import { evolutionClient, instanceName } from './evolution.client.js';
import { createChildLogger } from '../shared/logger.js';
import { withRetry } from '../shared/retry.js';
const log = createChildLogger('message-sender');
export async function sendText(jid, text) {
    await withRetry(async () => {
        await evolutionClient.post(`/message/sendText/${instanceName}`, {
            number: jid,
            text,
        });
    }, 'evolution.sendText');
    log.debug({ jid }, 'Sent text message');
}
export async function sendList(jid, title, description, buttonText, sections) {
    await withRetry(async () => {
        await evolutionClient.post(`/message/sendList/${instanceName}`, {
            number: jid,
            title,
            description,
            buttonText,
            sections,
        });
    }, 'evolution.sendList');
    log.debug({ jid, title }, 'Sent list message');
}
export async function sendButtons(jid, text, buttons) {
    await withRetry(async () => {
        await evolutionClient.post(`/message/sendButtons/${instanceName}`, {
            number: jid,
            title: text,
            buttons,
        });
    }, 'evolution.sendButtons');
    log.debug({ jid }, 'Sent buttons message');
}
//# sourceMappingURL=message.sender.js.map