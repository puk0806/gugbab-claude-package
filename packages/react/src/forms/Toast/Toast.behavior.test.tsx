import { act, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Toast } from './Toast';

// ---------------------------------------------------------------------------
// jsdom helpers — fireEvent does not forward PointerEvent init dict properly,
// so we use native dispatchEvent for swipe sequences.
// ---------------------------------------------------------------------------
function pointerDown(el: HTMLElement, x: number, y: number) {
  el.dispatchEvent(
    new PointerEvent('pointerdown', {
      bubbles: true,
      cancelable: true,
      button: 0,
      clientX: x,
      clientY: y,
      pointerId: 1,
    }),
  );
}
function pointerMove(el: HTMLElement, x: number, y: number) {
  el.dispatchEvent(
    new PointerEvent('pointermove', {
      bubbles: true,
      cancelable: true,
      clientX: x,
      clientY: y,
      pointerId: 1,
    }),
  );
}
function pointerUp(el: HTMLElement, x: number, y: number) {
  el.dispatchEvent(
    new PointerEvent('pointerup', {
      bubbles: true,
      cancelable: true,
      clientX: x,
      clientY: y,
      pointerId: 1,
    }),
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function MultiToast({
  count = 1,
  duration = 5000,
  swipeDirection = 'right' as const,
  swipeThreshold = 50,
}: {
  count?: number;
  duration?: number;
  swipeDirection?: 'right' | 'left' | 'up' | 'down';
  swipeThreshold?: number;
}) {
  const [items, setItems] = useState<number[]>(Array.from({ length: count }, (_, i) => i));
  return (
    <Toast.Provider
      duration={duration}
      swipeDirection={swipeDirection}
      swipeThreshold={swipeThreshold}
    >
      {items.map((i) => (
        <Toast.Root
          key={i}
          open
          onOpenChange={(open) => {
            if (!open) setItems((prev) => prev.filter((x) => x !== i));
          }}
          duration={duration}
          data-testid={`toast-${i}`}
        >
          <Toast.Title>Toast {i}</Toast.Title>
          <Toast.Description>Desc {i}</Toast.Description>
          <Toast.Action altText={`Undo toast ${i}`}>실행 취소</Toast.Action>
          <Toast.Close data-testid={`close-${i}`}>닫기</Toast.Close>
        </Toast.Root>
      ))}
      <Toast.Viewport data-testid="viewport" />
    </Toast.Provider>
  );
}

// biome-ignore lint/correctness/noUnusedVariables: kept for future controlled-mode tests
function ControlledToast({ duration = 5000 }: { duration?: number }) {
  const [open, setOpen] = useState(true);
  return (
    <Toast.Provider duration={duration}>
      <Toast.Root open={open} onOpenChange={setOpen} duration={duration} data-testid="toast">
        <Toast.Title>제목</Toast.Title>
        <Toast.Close data-testid="close-btn">닫기</Toast.Close>
      </Toast.Root>
      <Toast.Viewport data-testid="viewport" />
    </Toast.Provider>
  );
}

// ---------------------------------------------------------------------------
// Provider / Viewport
// ---------------------------------------------------------------------------

describe('Toast.Provider + Toast.Viewport', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('Viewport renders as <ol role="region">', () => {
    render(<MultiToast count={1} />);
    const vp = screen.getByTestId('viewport');
    expect(vp.tagName).toBe('OL');
    expect(vp).toHaveAttribute('role', 'region');
  });

  it('Viewport aria-label includes hotkey placeholder substitution', () => {
    render(<MultiToast count={1} />);
    const vp = screen.getByTestId('viewport');
    const label = vp.getAttribute('aria-label') ?? '';
    // Default label replaces {hotkey} with 'F8'
    expect(label).toContain('F8');
  });

  it('multiple toasts render simultaneously (FIFO queue)', () => {
    render(<MultiToast count={3} />);
    expect(screen.getByText('Toast 0')).toBeInTheDocument();
    expect(screen.getByText('Toast 1')).toBeInTheDocument();
    expect(screen.getByText('Toast 2')).toBeInTheDocument();
  });

  it('dismissing one toast does not affect others', () => {
    render(<MultiToast count={3} />);
    fireEvent.click(screen.getByTestId('close-0'));
    expect(screen.queryByText('Toast 0')).toBeNull();
    expect(screen.getByText('Toast 1')).toBeInTheDocument();
    expect(screen.getByText('Toast 2')).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Auto-dismiss
// ---------------------------------------------------------------------------

describe('Auto-dismiss', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('calls onOpenChange(false) after duration ms', () => {
    const spy = vi.fn();
    render(
      <Toast.Provider duration={2000}>
        <Toast.Root open onOpenChange={spy} duration={2000} data-testid="t">
          <Toast.Title>Gone</Toast.Title>
        </Toast.Root>
        <Toast.Viewport />
      </Toast.Provider>,
    );
    expect(screen.getByText('Gone')).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(2000));
    expect(spy).toHaveBeenCalledWith(false);
  });

  it('does not dismiss before duration elapses', () => {
    const spy = vi.fn();
    render(
      <Toast.Provider duration={3000}>
        <Toast.Root open onOpenChange={spy} duration={3000}>
          <Toast.Title>Stay</Toast.Title>
        </Toast.Root>
        <Toast.Viewport />
      </Toast.Provider>,
    );
    act(() => vi.advanceTimersByTime(2999));
    expect(spy).not.toHaveBeenCalled();
  });

  it('pauses timer on pointermove into viewport wrapper, resumes on pointerleave', () => {
    const spy = vi.fn();
    render(
      <Toast.Provider duration={4000}>
        <Toast.Root open onOpenChange={spy} duration={4000} data-testid="toast">
          <Toast.Title>Pauseable</Toast.Title>
        </Toast.Root>
        <Toast.Viewport data-testid="viewport" />
      </Toast.Provider>,
    );

    const viewport = screen.getByTestId('viewport');
    const wrapper = viewport.parentElement ?? document.body;

    // Hover → pause (advance timer should NOT dismiss)
    fireEvent.pointerMove(wrapper);
    act(() => vi.advanceTimersByTime(4000));
    expect(spy).not.toHaveBeenCalled();

    // Unhover → resume (remaining time fires dismiss)
    fireEvent.pointerLeave(wrapper);
    act(() => vi.advanceTimersByTime(4000));
    expect(spy).toHaveBeenCalledWith(false);
  });
});

// ---------------------------------------------------------------------------
// Swipe to dismiss
// ---------------------------------------------------------------------------

describe('Swipe to dismiss', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('swipe right past threshold calls onOpenChange(false)', async () => {
    const spy = vi.fn();
    render(
      <Toast.Provider swipeDirection="right" swipeThreshold={50}>
        <Toast.Root open onOpenChange={spy} data-testid="toast">
          <Toast.Title>Swipeable</Toast.Title>
        </Toast.Root>
        <Toast.Viewport />
      </Toast.Provider>,
    );

    const toast = screen.getByTestId('toast');
    act(() => {
      pointerDown(toast, 0, 0);
      pointerMove(toast, 60, 0);
      pointerUp(toast, 60, 0);
    });

    await act(async () => {
      await Promise.resolve();
    });
    expect(spy).toHaveBeenCalledWith(false);
  });

  it('swipe below threshold does NOT dismiss', async () => {
    const spy = vi.fn();
    render(
      <Toast.Provider swipeDirection="right" swipeThreshold={50}>
        <Toast.Root open onOpenChange={spy} data-testid="toast">
          <Toast.Title>Swipeable</Toast.Title>
        </Toast.Root>
        <Toast.Viewport />
      </Toast.Provider>,
    );

    const toast = screen.getByTestId('toast');
    act(() => {
      pointerDown(toast, 0, 0);
      pointerMove(toast, 30, 0);
      pointerUp(toast, 30, 0);
    });

    await act(async () => {
      await Promise.resolve();
    });
    expect(spy).not.toHaveBeenCalled();
  });

  it('swipe left is ignored when swipeDirection=right', async () => {
    const spy = vi.fn();
    render(
      <Toast.Provider swipeDirection="right" swipeThreshold={50}>
        <Toast.Root open onOpenChange={spy} data-testid="toast">
          <Toast.Title>Swipeable</Toast.Title>
        </Toast.Root>
        <Toast.Viewport />
      </Toast.Provider>,
    );

    const toast = screen.getByTestId('toast');
    act(() => {
      pointerDown(toast, 0, 0);
      pointerMove(toast, -100, 0);
      pointerUp(toast, -100, 0);
    });

    await act(async () => {
      await Promise.resolve();
    });
    expect(spy).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Announcer
// ---------------------------------------------------------------------------

describe('Announcer (SR live region)', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('renders a visually hidden SR announcer with aria-live', () => {
    render(
      <Toast.Provider label="알림">
        <Toast.Root open type="foreground" data-testid="toast">
          <Toast.Title>저장됨</Toast.Title>
          <Toast.Description>변경 사항 저장 완료</Toast.Description>
        </Toast.Root>
        <Toast.Viewport />
      </Toast.Provider>,
    );

    // Announcer is rendered in document.body as a portal
    const announcer = document.querySelector('[aria-live]');
    expect(announcer).not.toBeNull();
    expect(announcer?.getAttribute('aria-live')).toBe('assertive');
  });

  it('announcer disappears after 1s', () => {
    render(
      <Toast.Provider>
        <Toast.Root open data-testid="toast">
          <Toast.Title>임시</Toast.Title>
        </Toast.Root>
        <Toast.Viewport />
      </Toast.Provider>,
    );

    const before = document.querySelectorAll('[aria-live]').length;
    expect(before).toBeGreaterThan(0);

    act(() => vi.advanceTimersByTime(1001));
    const after = document.querySelectorAll('[aria-live]').length;
    expect(after).toBeLessThan(before);
  });
});

// ---------------------------------------------------------------------------
// Action altText
// ---------------------------------------------------------------------------

describe('Toast.Action altText', () => {
  it('renders altText as data attribute on announce-exclude wrapper', () => {
    render(
      <Toast.Provider>
        <Toast.Root open data-testid="toast">
          <Toast.Title>알림</Toast.Title>
          <Toast.Action altText="실행 취소 (Ctrl+Z)">Undo</Toast.Action>
        </Toast.Root>
        <Toast.Viewport />
      </Toast.Provider>,
    );

    const wrapper = document.querySelector('[data-gugbab-toast-announce-alt]');
    expect(wrapper?.getAttribute('data-gugbab-toast-announce-alt')).toBe('실행 취소 (Ctrl+Z)');
  });
});

// ---------------------------------------------------------------------------
// Escape key
// ---------------------------------------------------------------------------

describe('Escape key dismissal', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('pressing Escape closes the toast', () => {
    const spy = vi.fn();
    render(
      <Toast.Provider>
        <Toast.Root open onOpenChange={spy} data-testid="toast">
          <Toast.Title>Escapable</Toast.Title>
        </Toast.Root>
        <Toast.Viewport />
      </Toast.Provider>,
    );

    fireEvent.keyDown(screen.getByTestId('toast'), { key: 'Escape' });
    expect(spy).toHaveBeenCalledWith(false);
  });
});
