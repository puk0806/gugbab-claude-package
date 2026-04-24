import { describe, expect, it } from 'vitest';
import { formatBytes } from './format-bytes';

describe('formatBytes', () => {
  it('formats bytes below 1 KiB as integer B', () => {
    expect(formatBytes(0)).toBe('0 B');
    expect(formatBytes(512)).toBe('512 B');
    expect(formatBytes(1023)).toBe('1023 B');
  });

  it('uses binary (KiB) base by default', () => {
    expect(formatBytes(1024)).toBe('1.0 KiB');
    expect(formatBytes(1024 * 1024)).toBe('1.0 MiB');
  });

  it('supports decimal base', () => {
    expect(formatBytes(1000, { base: 'decimal' })).toBe('1.0 KB');
    expect(formatBytes(1_500_000, { base: 'decimal' })).toBe('1.5 MB');
  });

  it('respects fractionDigits', () => {
    expect(formatBytes(1536, { fractionDigits: 2 })).toBe('1.50 KiB');
  });

  it('handles negative values', () => {
    expect(formatBytes(-2048)).toBe('-2.0 KiB');
  });

  it('caps at the largest defined unit', () => {
    const huge = 1024 ** 7;
    expect(formatBytes(huge)).toMatch(/EiB$/);
  });

  it('throws for non-finite input', () => {
    expect(() => formatBytes(Number.NaN)).toThrow(RangeError);
    expect(() => formatBytes(Number.POSITIVE_INFINITY)).toThrow(RangeError);
  });
});
