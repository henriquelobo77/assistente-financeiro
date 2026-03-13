import { z } from 'zod/v4';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  LOG_LEVEL: z
    .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace'])
    .default('info'),

  EVOLUTION_API_URL: z.url(),
  EVOLUTION_API_KEY: z.string().min(1),
  EVOLUTION_INSTANCE: z.string().min(1),
  EVOLUTION_WEBHOOK_SECRET: z.string().optional(),

  ASAAS_API_URL: z.url(),
  ASAAS_API_KEY: z.string().min(1),

  AIRTABLE_API_KEY: z.string().min(1),
  AIRTABLE_BASE_ID: z.string().min(1),
  AIRTABLE_CLIENTS_TABLE: z.string().default('Clients'),
  AIRTABLE_CONTRACTS_TABLE: z.string().default('Contracts'),

  ALLOWED_OPERATORS: z.string().min(1),

  SESSION_TTL_MINUTES: z.coerce.number().default(30),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const formatted = z.prettifyError(result.error);
    // eslint-disable-next-line no-console
    console.error('Invalid environment variables:\n', formatted);
    process.exit(1);
  }

  return Object.freeze(result.data);
}

export const env = loadEnv();

export function getAllowedOperators(): string[] {
  return env.ALLOWED_OPERATORS.split(',').map((jid) => jid.trim());
}
