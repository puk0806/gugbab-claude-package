// biome-ignore lint/suspicious/noExplicitAny: generic function wrapper requires any[]
type AnyFn = (...args: any[]) => void;

export interface DebouncedFunction<F extends AnyFn> {
  (...args: Parameters<F>): void;
  cancel(): void;
  flush(): void;
}

/**
 * Trailing-edge debounce. The wrapped function is invoked `wait` ms after the
 * last call; earlier pending calls are replaced. `cancel()` drops any pending
 * invocation; `flush()` runs it immediately with the most recent arguments.
 */
export function debounce<F extends AnyFn>(fn: F, wait: number): DebouncedFunction<F> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let lastArgs: Parameters<F> | undefined;

  const invoke = () => {
    if (lastArgs === undefined) return;
    const args = lastArgs;
    lastArgs = undefined;
    timer = undefined;
    fn(...args);
  };

  const debounced = ((...args: Parameters<F>) => {
    lastArgs = args;
    if (timer !== undefined) clearTimeout(timer);
    timer = setTimeout(invoke, wait);
  }) as DebouncedFunction<F>;

  debounced.cancel = () => {
    if (timer !== undefined) {
      clearTimeout(timer);
      timer = undefined;
    }
    lastArgs = undefined;
  };

  debounced.flush = () => {
    if (timer !== undefined) {
      clearTimeout(timer);
      invoke();
    }
  };

  return debounced;
}
