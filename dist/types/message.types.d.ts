export declare enum MessageKind {
    Text = "text",
    ButtonReply = "button_reply",
    ListReply = "list_reply"
}
export interface MessageIn {
    jid: string;
    text: string;
    kind: MessageKind;
    timestamp: number;
    rawPayload: unknown;
}
export interface ListSection {
    title: string;
    rows: Array<{
        title: string;
        description?: string;
        rowId: string;
    }>;
}
//# sourceMappingURL=message.types.d.ts.map