import { useCallback } from 'react';
import { useLatestRef } from './use-latest-ref';

/**
 * Returns a function with stable identity that always calls the latest
 * provided callback. Useful for passing handlers to `useEffect` / `useMemo`
 * deps without causing rerenders.
 *
 * Note: do not call the returned function during render; it is meant for
 * event handlers and effects that run after commit.
 */
export function useEventCallback<TArgs extends unknown[], TReturn>(
  fn: (...args: TArgs) => TReturn,
): (...args: TArgs) => TReturn {
  const ref = useLatestRef(fn);
  return useCallback((...args: TArgs) => ref.current(...args), [ref]);
}
