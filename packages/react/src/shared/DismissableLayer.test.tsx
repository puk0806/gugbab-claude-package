import { fireEvent, render, screen } from '@testing-library/react';
import { useEffect, useRef } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DismissableLayer, DismissableLayerBranch } from './DismissableLayer';

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: false });
});

afterEach(() => {
  // Run any cleanup timers (effect teardown queues clearTimeout)
  vi.runOnlyPendingTimers();
  vi.useRealTimers();
});

/**
 * Radix delays the document `pointerdown` listener by `setTimeout(0)` so the
 * same pointerdown that mounts the layer cannot also close it. Tests must
 * advance timers after `render()` before dispatching `pointerdown`.
 */
function flushDeferredListener() {
  vi.advanceTimersByTime(1);
}

describe('DismissableLayer — render', () => {
  it('renders a div wrapping its children by default', () => {
    render(
      <DismissableLayer>
        <span data-testid="content">hello</span>
      </DismissableLayer>,
    );
    expect(screen.getByTestId('content').parentElement?.tagName).toBe('DIV');
  });

  it('asChild merges props onto the single child element', () => {
    render(
      <DismissableLayer asChild>
        <section data-testid="layer">child</section>
      </DismissableLayer>,
    );
    expect(screen.getByTestId('layer').tagName).toBe('SECTION');
  });

  it('forwards ref to the layer element', () => {
    const ref = { current: null as HTMLDivElement | null };
    render(
      <DismissableLayer ref={ref}>
        <span>x</span>
      </DismissableLayer>,
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});

describe('DismissableLayer — onPointerDownOutside', () => {
  it('fires when pointerdown happens outside the layer', () => {
    const onPointerDownOutside = vi.fn();
    render(
      <div>
        <button type="button" data-testid="outside">
          outside
        </button>
        <DismissableLayer onPointerDownOutside={onPointerDownOutside}>
          <span data-testid="inside">inside</span>
        </DismissableLayer>
      </div>,
    );
    flushDeferredListener();
    fireEvent.pointerDown(screen.getByTestId('outside'));
    expect(onPointerDownOutside).toHaveBeenCalledTimes(1);
  });

  it('does not fire when pointerdown happens inside the layer', () => {
    const onPointerDownOutside = vi.fn();
    render(
      <DismissableLayer onPointerDownOutside={onPointerDownOutside}>
        <span data-testid="inside">inside</span>
      </DismissableLayer>,
    );
    flushDeferredListener();
    fireEvent.pointerDown(screen.getByTestId('inside'));
    expect(onPointerDownOutside).not.toHaveBeenCalled();
  });

  it('does not fire while the deferred listener has not yet been registered', () => {
    const onPointerDownOutside = vi.fn();
    render(
      <div>
        <button type="button" data-testid="outside">
          outside
        </button>
        <DismissableLayer onPointerDownOutside={onPointerDownOutside}>
          <span>inside</span>
        </DismissableLayer>
      </div>,
    );
    // do NOT advance timers — listener should not be active yet
    fireEvent.pointerDown(screen.getByTestId('outside'));
    expect(onPointerDownOutside).not.toHaveBeenCalled();
  });

  it('passes a CustomEvent with the original pointer event in detail', () => {
    let received: Event | null = null;
    render(
      <div>
        <button type="button" data-testid="outside">
          outside
        </button>
        <DismissableLayer onPointerDownOutside={(e) => (received = e)}>
          <span>inside</span>
        </DismissableLayer>
      </div>,
    );
    flushDeferredListener();
    fireEvent.pointerDown(screen.getByTestId('outside'));
    expect(received).toBeInstanceOf(CustomEvent);
    expect((received as unknown as CustomEvent).detail.originalEvent).toBeInstanceOf(Event);
  });
});

describe('DismissableLayer — onEscapeKeyDown', () => {
  it('fires when Escape is pressed', () => {
    const onEscapeKeyDown = vi.fn();
    render(
      <DismissableLayer onEscapeKeyDown={onEscapeKeyDown}>
        <span>inside</span>
      </DismissableLayer>,
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onEscapeKeyDown).toHaveBeenCalledTimes(1);
    expect(onEscapeKeyDown.mock.calls[0][0]).toBeInstanceOf(KeyboardEvent);
  });

  it('does not fire on other keys', () => {
    const onEscapeKeyDown = vi.fn();
    render(
      <DismissableLayer onEscapeKeyDown={onEscapeKeyDown}>
        <span>inside</span>
      </DismissableLayer>,
    );
    fireEvent.keyDown(document, { key: 'Enter' });
    expect(onEscapeKeyDown).not.toHaveBeenCalled();
  });
});

describe('DismissableLayer — onDismiss', () => {
  it('fires after onPointerDownOutside unless event.defaultPrevented', () => {
    const onDismiss = vi.fn();
    render(
      <div>
        <button type="button" data-testid="outside">
          outside
        </button>
        <DismissableLayer onDismiss={onDismiss}>
          <span>inside</span>
        </DismissableLayer>
      </div>,
    );
    flushDeferredListener();
    fireEvent.pointerDown(screen.getByTestId('outside'));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('skips onDismiss if onPointerDownOutside calls preventDefault', () => {
    const onDismiss = vi.fn();
    render(
      <div>
        <button type="button" data-testid="outside">
          outside
        </button>
        <DismissableLayer
          onPointerDownOutside={(event) => event.preventDefault()}
          onDismiss={onDismiss}
        >
          <span>inside</span>
        </DismissableLayer>
      </div>,
    );
    flushDeferredListener();
    fireEvent.pointerDown(screen.getByTestId('outside'));
    expect(onDismiss).not.toHaveBeenCalled();
  });

  it('fires after Escape unless onEscapeKeyDown calls preventDefault', () => {
    const onDismiss = vi.fn();
    render(
      <DismissableLayer onDismiss={onDismiss}>
        <span>inside</span>
      </DismissableLayer>,
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('skips onDismiss when onEscapeKeyDown calls preventDefault', () => {
    const onDismiss = vi.fn();
    render(
      <DismissableLayer onEscapeKeyDown={(event) => event.preventDefault()} onDismiss={onDismiss}>
        <span>inside</span>
      </DismissableLayer>,
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onDismiss).not.toHaveBeenCalled();
  });
});

describe('DismissableLayer — onInteractOutside', () => {
  it('fires on pointerdown outside', () => {
    const onInteractOutside = vi.fn();
    render(
      <div>
        <button type="button" data-testid="outside">
          outside
        </button>
        <DismissableLayer onInteractOutside={onInteractOutside}>
          <span>inside</span>
        </DismissableLayer>
      </div>,
    );
    flushDeferredListener();
    fireEvent.pointerDown(screen.getByTestId('outside'));
    expect(onInteractOutside).toHaveBeenCalledTimes(1);
  });

  it('preventDefault inside onPointerDownOutside also blocks onDismiss path', () => {
    const onInteractOutside = vi.fn();
    const onDismiss = vi.fn();
    render(
      <div>
        <button type="button" data-testid="outside">
          outside
        </button>
        <DismissableLayer
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={onInteractOutside}
          onDismiss={onDismiss}
        >
          <span>inside</span>
        </DismissableLayer>
      </div>,
    );
    flushDeferredListener();
    fireEvent.pointerDown(screen.getByTestId('outside'));
    expect(onInteractOutside).toHaveBeenCalledTimes(1);
    expect(onDismiss).not.toHaveBeenCalled();
  });
});

describe('DismissableLayer — onFocusOutside', () => {
  it('fires when focusin happens outside the layer', () => {
    const onFocusOutside = vi.fn();
    render(
      <div>
        <button type="button" data-testid="outside">
          outside
        </button>
        <DismissableLayer onFocusOutside={onFocusOutside}>
          <button type="button">inside</button>
        </DismissableLayer>
      </div>,
    );
    fireEvent.focusIn(screen.getByTestId('outside'));
    expect(onFocusOutside).toHaveBeenCalledTimes(1);
  });

  it('does not fire when focus stays inside the layer', () => {
    const onFocusOutside = vi.fn();
    render(
      <DismissableLayer onFocusOutside={onFocusOutside}>
        <button type="button" data-testid="inside">
          inside
        </button>
      </DismissableLayer>,
    );
    // simulate user clicking in via onFocusCapture path: layer marks inside
    // then a focusin event fires on the inside element
    fireEvent.focus(screen.getByTestId('inside'));
    fireEvent.focusIn(screen.getByTestId('inside'));
    expect(onFocusOutside).not.toHaveBeenCalled();
  });
});

describe('DismissableLayer — layer stack', () => {
  it('only the top-most layer fires onEscapeKeyDown', () => {
    const onEscapeOuter = vi.fn();
    const onEscapeInner = vi.fn();
    render(
      <DismissableLayer onEscapeKeyDown={onEscapeOuter}>
        <span>outer</span>
        <DismissableLayer onEscapeKeyDown={onEscapeInner}>
          <span>inner</span>
        </DismissableLayer>
      </DismissableLayer>,
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onEscapeInner).toHaveBeenCalledTimes(1);
    expect(onEscapeOuter).not.toHaveBeenCalled();
  });
});

describe('DismissableLayer — disableOutsidePointerEvents', () => {
  it('sets body pointer-events: none while mounted', () => {
    const { unmount } = render(
      <DismissableLayer disableOutsidePointerEvents>
        <span>inside</span>
      </DismissableLayer>,
    );
    expect(document.body.style.pointerEvents).toBe('none');
    unmount();
  });

  it('restores body pointer-events when last disabling layer unmounts', () => {
    const original = document.body.style.pointerEvents;
    const { unmount } = render(
      <DismissableLayer disableOutsidePointerEvents>
        <span>inside</span>
      </DismissableLayer>,
    );
    expect(document.body.style.pointerEvents).toBe('none');
    unmount();
    expect(document.body.style.pointerEvents).toBe(original);
  });
});

describe('DismissableLayer — Branch', () => {
  it('pointerdown inside a Branch does not count as outside', () => {
    const onPointerDownOutside = vi.fn();

    function Tree() {
      const branchRef = useRef<HTMLDivElement>(null);
      // Render the branch in a sibling subtree so it is not a descendant of
      // the layer (this is how Radix submenus / portaled trees work).
      return (
        <div>
          <DismissableLayerBranch ref={branchRef}>
            <button type="button" data-testid="branch-button">
              branch
            </button>
          </DismissableLayerBranch>
          <DismissableLayer onPointerDownOutside={onPointerDownOutside}>
            <span>layer-content</span>
          </DismissableLayer>
        </div>
      );
    }

    render(<Tree />);
    flushDeferredListener();
    fireEvent.pointerDown(screen.getByTestId('branch-button'));
    expect(onPointerDownOutside).not.toHaveBeenCalled();
  });
});

describe('DismissableLayer — cleanup', () => {
  it('removes document listeners on unmount', () => {
    const onEscapeKeyDown = vi.fn();
    const { unmount } = render(
      <DismissableLayer onEscapeKeyDown={onEscapeKeyDown}>
        <span>inside</span>
      </DismissableLayer>,
    );
    unmount();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onEscapeKeyDown).not.toHaveBeenCalled();
  });

  it('does not run handlers when the consuming component never re-renders', () => {
    // sanity: once unmounted, the layer entry is removed from the stack
    // so a sibling layer (mounted after) becomes top-most
    const onOuter = vi.fn();

    function Outer() {
      useEffect(() => {}, []);
      return (
        <DismissableLayer onEscapeKeyDown={onOuter}>
          <span>outer</span>
        </DismissableLayer>
      );
    }

    const { unmount } = render(<Outer />);
    unmount();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onOuter).not.toHaveBeenCalled();
  });
});
