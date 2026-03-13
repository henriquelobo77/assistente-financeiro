export interface AirtableClientRecord {
  id: string;
  fields: {
    Name: string;
    CpfCnpj: string;
    Email?: string;
    Phone?: string;
    AsaasId: string;
    CreatedAt?: string;
  };
}

export interface AirtableContractRecord {
  id: string;
  fields: {
    ClientAsaasId: string;
    ClientName: string;
    Value: number;
    StartDate: string;
    EndDate: string;
    Recurrence: string;
    Status: string;
    Description?: string;
    CreatedAt?: string;
  };
}
