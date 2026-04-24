import { describe, expect, it } from 'vitest';
import { formatNumber } from './format-number';

describe('formatNumber', () => {
  it('formats with thousand separators in en-US by default-ish', () => {
    expect(formatNumber(1234567, { locale: 'en-US' })).toBe('1,234,567');
  });

  it('formats with Korean locale', () => {
    expect(formatNumber(1234567, { locale: 'ko-KR' })).toBe('1,234,567');
  });

  it('respects maximumFractionDigits', () => {
    expect(formatNumber(1.23456, { locale: 'en-US', maximumFractionDigits: 2 })).toBe('1.23');
  });

  it('passes through to Intl.NumberFormat for currency style', () => {
    expect(
      formatNumber(1234.5, {
        locale: 'en-US',
        style: 'currency',
        currency: 'USD',
      }),
    ).toBe('$1,234.50');
  });
});
