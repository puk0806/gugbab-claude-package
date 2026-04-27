import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Popover } from './Popover';

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: false });
});
afterEach(() => {
  vi.runOnlyPendingTimers();
  vi.useRealTimers();
});

function flushPointerListener() {
  vi.advanceTimersByTime(1);
}

interface SampleProps {
  modal?: boolean;
  onPointerDownOutside?: (e: Event) => void;
  onFocusOutside?: (e: Event) => void;
  onInteractOutside?: (e: Event) => void;
  onEscapeKeyDown?: (e: KeyboardEvent) => void;
  onOpenAutoFocus?: (e: Event) => void;
  onCloseAutoFocus?: (e: Event) => void;
}

function Sample(props: SampleProps) {
  return (
    <Popover.Root defaultOpen modal={props.modal}>
      <Popover.Trigger>open</Popover.Trigger>
      <button type="button" data-testid="outside">
        outside
      </button>
      <Popover.Portal>
        <Popover.Content
          data-testid="content"
          onPointerDownOutside={props.onPointerDownOutside}
          onFocusOutside={props.onFocusOutside}
          onInteractOutside={props.onInteractOutside}
          onEscapeKeyDown={props.onEscapeKeyDown}
          onOpenAutoFocus={props.onOpenAutoFocus}
          onCloseAutoFocus={props.onCloseAutoFocus}
        >
          <button type="button">inside</button>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

describe('Popover — outside-interaction callbacks', () => {
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

  it('preventDefault on onPointerDownOutside keeps the popover open', () => {
    render(<Sample onPointerDownOutside={(e) => e.preventDefault()} />);
    flushPointerListener();
    fireEvent.pointerDown(screen.getByTestId('outside'));
    expect(screen.getByTestId('content')).toBeInTheDocument();
  });

  it('fires onEscapeKeyDown on Escape', () => {
    const onEscapeKeyDown = vi.fn();
    render(<Sample onEscapeKeyDown={onEscapeKeyDown} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onEscapeKeyDown).toHaveBeenCalledTimes(1);
  });

  it('preventDefault on onEscapeKeyDown keeps the popover open', () => {
    render(<Sample onEscapeKeyDown={(e) => e.preventDefault()} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.getByTestId('content')).toBeInTheDocument();
  });
});

describe('Popover — auto focus callbacks', () => {
  it('fires onOpenAutoFocus when content mounts', () => {
    const onOpenAutoFocus = vi.fn();
    render(<Sample onOpenAutoFocus={onOpenAutoFocus} />);
    expect(onOpenAutoFocus).toHaveBeenCalledTimes(1);
  });
});

describe('Popover — modal vs non-modal', () => {
  it('modal=true sets pointer-events: none on body', () => {
    render(<Sample modal />);
    expect(document.body.style.pointerEvents).toBe('none');
  });

  it('modal=false does not set pointer-events on body', () => {
    const original = document.body.style.pointerEvents;
    render(<Sample modal={false} />);
    expect(document.body.style.pointerEvents).toBe(original);
  });
});

describe('Popover — a11y attributes', () => {
  it('content has role="dialog"', () => {
    render(<Sample />);
    expect(screen.getByTestId('content').getAttribute('role')).toBe('dialog');
  });

  it('modal=true sets aria-modal', () => {
    render(<Sample modal />);
    expect(screen.getByTestId('content').getAttribute('aria-modal')).toBe('true');
  });

  it('modal=false omits aria-modal', () => {
    render(<Sample modal={false} />);
    expect(screen.getByTestId('content').getAttribute('aria-modal')).toBeNull();
  });
});
