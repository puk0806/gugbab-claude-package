import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  RovingFocusGroup,
  RovingFocusGroupItem,
  useRovingFocusGroupItem,
} from './RovingFocusGroup';

// Radix defers focus moves with setTimeout(0); flush before assertions.
function flush() {
  act(() => {
    vi.advanceTimersByTime(1);
  });
}

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: false });
});

afterEach(() => {
  vi.runOnlyPendingTimers();
  vi.useRealTimers();
});

describe('RovingFocusGroup — render', () => {
  it('renders a div container', () => {
    render(
      <RovingFocusGroup>
        <RovingFocusGroupItem>
          <button type="button">a</button>
        </RovingFocusGroupItem>
      </RovingFocusGroup>,
    );
    const item = screen.getByText('a');
    // wrapper is the parent of the item slot
    expect(item.closest('[data-roving-group="true"]')).not.toBeNull();
  });

  it('container is tabbable when items exist', () => {
    render(
      <RovingFocusGroup>
        <RovingFocusGroupItem>
          <button type="button" data-testid="a">
            a
          </button>
        </RovingFocusGroupItem>
      </RovingFocusGroup>,
    );
    const container = screen.getByTestId('a').closest('[data-roving-group="true"]');
    expect(container?.getAttribute('tabindex')).toBe('0');
  });

  it('asChild merges props onto a single child', () => {
    render(
      <RovingFocusGroup asChild>
        <ul data-testid="group">
          <RovingFocusGroupItem>
            <li>a</li>
          </RovingFocusGroupItem>
        </ul>
      </RovingFocusGroup>,
    );
    expect(screen.getByTestId('group').tagName).toBe('UL');
    expect(screen.getByTestId('group').getAttribute('tabindex')).toBe('0');
  });
});

describe('RovingFocusGroup — tab stop management', () => {
  it('first focusable item is the initial tab stop', () => {
    render(
      <RovingFocusGroup>
        <RovingFocusGroupItem asChild>
          <button type="button" data-testid="a">
            a
          </button>
        </RovingFocusGroupItem>
        <RovingFocusGroupItem asChild>
          <button type="button" data-testid="b">
            b
          </button>
        </RovingFocusGroupItem>
      </RovingFocusGroup>,
    );
    expect(screen.getByTestId('a').getAttribute('tabindex')).toBe('0');
    expect(screen.getByTestId('b').getAttribute('tabindex')).toBe('-1');
  });

  it('focusing an item makes it the current tab stop', () => {
    render(
      <RovingFocusGroup>
        <RovingFocusGroupItem asChild>
          <button type="button" data-testid="a">
            a
          </button>
        </RovingFocusGroupItem>
        <RovingFocusGroupItem asChild>
          <button type="button" data-testid="b">
            b
          </button>
        </RovingFocusGroupItem>
      </RovingFocusGroup>,
    );
    const b = screen.getByTestId('b');
    act(() => b.focus());
    expect(document.activeElement).toBe(b);
    expect(b.getAttribute('tabindex')).toBe('0');
    expect(screen.getByTestId('a').getAttribute('tabindex')).toBe('-1');
  });

  it('respects active prop on initial mount', () => {
    render(
      <RovingFocusGroup>
        <RovingFocusGroupItem asChild>
          <button type="button" data-testid="a">
            a
          </button>
        </RovingFocusGroupItem>
        <RovingFocusGroupItem active asChild>
          <button type="button" data-testid="b">
            b
          </button>
        </RovingFocusGroupItem>
      </RovingFocusGroup>,
    );
    expect(screen.getByTestId('b').getAttribute('tabindex')).toBe('0');
    expect(screen.getByTestId('a').getAttribute('tabindex')).toBe('-1');
  });
});

describe('RovingFocusGroup — keyboard navigation (horizontal default)', () => {
  function setup(props?: { loop?: boolean }) {
    render(
      <RovingFocusGroup loop={props?.loop}>
        <RovingFocusGroupItem asChild>
          <button type="button" data-testid="a">
            a
          </button>
        </RovingFocusGroupItem>
        <RovingFocusGroupItem asChild>
          <button type="button" data-testid="b">
            b
          </button>
        </RovingFocusGroupItem>
        <RovingFocusGroupItem asChild>
          <button type="button" data-testid="c">
            c
          </button>
        </RovingFocusGroupItem>
      </RovingFocusGroup>,
    );
  }

  it('ArrowRight moves focus to the next item', () => {
    setup();
    const a = screen.getByTestId('a');
    act(() => a.focus());
    fireEvent.keyDown(a, { key: 'ArrowRight' });
    flush();
    expect(document.activeElement).toBe(screen.getByTestId('b'));
  });

  it('ArrowLeft moves focus to the previous item', () => {
    setup();
    const b = screen.getByTestId('b');
    act(() => b.focus());
    fireEvent.keyDown(b, { key: 'ArrowLeft' });
    flush();
    expect(document.activeElement).toBe(screen.getByTestId('a'));
  });

  it('Home jumps to first item', () => {
    setup();
    const c = screen.getByTestId('c');
    act(() => c.focus());
    fireEvent.keyDown(c, { key: 'Home' });
    flush();
    expect(document.activeElement).toBe(screen.getByTestId('a'));
  });

  it('End jumps to last item', () => {
    setup();
    const a = screen.getByTestId('a');
    act(() => a.focus());
    fireEvent.keyDown(a, { key: 'End' });
    flush();
    expect(document.activeElement).toBe(screen.getByTestId('c'));
  });

  it('ArrowDown does not move focus when orientation is horizontal', () => {
    render(
      <RovingFocusGroup orientation="horizontal">
        <RovingFocusGroupItem asChild>
          <button type="button" data-testid="a">
            a
          </button>
        </RovingFocusGroupItem>
        <RovingFocusGroupItem asChild>
          <button type="button" data-testid="b">
            b
          </button>
        </RovingFocusGroupItem>
      </RovingFocusGroup>,
    );
    const a = screen.getByTestId('a');
    act(() => a.focus());
    fireEvent.keyDown(a, { key: 'ArrowDown' });
    flush();
    expect(document.activeElement).toBe(a);
  });

  it('ArrowRight on last item does NOT loop when loop is false', () => {
    setup({ loop: false });
    const c = screen.getByTestId('c');
    act(() => c.focus());
    fireEvent.keyDown(c, { key: 'ArrowRight' });
    flush();
    expect(document.activeElement).toBe(c);
  });

  it('ArrowRight on last item wraps to first when loop is true', () => {
    setup({ loop: true });
    const c = screen.getByTestId('c');
    act(() => c.focus());
    fireEvent.keyDown(c, { key: 'ArrowRight' });
    flush();
    expect(document.activeElement).toBe(screen.getByTestId('a'));
  });

  it('ArrowLeft on first item wraps to last when loop is true', () => {
    setup({ loop: true });
    const a = screen.getByTestId('a');
    act(() => a.focus());
    fireEvent.keyDown(a, { key: 'ArrowLeft' });
    flush();
    expect(document.activeElement).toBe(screen.getByTestId('c'));
  });
});

describe('RovingFocusGroup — orientation=vertical', () => {
  function setup() {
    render(
      <RovingFocusGroup orientation="vertical">
        <RovingFocusGroupItem asChild>
          <button type="button" data-testid="a">
            a
          </button>
        </RovingFocusGroupItem>
        <RovingFocusGroupItem asChild>
          <button type="button" data-testid="b">
            b
          </button>
        </RovingFocusGroupItem>
      </RovingFocusGroup>,
    );
  }

  it('ArrowDown moves focus to next', () => {
    setup();
    const a = screen.getByTestId('a');
    act(() => a.focus());
    fireEvent.keyDown(a, { key: 'ArrowDown' });
    flush();
    expect(document.activeElement).toBe(screen.getByTestId('b'));
  });

  it('ArrowUp moves focus to previous', () => {
    setup();
    const b = screen.getByTestId('b');
    act(() => b.focus());
    fireEvent.keyDown(b, { key: 'ArrowUp' });
    flush();
    expect(document.activeElement).toBe(screen.getByTestId('a'));
  });

  it('ArrowRight does not navigate when vertical', () => {
    setup();
    const a = screen.getByTestId('a');
    act(() => a.focus());
    fireEvent.keyDown(a, { key: 'ArrowRight' });
    flush();
    expect(document.activeElement).toBe(a);
  });
});

describe('RovingFocusGroup — RTL', () => {
  it('reverses ArrowLeft and ArrowRight semantics in RTL', () => {
    render(
      <RovingFocusGroup dir="rtl">
        <RovingFocusGroupItem asChild>
          <button type="button" data-testid="a">
            a
          </button>
        </RovingFocusGroupItem>
        <RovingFocusGroupItem asChild>
          <button type="button" data-testid="b">
            b
          </button>
        </RovingFocusGroupItem>
      </RovingFocusGroup>,
    );
    const a = screen.getByTestId('a');
    act(() => a.focus());
    // In RTL, ArrowLeft means "next"
    fireEvent.keyDown(a, { key: 'ArrowLeft' });
    flush();
    expect(document.activeElement).toBe(screen.getByTestId('b'));
  });
});

describe('RovingFocusGroup — non-focusable items', () => {
  it('skips items with focusable=false during navigation', () => {
    render(
      <RovingFocusGroup>
        <RovingFocusGroupItem asChild>
          <button type="button" data-testid="a">
            a
          </button>
        </RovingFocusGroupItem>
        <RovingFocusGroupItem focusable={false} asChild>
          <button type="button" data-testid="b">
            b
          </button>
        </RovingFocusGroupItem>
        <RovingFocusGroupItem asChild>
          <button type="button" data-testid="c">
            c
          </button>
        </RovingFocusGroupItem>
      </RovingFocusGroup>,
    );
    const a = screen.getByTestId('a');
    act(() => a.focus());
    fireEvent.keyDown(a, { key: 'ArrowRight' });
    flush();
    expect(document.activeElement).toBe(screen.getByTestId('c'));
  });
});

describe('useRovingFocusGroupItem hook', () => {
  it('returns props to spread on a custom element', () => {
    function CustomItem({ children }: { children: React.ReactNode }) {
      const itemProps = useRovingFocusGroupItem();
      return (
        <button type="button" {...itemProps}>
          {children}
        </button>
      );
    }

    render(
      <RovingFocusGroup>
        <CustomItem>a</CustomItem>
        <CustomItem>b</CustomItem>
      </RovingFocusGroup>,
    );
    const a = screen.getByText('a');
    const b = screen.getByText('b');
    expect(a.getAttribute('tabindex')).toBe('0');
    expect(b.getAttribute('tabindex')).toBe('-1');

    act(() => a.focus());
    fireEvent.keyDown(a, { key: 'ArrowRight' });
    flush();
    expect(document.activeElement).toBe(b);
  });
});
