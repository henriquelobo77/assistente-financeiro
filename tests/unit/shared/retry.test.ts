import { describe, it, expect, vi } from 'vitest';

// Mock env module before importing retry
vi.mock('../../../src/config/env.js', () => ({
  env: {
    NODE_ENV: 'test',
    LOG_LEVEL: 'silent',
    PORT: 3000,
    EVOLUTION_API_URL: 'http://localhost:8080',
    EVOLUTION_API_KEY: 'test',
    EVOLUTION_INSTANCE: 'test',
    ASAAS_API_URL: 'http://localhost',
    ASAAS_API_KEY: 'test',
    AIRTABLE_API_KEY: 'test',
    AIRTABLE_BASE_ID: 'test',
    AIRTABLE_CLIENTS_TABLE: 'Clients',
    AIRTABLE_CONTRACTS_TABLE: 'Contracts',
    ALLOWED_OPERATORS: 'test@s.whatsapp.net',
    SESSION_TTL_MINUTES: 30,
  },
  getAllowedOperators: () => ['test@s.whatsapp.net'],
}));

vi.mock('../../../src/shared/logger.js', () => ({
  createChildLogger: () => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  }),
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    level: 'silent',
  },
}));

const { withRetry } = await import('../../../src/shared/retry.js');

describe('withRetry', () => {
  it('returns value on first success', async () => {
    const fn = vi.fn().mockResolvedValue('ok');
    const result = await withRetry(fn, 'test');
    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('retries on failure then succeeds', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValue('ok');

    const result = await withRetry(fn, 'test', { baseDelayMs: 1, maxDelayMs: 10 });
    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('throws after max attempts', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('always fails'));

    await expect(
      withRetry(fn, 'test', { maxAttempts: 2, baseDelayMs: 1, maxDelayMs: 10 }),
    ).rejects.toThrow('always fails');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('throws immediately if retryableCheck returns false', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('not retryable'));

    await expect(
      withRetry(fn, 'test', {
        baseDelayMs: 1,
        retryableCheck: () => false,
      }),
    ).rejects.toThrow('not retryable');
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
