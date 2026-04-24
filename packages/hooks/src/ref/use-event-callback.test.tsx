import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useEventCallback } from './use-event-callback';

describe('useEventCallback', () => {
  it('returns a stable function identity across renders', () => {
    const { result, rerender } = renderHook(({ fn }) => useEventCallback(fn), {
      initialProps: { fn: () => 1 },
    });
    const first = result.current;
    rerender({ fn: () => 2 });
    expect(result.current).toBe(first);
  });

  it('always calls the latest provided callback when invoked', () => {
    const a = vi.fn().mockReturnValue('a');
    const b = vi.fn().mockReturnValue('b');

    const { result, rerender } = renderHook(({ fn }) => useEventCallback(fn), {
      initialProps: { fn: a },
    });

    expect(result.current()).toBe('a');
    expect(a).toHaveBeenCalledTimes(1);

    rerender({ fn: b });

    expect(result.current()).toBe('b');
    expect(a).toHaveBeenCalledTimes(1);
    expect(b).toHaveBeenCalledTimes(1);
  });

  it('forwards arguments to the latest callback', () => {
    const fn = vi.fn((x: number, y: number) => x + y);
    const { result } = renderHook(() => useEventCallback(fn));

    expect(result.current(2, 3)).toBe(5);
    expect(fn).toHaveBeenCalledWith(2, 3);
  });
});
