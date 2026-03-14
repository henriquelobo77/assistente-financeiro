import { type MessageIn } from '../types/message.types.js';
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
export declare function parseTelegramUpdate(update: TelegramUpdate): MessageIn | null;
//# sourceMappingURL=message.parser.d.ts.map