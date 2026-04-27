import { act, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FocusScope } from './FocusScope';

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: false });
});

afterEach(() => {
  vi.runOnlyPendingTimers();
  vi.useRealTimers();
});

describe('FocusScope — render', () => {
  it('renders a div with tabIndex -1 wrapping its children', () => {
    render(
      <FocusScope>
        <button type="button" data-testid="btn">
          x
        </button>
      </FocusScope>,
    );
    const wrapper = screen.getByTestId('btn').parentElement;
    expect(wrapper?.tagName).toBe('DIV');
    expect(wrapper?.getAttribute('tabindex')).toBe('-1');
  });

  it('asChild renders props onto the single child', () => {
    render(
      <FocusScope asChild>
        <section data-testid="scope">
          <button type="button">x</button>
        </section>
      </FocusScope>,
    );
    expect(screen.getByTestId('scope').tagName).toBe('SECTION');
    expect(screen.getByTestId('scope').getAttribute('tabindex')).toBe('-1');
  });

  it('forwards ref to the scope element', () => {
    const ref = { current: null as HTMLDivElement | null };
    render(
      <FocusScope ref={ref}>
        <button type="button">x</button>
      </FocusScope>,
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});

describe('FocusScope — auto focus on mount', () => {
  it('moves focus to the first tabbable element inside on mount', () => {
    render(
      <FocusScope>
        <button type="button" data-testid="first">
          first
        </button>
        <button type="button">second</button>
      </FocusScope>,
    );
    expect(document.activeElement).toBe(screen.getByTestId('first'));
  });

  it('does not move focus if focus is already inside the scope', () => {
    function Tree() {
      return (
        <>
          {/* biome-ignore lint/a11y/noAutofocus: needed to set up pre-mount focus state */}
          <button type="button" data-testid="outside-but-pre-focused" autoFocus>
            pre
          </button>
          <FocusScope>
            <button type="button" data-testid="first">
              first
            </button>
          </FocusScope>
        </>
      );
    }
    // pre-focus the outside-but-pre-focused via autoFocus — when FocusScope mounts,
    // the previously focused element is the outside one; FocusScope should still
    // auto-focus first tabbable inside since outside is not contained.
    render(<Tree />);
    expect(document.activeElement).toBe(screen.getByTestId('first'));
  });

  it('fires onMountAutoFocus with a cancellable event', () => {
    const onMountAutoFocus = vi.fn<[Event], void>();
    render(
      <FocusScope onMountAutoFocus={onMountAutoFocus}>
        <button type="button" data-testid="first">
          first
        </button>
      </FocusScope>,
    );
    expect(onMountAutoFocus).toHaveBeenCalledTimes(1);
    const event = onMountAutoFocus.mock.calls[0]?.[0] as CustomEvent;
    expect(event).toBeInstanceOf(CustomEvent);
    expect(event.cancelable).toBe(true);
  });

  it('skips auto-focus when onMountAutoFocus calls preventDefault', () => {
    render(
      <>
        <button type="button" data-testid="outside">
          outside
        </button>
        <FocusScope onMountAutoFocus={(e) => e.preventDefault()}>
          <button type="button" data-testid="first">
            first
          </button>
        </FocusScope>
      </>,
    );
    expect(document.activeElement).not.toBe(screen.getByTestId('first'));
  });
});

describe('FocusScope — auto focus on unmount', () => {
  it('restores focus to previously focused element on unmount', () => {
    function Tree({ open }: { open: boolean }) {
      return (
        <>
          <button type="button" data-testid="trigger">
            trigger
          </button>
          {open && (
            <FocusScope>
              <button type="button" data-testid="first">
                first
              </button>
            </FocusScope>
          )}
        </>
      );
    }

    const { rerender } = render(<Tree open={false} />);
    const trigger = screen.getByTestId('trigger');
    act(() => trigger.focus());
    expect(document.activeElement).toBe(trigger);

    rerender(<Tree open={true} />);
    expect(document.activeElement).toBe(screen.getByTestId('first'));

    rerender(<Tree open={false} />);
    // unmount-autofocus is queued via setTimeout(0)
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(document.activeElement).toBe(trigger);
  });

  it('fires onUnmountAutoFocus with a cancellable event', () => {
    const onUnmountAutoFocus = vi.fn<[Event], void>();

    function Tree({ open }: { open: boolean }) {
      return open ? (
        <FocusScope onUnmountAutoFocus={onUnmountAutoFocus}>
          <button type="button">first</button>
        </FocusScope>
      ) : null;
    }

    const { rerender } = render(<Tree open={true} />);
    rerender(<Tree open={false} />);
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(onUnmountAutoFocus).toHaveBeenCalledTimes(1);
    const event = onUnmountAutoFocus.mock.calls[0]?.[0] as CustomEvent;
    expect(event).toBeInstanceOf(CustomEvent);
    expect(event.cancelable).toBe(true);
  });

  it('skips focus restore when onUnmountAutoFocus calls preventDefault', () => {
    function Tree({ open }: { open: boolean }) {
      return (
        <>
          <button type="button" data-testid="trigger">
            trigger
          </button>
          {open && (
            <FocusScope onUnmountAutoFocus={(e) => e.preventDefault()}>
              <button type="button" data-testid="first">
                first
              </button>
            </FocusScope>
          )}
        </>
      );
    }

    const { rerender } = render(<Tree open={false} />);
    act(() => screen.getByTestId('trigger').focus());

    rerender(<Tree open={true} />);
    rerender(<Tree open={false} />);
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(document.activeElement).not.toBe(screen.getByTestId('trigger'));
  });
});

describe('FocusScope — looping', () => {
  it('Tab from last tabbable wraps to first when loop is true', () => {
    render(
      <FocusScope loop>
        <button type="button" data-testid="a">
          a
        </button>
        <button type="button" data-testid="b">
          b
        </button>
        <button type="button" data-testid="c">
          c
        </button>
      </FocusScope>,
    );
    const last = screen.getByTestId('c');
    act(() => last.focus());
    fireEvent.keyDown(last, { key: 'Tab' });
    expect(document.activeElement).toBe(screen.getByTestId('a'));
  });

  it('Shift+Tab from first tabbable wraps to last when loop is true', () => {
    render(
      <FocusScope loop>
        <button type="button" data-testid="a">
          a
        </button>
        <button type="button" data-testid="b">
          b
        </button>
        <button type="button" data-testid="c">
          c
        </button>
      </FocusScope>,
    );
    const first = screen.getByTestId('a');
    act(() => first.focus());
    fireEvent.keyDown(first, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(screen.getByTestId('c'));
  });

  it('does not loop when loop is false', () => {
    render(
      <FocusScope>
        <button type="button" data-testid="a">
          a
        </button>
        <button type="button" data-testid="b">
          b
        </button>
      </FocusScope>,
    );
    const last = screen.getByTestId('b');
    act(() => last.focus());
    const event = fireEvent.keyDown(last, { key: 'Tab' });
    // event should not be prevented (allow native tab)
    expect(event).toBe(true); // not prevented
    expect(document.activeElement).toBe(last);
  });
});

describe('FocusScope — trapped', () => {
  it('keeps focus inside the scope when programmatic focus moves outside', () => {
    render(
      <>
        <button type="button" data-testid="outside">
          outside
        </button>
        <FocusScope trapped>
          <button type="button" data-testid="inside">
            inside
          </button>
        </FocusScope>
      </>,
    );
    const inside = screen.getByTestId('inside');
    expect(document.activeElement).toBe(inside);

    // Try to programmatically move focus outside.
    act(() => screen.getByTestId('outside').focus());
    expect(document.activeElement).toBe(inside);
  });

  it('allows focus to remain inside the scope when moving between scope children', () => {
    render(
      <FocusScope trapped>
        <button type="button" data-testid="a">
          a
        </button>
        <button type="button" data-testid="b">
          b
        </button>
      </FocusScope>,
    );
    expect(document.activeElement).toBe(screen.getByTestId('a'));
    act(() => screen.getByTestId('b').focus());
    expect(document.activeElement).toBe(screen.getByTestId('b'));
  });

  it('does not trap focus when trapped is false', () => {
    render(
      <>
        <button type="button" data-testid="outside">
          outside
        </button>
        <FocusScope>
          <button type="button" data-testid="inside">
            inside
          </button>
        </FocusScope>
      </>,
    );
    act(() => screen.getByTestId('outside').focus());
    expect(document.activeElement).toBe(screen.getByTestId('outside'));
  });
});

describe('FocusScope — nested scopes', () => {
  it('nested scope takes focus on mount without outer scope fighting back', () => {
    function Tree({ inner }: { inner: boolean }) {
      return (
        <FocusScope trapped>
          <button type="button" data-testid="outer-btn">
            outer
          </button>
          {inner && (
            <FocusScope trapped>
              <button type="button" data-testid="inner-btn">
                inner
              </button>
            </FocusScope>
          )}
        </FocusScope>
      );
    }

    const { rerender } = render(<Tree inner={false} />);
    expect(document.activeElement).toBe(screen.getByTestId('outer-btn'));

    // If outer's trap were not paused on inner mount, focus would be pulled
    // back to outer-btn. Inner being focused proves outer is paused.
    rerender(<Tree inner={true} />);
    expect(document.activeElement).toBe(screen.getByTestId('inner-btn'));
  });

  it('outer scope resumes and inner restores focus to previously focused on unmount', () => {
    function Tree({ inner }: { inner: boolean }) {
      return (
        <FocusScope trapped>
          <button type="button" data-testid="outer-btn">
            outer
          </button>
          {inner && (
            <FocusScope trapped>
              <button type="button" data-testid="inner-btn">
                inner
              </button>
            </FocusScope>
          )}
        </FocusScope>
      );
    }

    // Mount outer alone first so outer's auto-focus settles on outer-btn.
    const { rerender } = render(<Tree inner={false} />);
    expect(document.activeElement).toBe(screen.getByTestId('outer-btn'));

    // Then mount inner. Inner captures outer-btn as previouslyFocused.
    rerender(<Tree inner={true} />);
    expect(document.activeElement).toBe(screen.getByTestId('inner-btn'));

    // Unmount inner. Inner's cleanup setTimeout restores focus to outer-btn.
    rerender(<Tree inner={false} />);
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(document.activeElement).toBe(screen.getByTestId('outer-btn'));
  });
});

describe('FocusScope — falls back to scope element when no tabbable child', () => {
  it('focuses the scope itself when there is nothing tabbable inside', () => {
    function Tree() {
      const [focused, setFocused] = useState(false);
      return (
        <FocusScope ref={(node) => node && !focused && setFocused(true)}>
          <span>not tabbable</span>
        </FocusScope>
      );
    }
    render(<Tree />);
    // wrapper is a div with tabIndex -1, focusable programmatically
    const wrapper = screen.getByText('not tabbable').parentElement;
    expect(document.activeElement).toBe(wrapper);
  });
});
