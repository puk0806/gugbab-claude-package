// biome-ignore lint/suspicious/noExplicitAny: generic function wrapper requires any[]
type AnyFn = (...args: any[]) => void;

export interface ThrottledFunction<F extends AnyFn> {
  (...args: Parameters<F>): void;
  cancel(): void;
}

/**
 * Leading-edge throttle: invokes immediately, then ignores further calls for
 * `wait` ms. If calls arrive during the cool-down, the last one runs on the
 * trailing edge.
 */
export function throttle<F extends AnyFn>(fn: F, wait: number): ThrottledFunction<F> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let lastArgs: Parameters<F> | undefined;
  let trailingScheduled = false;

  const scheduleTrailing = () => {
    timer = setTimeout(() => {
      timer = undefined;
      if (trailingScheduled && lastArgs !== undefined) {
        const args = lastArgs;
        lastArgs = undefined;
        trailingScheduled = false;
        fn(...args);
        scheduleTrailing();
      } else {
        trailingScheduled = false;
      }
    }, wait);
  };

  const throttled = ((...args: Parameters<F>) => {
    if (timer === undefined) {
      fn(...args);
      scheduleTrailing();
    } else {
      lastArgs = args;
      trailingScheduled = true;
    }
  }) as ThrottledFunction<F>;

  throttled.cancel = () => {
    if (timer !== undefined) {
      clearTimeout(timer);
      timer = undefined;
    }
    lastArgs = undefined;
    trailingScheduled = false;
  };

  return throttled;
}
