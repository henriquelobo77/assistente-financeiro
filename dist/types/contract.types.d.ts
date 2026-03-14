export declare enum ContractStatus {
    Active = "active",
    Suspended = "suspended",
    Cancelled = "cancelled",
    Completed = "completed"
}
export declare enum RecurrencePeriod {
    Monthly = "monthly",
    Quarterly = "quarterly",
    Semiannual = "semiannual",
    Annual = "annual"
}
export interface CreateContractInput {
    clientAsaasId: string;
    clientName: string;
    value: number;
    startDate: string;
    endDate: string;
    recurrence: RecurrencePeriod;
    description?: string;
}
export interface Contract {
    airtableId: string;
    clientAsaasId: string;
    clientName: string;
    value: number;
    startDate: string;
    endDate: string;
    recurrence: RecurrencePeriod;
    status: ContractStatus;
    description?: string;
}
//# sourceMappingURL=contract.types.d.ts.map