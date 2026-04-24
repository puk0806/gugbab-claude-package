import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { debounce } from './debounce';

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('invokes after wait period with the last arguments', () => {
    const spy = vi.fn();
    const debounced = debounce(spy, 100);

    debounced('a');
    debounced('b');
    debounced('c');

    vi.advanceTimersByTime(99);
    expect(spy).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith('c');
  });

  it('subsequent bursts produce additional invocations', () => {
    const spy = vi.fn();
    const debounced = debounce(spy, 100);

    debounced(1);
    vi.advanceTimersByTime(100);
    debounced(2);
    vi.advanceTimersByTime(100);

    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy).toHaveBeenNthCalledWith(1, 1);
    expect(spy).toHaveBeenNthCalledWith(2, 2);
  });

  it('cancel() drops a pending invocation', () => {
    const spy = vi.fn();
    const debounced = debounce(spy, 100);

    debounced('x');
    debounced.cancel();
    vi.advanceTimersByTime(100);

    expect(spy).not.toHaveBeenCalled();
  });

  it('flush() runs the pending invocation immediately', () => {
    const spy = vi.fn();
    const debounced = debounce(spy, 100);

    debounced('y');
    debounced.flush();

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith('y');

    vi.advanceTimersByTime(100);
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
