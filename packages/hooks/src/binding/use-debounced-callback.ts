import { type DebouncedFunction, debounce } from '@gugbab/utils';
import { useEffect, useMemo } from 'react';
import { useLatestRef } from '../ref/use-latest-ref';

/**
 * Wraps `@gugbab/utils/debounce` with React ergonomics: the returned
 * function has a stable identity across renders (so effects and memoized
 * children aren't churned), always calls the latest `fn`, and cancels the
 * pending invocation on unmount.
 */
export function useDebouncedCallback<TArgs extends unknown[]>(
  fn: (...args: TArgs) => void,
  wait: number,
): DebouncedFunction<(...args: TArgs) => void> {
  const fnRef = useLatestRef(fn);

  const debounced = useMemo(
    () => debounce((...args: TArgs) => fnRef.current(...args), wait),
    [wait, fnRef],
  );

  useEffect(() => () => debounced.cancel(), [debounced]);

  return debounced;
}
