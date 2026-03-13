export interface AsaasCustomerRequest {
  name: string;
  cpfCnpj: string;
  email?: string;
  phone?: string;
  mobilePhone?: string;
  externalReference?: string;
}

export interface AsaasCustomerResponse {
  id: string;
  name: string;
  cpfCnpj: string;
  email?: string;
  phone?: string;
  mobilePhone?: string;
  deleted: boolean;
}

export interface AsaasChargeRequest {
  customer: string;
  billingType: string;
  value: number;
  dueDate: string;
  description?: string;
  externalReference?: string;
}

export interface AsaasChargeResponse {
  id: string;
  customer: string;
  value: number;
  netValue: number;
  billingType: string;
  status: string;
  dueDate: string;
  description?: string;
  invoiceUrl?: string;
  bankSlipUrl?: string;
}

export interface AsaasPixQrCodeResponse {
  encodedImage: string;
  payload: string;
}

export interface AsaasListResponse<T> {
  object: string;
  hasMore: boolean;
  totalCount: number;
  limit: number;
  offset: number;
  data: T[];
}
