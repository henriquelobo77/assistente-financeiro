import type { ListSection } from '../types/message.types.js';
export declare function sendText(jid: string, text: string): Promise<void>;
export declare function sendList(jid: string, title: string, description: string, _buttonText: string, sections: ListSection[]): Promise<void>;
export declare function sendButtons(jid: string, text: string, buttons: Array<{
    buttonId: string;
    buttonText: {
        displayText: string;
    };
}>): Promise<void>;
//# sourceMappingURL=message.sender.d.ts.map