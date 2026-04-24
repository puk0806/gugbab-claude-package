export interface TruncateOptions {
  /** Maximum total length including the suffix. */
  length: number;
  /** String appended when truncation happens. Default: "…". */
  suffix?: string;
}

export function truncate(input: string, options: TruncateOptions): string {
  const { length, suffix = '…' } = options;
  if (input.length <= length) return input;
  const sliceLength = Math.max(0, length - suffix.length);
  return input.slice(0, sliceLength) + suffix;
}
