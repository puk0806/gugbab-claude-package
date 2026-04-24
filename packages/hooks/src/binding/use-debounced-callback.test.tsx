import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useDebouncedCallback } from './use-debounced-callback';

describe('useDebouncedCallback', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns a stable callback identity across renders', () => {
    const fn = vi.fn();
    const { result, rerender } = renderHook(() => useDebouncedCallback(fn, 100));
    const first = result.current;
    rerender();
    expect(result.current).toBe(first);
  });

  it('invokes the underlying callback only once after the wait elapses', () => {
    const fn = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(fn, 100));

    act(() => {
      result.current('a');
      result.current('b');
      result.current('c');
    });

    expect(fn).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('c');
  });

  it('calls the latest callback even if the prop changed while waiting', () => {
    const first = vi.fn();
    const second = vi.fn();

    const { result, rerender } = renderHook(({ cb }) => useDebouncedCallback(cb, 100), {
      initialProps: { cb: first },
    });

    act(() => {
      result.current('x');
    });

    rerender({ cb: second });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledWith('x');
  });

  it('cancels pending invocations when the component unmounts', () => {
    const fn = vi.fn();
    const { result, unmount } = renderHook(() => useDebouncedCallback(fn, 100));

    act(() => {
      result.current();
    });

    unmount();

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(fn).not.toHaveBeenCalled();
  });
});
