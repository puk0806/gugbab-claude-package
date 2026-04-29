import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Tooltip } from './Tooltip';

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: false });
});
afterEach(() => {
  vi.runOnlyPendingTimers();
  vi.useRealTimers();
});

/** Flush the setTimeout(0) that DismissableLayer uses to register its pointerdown listener. */
function flushPointerListener() {
  vi.advanceTimersByTime(1);
}

interface SampleProps {
  onPointerDownOutside?: (e: Event) => void;
  onFocusOutside?: (e: Event) => void;
  onInteractOutside?: (e: Event) => void;
  onEscapeKeyDown?: (e: KeyboardEvent) => void;
  onOpenAutoFocus?: (e: Event) => void;
  onCloseAutoFocus?: (e: Event) => void;
}

function Sample(props: SampleProps) {
  return (
    <>
      <button type="button" data-testid="outside">
        outside
      </button>
      <Tooltip.Root defaultOpen>
        <Tooltip.Trigger>trigger</Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            data-testid="content"
            onPointerDownOutside={props.onPointerDownOutside}
            onFocusOutside={props.onFocusOutside}
            onInteractOutside={props.onInteractOutside}
            onEscapeKeyDown={props.onEscapeKeyDown}
            onOpenAutoFocus={props.onOpenAutoFocus}
            onCloseAutoFocus={props.onCloseAutoFocus}
          >
            tooltip text
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </>
  );
}

describe('Tooltip.Content — outside-interaction callbacks', () => {
  it('fires onPointerDownOutside when clicking outside', () => {
    const onPointerDownOutside = vi.fn();
    render(<Sample onPointerDownOutside={onPointerDownOutside} />);
    flushPointerListener();
    fireEvent.pointerDown(screen.getByTestId('outside'));
    expect(onPointerDownOutside).toHaveBeenCalledTimes(1);
  });

  it('fires onInteractOutside on pointerdown outside', () => {
    const onInteractOutside = vi.fn();
    render(<Sample onInteractOutside={onInteractOutside} />);
    flushPointerListener();
    fireEvent.pointerDown(screen.getByTestId('outside'));
    expect(onInteractOutside).toHaveBeenCalledTimes(1);
  });

  it('fires onEscapeKeyDown on Escape', () => {
    const onEscapeKeyDown = vi.fn();
    render(<Sample onEscapeKeyDown={onEscapeKeyDown} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onEscapeKeyDown).toHaveBeenCalledTimes(1);
  });

  it('Escape closes the tooltip by default (onDismiss)', () => {
    render(<Sample />);
    expect(screen.getByTestId('content')).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByTestId('content')).toBeNull();
  });

  it('preventDefault on onEscapeKeyDown keeps tooltip open', () => {
    render(<Sample onEscapeKeyDown={(e) => e.preventDefault()} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.getByTestId('content')).toBeInTheDocument();
  });
});

describe('Tooltip.Content — non-modal behavior', () => {
  it('does NOT set pointer-events: none on body (non-modal)', () => {
    const original = document.body.style.pointerEvents;
    render(<Sample />);
    expect(document.body.style.pointerEvents).toBe(original);
  });
});

describe('Tooltip.Content — auto focus callbacks', () => {
  it('fires onOpenAutoFocus when content mounts', () => {
    const onOpenAutoFocus = vi.fn();
    render(<Sample onOpenAutoFocus={onOpenAutoFocus} />);
    expect(onOpenAutoFocus).toHaveBeenCalledTimes(1);
  });
});
