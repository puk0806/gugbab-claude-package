import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useIsomorphicLayoutEffect } from './use-isomorphic-layout-effect';

describe('useIsomorphicLayoutEffect', () => {
  it('runs effect synchronously after the first render in a DOM environment', () => {
    const order: string[] = [];

    function Comp() {
      useIsomorphicLayoutEffect(() => {
        order.push('effect');
      });
      order.push('render');
      return null;
    }

    render(<Comp />);

    expect(order).toEqual(['render', 'effect']);
  });

  it('invokes the cleanup function when the component unmounts', () => {
    const cleanup = vi.fn();

    function Comp() {
      useIsomorphicLayoutEffect(() => cleanup);
      return null;
    }

    const { unmount } = render(<Comp />);
    expect(cleanup).not.toHaveBeenCalled();

    unmount();
    expect(cleanup).toHaveBeenCalledTimes(1);
  });

  it('respects the dependency array and skips effects when deps are unchanged', () => {
    const effect = vi.fn();

    function Comp({ dep }: { dep: number }) {
      useIsomorphicLayoutEffect(() => {
        effect(dep);
      }, [dep]);
      return null;
    }

    const { rerender } = render(<Comp dep={1} />);
    expect(effect).toHaveBeenCalledTimes(1);

    rerender(<Comp dep={1} />);
    expect(effect).toHaveBeenCalledTimes(1);

    rerender(<Comp dep={2} />);
    expect(effect).toHaveBeenCalledTimes(2);
  });
});
