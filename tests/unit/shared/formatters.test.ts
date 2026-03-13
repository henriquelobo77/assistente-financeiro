import { describe, it, expect } from 'vitest';
import { parseBRL, formatBRL, parseDate, formatDate, isValidCpfCnpj, cleanCpfCnpj, formatCpfCnpj } from '../../../src/shared/formatters.js';

describe('formatBRL', () => {
  it('formats cents to BRL currency string', () => {
    expect(formatBRL(15000)).toContain('150');
  });

  it('handles zero', () => {
    expect(formatBRL(0)).toContain('0');
  });
});

describe('parseBRL', () => {
  it('parses "150,00" to 15000 cents', () => {
    expect(parseBRL('150,00')).toBe(15000);
  });

  it('parses "1.500,50" to 150050 cents', () => {
    expect(parseBRL('1.500,50')).toBe(150050);
  });

  it('parses "R$ 200,00"', () => {
    expect(parseBRL('R$ 200,00')).toBe(20000);
  });

  it('returns null for invalid input', () => {
    expect(parseBRL('abc')).toBeNull();
  });

  it('returns null for zero', () => {
    expect(parseBRL('0')).toBeNull();
  });

  it('returns null for negative', () => {
    expect(parseBRL('-100')).toBeNull();
  });
});

describe('parseDate', () => {
  it('parses DD/MM/YYYY to ISO', () => {
    expect(parseDate('15/04/2026')).toBe('2026-04-15');
  });

  it('returns null for invalid format', () => {
    expect(parseDate('2026-04-15')).toBeNull();
  });

  it('returns null for invalid date', () => {
    expect(parseDate('31/02/2026')).toBeNull();
  });
});

describe('formatDate', () => {
  it('formats ISO to DD/MM/YYYY', () => {
    expect(formatDate('2026-04-15')).toBe('15/04/2026');
  });
});

describe('isValidCpfCnpj', () => {
  it('validates CPF with 11 digits', () => {
    expect(isValidCpfCnpj('12345678901')).toBe(true);
  });

  it('validates CNPJ with 14 digits', () => {
    expect(isValidCpfCnpj('12345678000199')).toBe(true);
  });

  it('rejects invalid length', () => {
    expect(isValidCpfCnpj('12345')).toBe(false);
  });

  it('handles formatted input', () => {
    expect(isValidCpfCnpj('123.456.789-01')).toBe(true);
  });
});

describe('cleanCpfCnpj', () => {
  it('removes non-digits', () => {
    expect(cleanCpfCnpj('123.456.789-01')).toBe('12345678901');
  });
});

describe('formatCpfCnpj', () => {
  it('formats CPF', () => {
    expect(formatCpfCnpj('12345678901')).toBe('123.456.789-01');
  });

  it('formats CNPJ', () => {
    expect(formatCpfCnpj('12345678000199')).toBe('12.345.678/0001-99');
  });
});
