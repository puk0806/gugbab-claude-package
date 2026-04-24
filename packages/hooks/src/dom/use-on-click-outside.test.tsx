import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useOnClickOutside } from './use-on-click-outside';

function makeRef(el: HTMLElement | null) {
  return { current: el };
}

describe('useOnClickOutside', () => {
  it('invokes the handler when a mousedown fires outside the ref element', () => {
    const inside = document.createElement('div');
    const outside = document.createElement('div');
    document.body.append(inside, outside);

    const handler = vi.fn();
    renderHook(() => useOnClickOutside(makeRef(inside), handler));

    act(() => {
      outside.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    });

    expect(handler).toHaveBeenCalledTimes(1);

    document.body.removeChild(inside);
    document.body.removeChild(outside);
  });

  it('does not invoke the handler when a mousedown fires inside the ref element', () => {
    const inside = document.createElement('div');
    const child = document.createElement('span');
    inside.appendChild(child);
    document.body.appendChild(inside);

    const handler = vi.fn();
    renderHook(() => useOnClickOutside(makeRef(inside), handler));

    act(() => {
      child.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    });

    expect(handler).not.toHaveBeenCalled();

    document.body.removeChild(inside);
  });

  it('is disabled when the enabled flag is false', () => {
    const inside = document.createElement('div');
    const outside = document.createElement('div');
    document.body.append(inside, outside);

    const handler = vi.fn();
    renderHook(() => useOnClickOutside(makeRef(inside), handler, false));

    act(() => {
      outside.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    });

    expect(handler).not.toHaveBeenCalled();

    document.body.removeChild(inside);
    document.body.removeChild(outside);
  });

  it('no-ops when the ref is null', () => {
    const outside = document.createElement('div');
    document.body.appendChild(outside);

    const handler = vi.fn();
    renderHook(() => useOnClickOutside(makeRef(null), handler));

    act(() => {
      outside.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    });

    expect(handler).not.toHaveBeenCalled();

    document.body.removeChild(outside);
  });
});
