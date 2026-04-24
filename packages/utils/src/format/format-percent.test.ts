import { describe, expect, it } from 'vitest';
import { formatPercent } from './format-percent';

describe('formatPercent', () => {
  it('treats input as ratio and appends percent sign', () => {
    expect(formatPercent(0.5, { locale: 'en-US' })).toBe('50%');
  });

  it('respects fraction digit options', () => {
    expect(
      formatPercent(0.1234, {
        locale: 'en-US',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    ).toBe('12.34%');
  });

  it('works with ko-KR locale', () => {
    expect(formatPercent(0.75, { locale: 'ko-KR' })).toBe('75%');
  });
});
