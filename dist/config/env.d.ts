import { z } from 'zod/v4';
declare const envSchema: z.ZodObject<{
    NODE_ENV: z.ZodDefault<z.ZodEnum<{
        development: "development";
        production: "production";
        test: "test";
    }>>;
    PORT: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    LOG_LEVEL: z.ZodDefault<z.ZodEnum<{
        fatal: "fatal";
        error: "error";
        warn: "warn";
        info: "info";
        debug: "debug";
        trace: "trace";
    }>>;
    EVOLUTION_API_URL: z.ZodOptional<z.ZodURL>;
    EVOLUTION_API_KEY: z.ZodOptional<z.ZodString>;
    EVOLUTION_INSTANCE: z.ZodOptional<z.ZodString>;
    EVOLUTION_WEBHOOK_SECRET: z.ZodOptional<z.ZodString>;
    TELEGRAM_BOT_TOKEN: z.ZodString;
    ASAAS_API_URL: z.ZodURL;
    ASAAS_API_KEY: z.ZodString;
    AIRTABLE_API_KEY: z.ZodString;
    AIRTABLE_BASE_ID: z.ZodString;
    AIRTABLE_CLIENTS_TABLE: z.ZodDefault<z.ZodString>;
    AIRTABLE_CONTRACTS_TABLE: z.ZodDefault<z.ZodString>;
    ALLOWED_OPERATORS: z.ZodString;
    SESSION_TTL_MINUTES: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
export type Env = z.infer<typeof envSchema>;
export declare const env: {
    NODE_ENV: "development" | "production" | "test";
    PORT: number;
    LOG_LEVEL: "fatal" | "error" | "warn" | "info" | "debug" | "trace";
    TELEGRAM_BOT_TOKEN: string;
    ASAAS_API_URL: string;
    ASAAS_API_KEY: string;
    AIRTABLE_API_KEY: string;
    AIRTABLE_BASE_ID: string;
    AIRTABLE_CLIENTS_TABLE: string;
    AIRTABLE_CONTRACTS_TABLE: string;
    ALLOWED_OPERATORS: string;
    SESSION_TTL_MINUTES: number;
    EVOLUTION_API_URL?: string | undefined;
    EVOLUTION_API_KEY?: string | undefined;
    EVOLUTION_INSTANCE?: string | undefined;
    EVOLUTION_WEBHOOK_SECRET?: string | undefined;
};
export declare function getAllowedOperators(): string[];
export {};
//# sourceMappingURL=env.d.ts.map