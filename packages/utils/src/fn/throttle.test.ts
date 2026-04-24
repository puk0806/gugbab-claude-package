import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { throttle } from './throttle';

describe('throttle', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('invokes on the leading edge immediately', () => {
    const spy = vi.fn();
    const throttled = throttle(spy, 100);

    throttled('a');
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith('a');
  });

  it('ignores intermediate calls during cooldown', () => {
    const spy = vi.fn();
    const throttled = throttle(spy, 100);

    throttled('a');
    throttled('b');
    throttled('c');

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('fires trailing call with the last arguments after cooldown', () => {
    const spy = vi.fn();
    const throttled = throttle(spy, 100);

    throttled('a');
    throttled('b');
    throttled('c');

    vi.advanceTimersByTime(100);
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy).toHaveBeenNthCalledWith(2, 'c');
  });

  it('does not fire trailing when no calls during cooldown', () => {
    const spy = vi.fn();
    const throttled = throttle(spy, 100);

    throttled('a');
    vi.advanceTimersByTime(100);

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('cancel() clears pending trailing invocation', () => {
    const spy = vi.fn();
    const throttled = throttle(spy, 100);

    throttled('a');
    throttled('b');
    throttled.cancel();
    vi.advanceTimersByTime(100);

    expect(spy).toHaveBeenCalledTimes(1);
  });
});
