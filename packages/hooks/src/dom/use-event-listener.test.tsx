import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useEventListener } from './use-event-listener';

describe('useEventListener', () => {
  it('attaches a listener to window by default and calls the handler on event', () => {
    const handler = vi.fn();
    renderHook(() => useEventListener('click', handler));

    act(() => {
      window.dispatchEvent(new Event('click'));
    });

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('removes the listener when the component unmounts', () => {
    const handler = vi.fn();
    const { unmount } = renderHook(() => useEventListener('click', handler));

    unmount();

    act(() => {
      window.dispatchEvent(new Event('click'));
    });

    expect(handler).not.toHaveBeenCalled();
  });

  it('attaches to a provided target element via ref', () => {
    const handler = vi.fn();
    const el = document.createElement('div');
    document.body.appendChild(el);
    const ref = { current: el };

    renderHook(() => useEventListener('click', handler, ref));

    act(() => {
      el.dispatchEvent(new Event('click'));
    });
    expect(handler).toHaveBeenCalledTimes(1);

    act(() => {
      window.dispatchEvent(new Event('click'));
    });
    expect(handler).toHaveBeenCalledTimes(1);

    document.body.removeChild(el);
  });

  it('does not re-attach when the handler prop changes (stable subscription)', () => {
    const addSpy = vi.spyOn(window, 'addEventListener');
    const firstHandler = vi.fn();
    const secondHandler = vi.fn();

    const { rerender } = renderHook(({ h }) => useEventListener('keydown', h), {
      initialProps: { h: firstHandler },
    });

    const initialCalls = addSpy.mock.calls.filter((c) => c[0] === 'keydown').length;

    rerender({ h: secondHandler });

    const afterCalls = addSpy.mock.calls.filter((c) => c[0] === 'keydown').length;
    expect(afterCalls).toBe(initialCalls);

    act(() => {
      window.dispatchEvent(new Event('keydown'));
    });

    expect(firstHandler).not.toHaveBeenCalled();
    expect(secondHandler).toHaveBeenCalledTimes(1);

    addSpy.mockRestore();
  });
});
