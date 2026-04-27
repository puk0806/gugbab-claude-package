import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Dialog } from './Dialog';

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
  role?: 'dialog' | 'alertdialog';
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
    <Dialog.Root role={props.role} modal={props.modal} defaultOpen>
      <Dialog.Trigger>open</Dialog.Trigger>
      <button type="button" data-testid="outside">
        outside
      </button>
      <Dialog.Portal>
        <Dialog.Content
          data-testid="content"
          onPointerDownOutside={props.onPointerDownOutside}
          onFocusOutside={props.onFocusOutside}
          onInteractOutside={props.onInteractOutside}
          onEscapeKeyDown={props.onEscapeKeyDown}
          onOpenAutoFocus={props.onOpenAutoFocus}
          onCloseAutoFocus={props.onCloseAutoFocus}
        >
          <Dialog.Title>title</Dialog.Title>
          <Dialog.Close>close</Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

describe('Dialog — outside-interaction callbacks', () => {
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

  it('preventDefault on onPointerDownOutside keeps the dialog open', () => {
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

  it('preventDefault on onEscapeKeyDown keeps the dialog open', () => {
    render(<Sample onEscapeKeyDown={(e) => e.preventDefault()} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.getByTestId('content')).toBeInTheDocument();
  });
});

describe('Dialog — AlertDialog never closes on outside / Escape', () => {
  it('does not close on outside pointerdown', () => {
    render(<Sample role="alertdialog" />);
    flushPointerListener();
    fireEvent.pointerDown(screen.getByTestId('outside'));
    expect(screen.getByTestId('content')).toBeInTheDocument();
  });

  it('does not close on Escape', () => {
    render(<Sample role="alertdialog" />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.getByTestId('content')).toBeInTheDocument();
  });
});

describe('Dialog — auto focus callbacks', () => {
  it('fires onOpenAutoFocus when content mounts', () => {
    const onOpenAutoFocus = vi.fn();
    render(<Sample onOpenAutoFocus={onOpenAutoFocus} />);
    expect(onOpenAutoFocus).toHaveBeenCalledTimes(1);
  });
});

describe('Dialog — modal vs non-modal', () => {
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

describe('Dialog — a11y attributes', () => {
  it('content has role and aria-modal', () => {
    render(<Sample />);
    const content = screen.getByTestId('content');
    expect(content.getAttribute('role')).toBe('dialog');
    expect(content.getAttribute('aria-modal')).toBe('true');
  });

  it('alertdialog role applied', () => {
    render(<Sample role="alertdialog" />);
    expect(screen.getByTestId('content').getAttribute('role')).toBe('alertdialog');
  });
});
