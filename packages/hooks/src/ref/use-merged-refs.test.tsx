import { render, renderHook } from '@testing-library/react';
import { useRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { useMergedRefs } from './use-merged-refs';

describe('useMergedRefs', () => {
  it('returns a stable callback identity across renders', () => {
    const refA = { current: null };
    const refB = { current: null };

    const { result, rerender } = renderHook(() => useMergedRefs(refA, refB));
    const first = result.current;
    rerender();
    expect(result.current).toBe(first);
  });

  it('assigns the same node to each callback ref', () => {
    const calls: (HTMLDivElement | null)[] = [];
    const callbackRef = (node: HTMLDivElement | null) => {
      calls.push(node);
    };

    function Comp() {
      const objectRef = useRef<HTMLDivElement>(null);
      const merged = useMergedRefs(objectRef, callbackRef);
      // biome-ignore lint/suspicious/noExplicitAny: attach merged directly to test behavior
      return <div ref={merged as any} data-testid="t" />;
    }

    const { getByTestId } = render(<Comp />);
    const el = getByTestId('t');

    expect(calls[0]).toBe(el);
  });

  it('ignores nullish refs in the list', () => {
    const cb = vi.fn();
    const { result } = renderHook(() => useMergedRefs(null, undefined, cb));
    const node = document.createElement('div');

    result.current(node);
    expect(cb).toHaveBeenCalledWith(node);
  });
});
