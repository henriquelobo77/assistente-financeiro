import axios, { type AxiosInstance } from 'axios';
import { env } from '../config/env.js';
import { createChildLogger } from '../shared/logger.js';

const log = createChildLogger('telegram-client');

function createTelegramClient(): AxiosInstance {
  const client = axios.create({
    baseURL: `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/`,
    timeout: 35000,
    headers: {
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
        'Telegram API error',
      );
      throw error;
    },
  );

  return client;
}

export const telegramClient = createTelegramClient();
