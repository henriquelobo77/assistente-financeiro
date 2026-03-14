export var ChargeStatus;
(function (ChargeStatus) {
    ChargeStatus["Pending"] = "PENDING";
    ChargeStatus["Received"] = "RECEIVED";
    ChargeStatus["Confirmed"] = "CONFIRMED";
    ChargeStatus["Overdue"] = "OVERDUE";
    ChargeStatus["Refunded"] = "REFUNDED";
    ChargeStatus["Cancelled"] = "CANCELLED";
})(ChargeStatus || (ChargeStatus = {}));
export var BillingType;
(function (BillingType) {
    BillingType["Boleto"] = "BOLETO";
    BillingType["Pix"] = "PIX";
    BillingType["CreditCard"] = "CREDIT_CARD";
})(BillingType || (BillingType = {}));
//# sourceMappingURL=charge.types.js.map