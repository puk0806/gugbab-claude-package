import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useMounted } from './use-mounted';

describe('useMounted', () => {
  it('returns a getter that reports true while the component is mounted', () => {
    const { result } = renderHook(() => useMounted());
    expect(result.current()).toBe(true);
  });

  it('returns false after the component unmounts', () => {
    const { result, unmount } = renderHook(() => useMounted());
    unmount();
    expect(result.current()).toBe(false);
  });

  it('returns a stable getter identity across rerenders', () => {
    const { result, rerender } = renderHook(() => useMounted());
    const first = result.current;
    rerender();
    expect(result.current).toBe(first);
  });
});
