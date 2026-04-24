import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useThrottledCallback } from './use-throttled-callback';

describe('useThrottledCallback', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns a stable callback identity across renders', () => {
    const fn = vi.fn();
    const { result, rerender } = renderHook(() => useThrottledCallback(fn, 100));
    const first = result.current;
    rerender();
    expect(result.current).toBe(first);
  });

  it('invokes immediately on leading edge and then suppresses until the wait elapses', () => {
    const fn = vi.fn();
    const { result } = renderHook(() => useThrottledCallback(fn, 100));

    act(() => {
      result.current('a');
    });
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenLastCalledWith('a');

    act(() => {
      result.current('b');
      result.current('c');
    });
    expect(fn).toHaveBeenCalledTimes(1);

    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenLastCalledWith('c');
  });

  it('uses the latest callback when the trailing invocation fires', () => {
    const first = vi.fn();
    const second = vi.fn();
    const { result, rerender } = renderHook(({ cb }) => useThrottledCallback(cb, 100), {
      initialProps: { cb: first },
    });

    act(() => {
      result.current('x');
      result.current('y');
    });

    rerender({ cb: second });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(first).toHaveBeenCalledTimes(1);
    expect(first).toHaveBeenCalledWith('x');
    expect(second).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledWith('y');
  });
});
