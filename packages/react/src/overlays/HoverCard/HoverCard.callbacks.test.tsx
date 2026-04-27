import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { HoverCard } from './HoverCard';

function Setup({
  onPointerDownOutside,
  onFocusOutside,
  onInteractOutside,
  onEscapeKeyDown,
  onOpenAutoFocus,
  onCloseAutoFocus,
}: Partial<React.ComponentProps<typeof HoverCard.Content>>) {
  return (
    <HoverCard.Root defaultOpen>
      <HoverCard.Trigger href="#x">trigger</HoverCard.Trigger>
      <HoverCard.Portal>
        <HoverCard.Content
          onPointerDownOutside={onPointerDownOutside}
          onFocusOutside={onFocusOutside}
          onInteractOutside={onInteractOutside}
          onEscapeKeyDown={onEscapeKeyDown}
          onOpenAutoFocus={onOpenAutoFocus}
          onCloseAutoFocus={onCloseAutoFocus}
        >
          <button type="button">inside</button>
        </HoverCard.Content>
      </HoverCard.Portal>
    </HoverCard.Root>
  );
}

describe('HoverCard — Phase 4 callbacks', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('calls onEscapeKeyDown when Escape is pressed', () => {
    const onEscapeKeyDown = vi.fn();
    render(<Setup onEscapeKeyDown={onEscapeKeyDown} />);
    expect(screen.getByText('inside')).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onEscapeKeyDown).toHaveBeenCalledTimes(1);
  });

  it('closes on Escape by default (onDismiss wiring)', () => {
    render(<Setup />);
    expect(screen.getByText('inside')).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByText('inside')).not.toBeInTheDocument();
  });

  it('does not close when onEscapeKeyDown calls preventDefault', () => {
    const onEscapeKeyDown = vi.fn((e: KeyboardEvent) => e.preventDefault());
    render(<Setup onEscapeKeyDown={onEscapeKeyDown} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onEscapeKeyDown).toHaveBeenCalledTimes(1);
    expect(screen.getByText('inside')).toBeInTheDocument();
  });

  it('calls onPointerDownOutside on outside pointer down', () => {
    const onPointerDownOutside = vi.fn();
    render(
      <div>
        <div data-testid="outside">outside</div>
        <Setup onPointerDownOutside={onPointerDownOutside} />
      </div>,
    );
    // DismissableLayer defers listener via setTimeout — flush timers first.
    act(() => vi.runAllTimers());
    fireEvent.pointerDown(screen.getByTestId('outside'));
    expect(onPointerDownOutside).toHaveBeenCalledTimes(1);
  });

  it('calls onInteractOutside together with onPointerDownOutside', () => {
    const onInteractOutside = vi.fn();
    render(
      <div>
        <div data-testid="outside">outside</div>
        <Setup onInteractOutside={onInteractOutside} />
      </div>,
    );
    act(() => vi.runAllTimers());
    fireEvent.pointerDown(screen.getByTestId('outside'));
    expect(onInteractOutside).toHaveBeenCalledTimes(1);
  });

  it('accepts onOpenAutoFocus and onCloseAutoFocus props without throwing', () => {
    const onOpenAutoFocus = vi.fn();
    const onCloseAutoFocus = vi.fn();
    expect(() =>
      render(<Setup onOpenAutoFocus={onOpenAutoFocus} onCloseAutoFocus={onCloseAutoFocus} />),
    ).not.toThrow();
  });
});
