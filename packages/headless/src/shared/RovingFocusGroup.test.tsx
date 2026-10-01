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

  it('컨테이너는 탭 순서에 들어가지 않는다 (tabindex -1)', () => {
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
    expect(container?.getAttribute('tabindex')).toBe('-1');
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
    expect(screen.getByTestId('group').getAttribute('tabindex')).toBe('-1');
  });
});

describe('RovingFocusGroup — 탭 스톱 (경계)', () => {
  it('그룹 전체에서 tabindex=0인 요소는 정확히 하나다', () => {
    render(
      <RovingFocusGroup>
        {['a', 'b', 'c'].map((id) => (
          <RovingFocusGroupItem key={id}>
            <button type="button" data-testid={id}>
              {id}
            </button>
          </RovingFocusGroupItem>
        ))}
      </RovingFocusGroup>,
    );
    const group = screen.getByTestId('a').closest('[data-roving-group="true"]') as HTMLElement;
    const tabbables = [group, ...Array.from(group.querySelectorAll('[tabindex]'))].filter(
      (el) => el.getAttribute('tabindex') === '0',
    );
    expect(tabbables).toHaveLength(1);
    // 항목 래퍼(기본 span)가 탭 스톱이며, 첫 번째 항목이어야 한다
    expect(tabbables[0]).not.toBe(group);
    expect(tabbables[0]?.contains(screen.getByTestId('a'))).toBe(true);
  });

  it('항목이 없는 빈 그룹은 탭 가능한 요소가 없다', () => {
    render(<RovingFocusGroup data-testid="empty" />);
    expect(screen.getByTestId('empty').getAttribute('tabindex')).toBe('-1');
  });

  it('소비자가 tabIndex를 명시하면 그 값을 존중한다', () => {
    render(<RovingFocusGroup data-testid="g" tabIndex={0} />);
    expect(screen.getByTestId('g').getAttribute('tabindex')).toBe('0');
  });

  it('그룹 밖에서 항목을 쓰면 명확한 에러로 거부한다 (오용)', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() =>
      render(
        <RovingFocusGroupItem>
          <button type="button">orphan</button>
        </RovingFocusGroupItem>,
      ),
    ).toThrow('useRovingFocusGroupItem must be used inside <RovingFocusGroup>');
    spy.mockRestore();
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
