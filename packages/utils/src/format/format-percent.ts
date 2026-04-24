import { type FormatNumberOptions, formatNumber } from './format-number';

export function formatPercent(
  ratio: number,
  options: Omit<FormatNumberOptions, 'style'> = {},
): string {
  return formatNumber(ratio, { ...options, style: 'percent' });
}
