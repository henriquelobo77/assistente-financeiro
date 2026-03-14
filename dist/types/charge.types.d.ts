export declare enum ChargeStatus {
    Pending = "PENDING",
    Received = "RECEIVED",
    Confirmed = "CONFIRMED",
    Overdue = "OVERDUE",
    Refunded = "REFUNDED",
    Cancelled = "CANCELLED"
}
export declare enum BillingType {
    Boleto = "BOLETO",
    Pix = "PIX",
    CreditCard = "CREDIT_CARD"
}
export interface CreateChargeInput {
    customerId: string;
    value: number;
    dueDate: string;
    billingType: BillingType;
    description?: string;
}
export interface Charge {
    id: string;
    customerId: string;
    customerName?: string;
    value: number;
    netValue: number;
    dueDate: string;
    billingType: BillingType;
    status: ChargeStatus;
    invoiceUrl?: string;
    bankSlipUrl?: string;
    pixQrCodeBase64?: string;
    pixCopiaECola?: string;
    description?: string;
}
//# sourceMappingURL=charge.types.d.ts.map