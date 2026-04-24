import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useLatestRef } from './use-latest-ref';

describe('useLatestRef', () => {
  it('returns a ref object whose current equals the initial value', () => {
    const { result } = renderHook(() => useLatestRef('a'));
    expect(result.current.current).toBe('a');
  });

  it('updates the ref when the input changes across renders', () => {
    const { result, rerender } = renderHook(({ value }) => useLatestRef(value), {
      initialProps: { value: 1 },
    });

    expect(result.current.current).toBe(1);

    rerender({ value: 2 });
    expect(result.current.current).toBe(2);

    rerender({ value: 3 });
    expect(result.current.current).toBe(3);
  });

  it('returns the same ref object identity across renders', () => {
    const { result, rerender } = renderHook(({ value }) => useLatestRef(value), {
      initialProps: { value: 'x' },
    });
    const first = result.current;
    rerender({ value: 'y' });
    expect(result.current).toBe(first);
  });
});
