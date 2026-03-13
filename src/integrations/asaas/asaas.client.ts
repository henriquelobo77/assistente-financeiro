import axios, { type AxiosInstance, type AxiosError } from 'axios';
import { env } from '../../config/env.js';
import { createChildLogger } from '../../shared/logger.js';
import { ExternalApiError } from '../../shared/errors.js';

const log = createChildLogger('asaas-client');

function isRetryable(error: AxiosError): boolean {
  const status = error.response?.status;
  if (!status) return true;
  return status === 429 || status >= 500;
}

export function createAsaasClient(): AxiosInstance {
  const client = axios.create({
    baseURL: env.ASAAS_API_URL,
    timeout: 30000,
    headers: {
      access_token: env.ASAAS_API_KEY,
      'Content-Type': 'application/json',
    },
  });

  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      const status = error.response?.status;
      const data = error.response?.data;

      log.error(
        { status, url: error.config?.url, method: error.config?.method, data },
        'ASAAS API error',
      );

      if (!isRetryable(error)) {
        throw new ExternalApiError(
          'asaas',
          `ASAAS API error: ${status} - ${error.message}`,
          status,
          error,
        );
      }

      throw error;
    },
  );

  return client;
}

export const asaasClient = createAsaasClient();
