import { useCallback, useEffect, useRef } from 'react';

/**
 * Returns a stable getter that reports whether the hosting component is
 * currently mounted. Useful for guarding state updates in async callbacks:
 *
 * ```ts
 * const isMounted = useMounted();
 * fetch(url).then((data) => {
 *   if (isMounted()) setData(data);
 * });
 * ```
 */
export function useMounted(): () => boolean {
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return useCallback(() => mountedRef.current, []);
}
