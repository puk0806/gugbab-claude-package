import { useEffect, useState } from 'react';

/**
 * Returns a debounced copy of `value` that only updates `wait` ms after the
 * last input change. Useful for search inputs driving expensive derivations.
 */
export function useDebouncedValue<T>(value: T, wait: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), wait);
    return () => clearTimeout(timer);
  }, [value, wait]);

  return debounced;
}
