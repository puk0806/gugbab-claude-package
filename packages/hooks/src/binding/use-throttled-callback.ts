import { type ThrottledFunction, throttle } from '@gugbab-ui/utils';
import { useEffect, useMemo } from 'react';
import { useLatestRef } from '../ref/use-latest-ref';

/**
 * Wraps `@gugbab-ui/utils/throttle` with React ergonomics: stable identity,
 * always-latest callback, unmount-time cancel.
 */
export function useThrottledCallback<TArgs extends unknown[]>(
  fn: (...args: TArgs) => void,
  wait: number,
): ThrottledFunction<(...args: TArgs) => void> {
  const fnRef = useLatestRef(fn);

  const throttled = useMemo(
    () => throttle((...args: TArgs) => fnRef.current(...args), wait),
    [wait, fnRef],
  );

  useEffect(() => () => throttled.cancel(), [throttled]);

  return throttled;
}
