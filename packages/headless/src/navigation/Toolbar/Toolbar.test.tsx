import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DirectionProvider } from '../../shared/DirectionProvider';
import { Toolbar } from './Toolbar';

describe('Toolbar', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders Root with role="toolbar" and aria-orientation', () => {
    render(
      <Toolbar.Root data-testid="t">
        <Toolbar.Button>x</Toolbar.Button>
      </Toolbar.Root>,
    );
    const root = screen.getByTestId('t');
    expect(root.getAttribute('role')).toBe('toolbar');
    expect(root.getAttribute('aria-orientation')).toBe('horizontal');
    expect(root.getAttribute('data-orientation')).toBe('horizontal');
  });

  it('Button defaults to type="button"', () => {
    render(
      <Toolbar.Root>
        <Toolbar.Button>x</Toolbar.Button>
      </Toolbar.Root>,
    );
    expect(screen.getByText('x').getAttribute('type')).toBe('button');
  });

  it('Separator renders perpendicular to toolbar orientation (horizontal toolbar → vertical separator)', () => {
    render(
      <Toolbar.Root>
        <Toolbar.Button>a</Toolbar.Button>
        <Toolbar.Separator data-testid="sep" />
        <Toolbar.Button>b</Toolbar.Button>
      </Toolbar.Root>,
    );
    expect(screen.getByTestId('sep').getAttribute('aria-orientation')).toBe('vertical');
  });

  it('keyboard ArrowRight moves focus to next item (LTR horizontal)', () => {
    render(
      <Toolbar.Root>
        <Toolbar.Button>a</Toolbar.Button>
        <Toolbar.Button>b</Toolbar.Button>
        <Toolbar.Button>c</Toolbar.Button>
      </Toolbar.Root>,
    );
    const a = screen.getByText('a');
    act(() => {
      a.focus();
    });
    fireEvent.keyDown(a, { key: 'ArrowRight' });
    act(() => {
      vi.runAllTimers();
    });
    expect(screen.getByText('b')).toHaveFocus();
  });

  it('keyboard wraps with loop=true (default)', () => {
    render(
      <Toolbar.Root>
        <Toolbar.Button>a</Toolbar.Button>
        <Toolbar.Button>b</Toolbar.Button>
      </Toolbar.Root>,
    );
    const b = screen.getByText('b');
    act(() => {
      b.focus();
    });
    fireEvent.keyDown(b, { key: 'ArrowRight' });
    act(() => {
      vi.runAllTimers();
    });
    expect(screen.getByText('a')).toHaveFocus();
  });

  it('Home jumps to first, End jumps to last', () => {
    render(
      <Toolbar.Root>
        <Toolbar.Button>a</Toolbar.Button>
        <Toolbar.Button>b</Toolbar.Button>
        <Toolbar.Button>c</Toolbar.Button>
      </Toolbar.Root>,
    );
    const b = screen.getByText('b');
    act(() => {
      b.focus();
    });
    fireEvent.keyDown(b, { key: 'Home' });
    act(() => {
      vi.runAllTimers();
    });
    expect(screen.getByText('a')).toHaveFocus();

    const a = screen.getByText('a');
    fireEvent.keyDown(a, { key: 'End' });
    act(() => {
      vi.runAllTimers();
    });
    expect(screen.getByText('c')).toHaveFocus();
  });

  it('RTL swaps ArrowLeft/Right semantics (horizontal)', () => {
    render(
      <DirectionProvider dir="rtl">
        <Toolbar.Root>
          <Toolbar.Button>a</Toolbar.Button>
          <Toolbar.Button>b</Toolbar.Button>
        </Toolbar.Root>
      </DirectionProvider>,
    );
    const a = screen.getByText('a');
    act(() => {
      a.focus();
    });
    fireEvent.keyDown(a, { key: 'ArrowLeft' });
    act(() => {
      vi.runAllTimers();
    });
    expect(screen.getByText('b')).toHaveFocus();
  });

  it('vertical toolbar uses ArrowDown/Up', () => {
    render(
      <Toolbar.Root orientation="vertical">
        <Toolbar.Button>a</Toolbar.Button>
        <Toolbar.Button>b</Toolbar.Button>
      </Toolbar.Root>,
    );
    const a = screen.getByText('a');
    act(() => {
      a.focus();
    });
    fireEvent.keyDown(a, { key: 'ArrowDown' });
    act(() => {
      vi.runAllTimers();
    });
    expect(screen.getByText('b')).toHaveFocus();
  });

  it('Link activates on Space', () => {
    const onClick = vi.fn();
    render(
      <Toolbar.Root>
        <Toolbar.Link href="#" onClick={onClick}>
          link
        </Toolbar.Link>
      </Toolbar.Root>,
    );
    const link = screen.getByText('link');
    act(() => {
      link.focus();
    });
    fireEvent.keyDown(link, { key: ' ' });
    act(() => {
      vi.runAllTimers();
    });
    expect(onClick).toHaveBeenCalled();
  });

  it('disabled item is skipped in keyboard navigation', () => {
    render(
      <Toolbar.Root>
        <Toolbar.Button>a</Toolbar.Button>
        <Toolbar.Button disabled>b</Toolbar.Button>
        <Toolbar.Button>c</Toolbar.Button>
      </Toolbar.Root>,
    );
    const a = screen.getByText('a');
    act(() => {
      a.focus();
    });
    fireEvent.keyDown(a, { key: 'ArrowRight' });
    act(() => {
      vi.runAllTimers();
    });
    expect(screen.getByText('c')).toHaveFocus();
  });

  it('ToggleGroup nested inside Toolbar defers keyboard to the toolbar', () => {
    render(
      <Toolbar.Root>
        <Toolbar.Button>a</Toolbar.Button>
        <Toolbar.ToggleGroup type="single">
          <Toolbar.ToggleItem value="bold">B</Toolbar.ToggleItem>
          <Toolbar.ToggleItem value="italic">I</Toolbar.ToggleItem>
        </Toolbar.ToggleGroup>
      </Toolbar.Root>,
    );
    const a = screen.getByText('a');
    act(() => {
      a.focus();
    });
    // toolbar's RovingFocusGroup should pick up B as the next item
    fireEvent.keyDown(a, { key: 'ArrowRight' });
    act(() => {
      vi.runAllTimers();
    });
    expect(screen.getByText('B')).toHaveFocus();
  });
});
