export interface FormatNumberOptions extends Intl.NumberFormatOptions {
  locale?: string | string[];
}

export function formatNumber(value: number, options: FormatNumberOptions = {}): string {
  const { locale, ...rest } = options;
  return new Intl.NumberFormat(locale, rest).format(value);
}
