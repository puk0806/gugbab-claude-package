const BINARY_UNITS = ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB'] as const;
const DECIMAL_UNITS = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB'] as const;

export interface FormatBytesOptions {
  /** Number of fraction digits to display. Default: 1. */
  fractionDigits?: number;
  /**
   * Binary (1024) or decimal (1000) base.
   * - `binary` (default) uses KiB/MiB/GiB.
   * - `decimal` uses KB/MB/GB.
   */
  base?: 'binary' | 'decimal';
}

export function formatBytes(bytes: number, options: FormatBytesOptions = {}): string {
  if (!Number.isFinite(bytes)) {
    throw new RangeError(`formatBytes expects a finite number, received ${String(bytes)}`);
  }
  const { fractionDigits = 1, base = 'binary' } = options;
  const step = base === 'binary' ? 1024 : 1000;
  const units = base === 'binary' ? BINARY_UNITS : DECIMAL_UNITS;

  const sign = bytes < 0 ? '-' : '';
  let abs = Math.abs(bytes);
  let unitIndex = 0;
  while (abs >= step && unitIndex < units.length - 1) {
    abs /= step;
    unitIndex += 1;
  }
  const displayDigits = unitIndex === 0 ? 0 : fractionDigits;
  return `${sign}${abs.toFixed(displayDigits)} ${units[unitIndex]}`;
}
