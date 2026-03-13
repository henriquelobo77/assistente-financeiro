import axios, { type AxiosInstance } from 'axios';
import { env } from '../config/env.js';
import { createChildLogger } from '../shared/logger.js';

const log = createChildLogger('evolution-client');

function createEvolutionClient(): AxiosInstance {
  const client = axios.create({
    baseURL: env.EVOLUTION_API_URL,
    timeout: 15000,
    headers: {
      apikey: env.EVOLUTION_API_KEY,
      'Content-Type': 'application/json',
    },
  });

  client.interceptors.response.use(
    (response) => response,
    (error) => {
      log.error(
        {
          status: error.response?.status,
          url: error.config?.url,
          data: error.response?.data,
        },
        'Evolution API error',
      );
      throw error;
    },
  );

  return client;
}

export const evolutionClient = createEvolutionClient();
export const instanceName = env.EVOLUTION_INSTANCE;
