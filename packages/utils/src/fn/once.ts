// biome-ignore lint/suspicious/noExplicitAny: generic function wrapper requires any[]
type AnyFn = (...args: any[]) => unknown;

export function once<F extends AnyFn>(fn: F): (...args: Parameters<F>) => ReturnType<F> {
  let called = false;
  let cached: ReturnType<F>;
  return (...args: Parameters<F>) => {
    if (!called) {
      called = true;
      cached = fn(...args) as ReturnType<F>;
    }
    return cached;
  };
}
