import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DirectionProvider } from '../../shared/DirectionProvider';
import { Toolbar } from './Toolbar';

describe('Toolbar', () => {
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
    a.focus();
    fireEvent.keyDown(a, { key: 'ArrowRight' });
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
    b.focus();
    fireEvent.keyDown(b, { key: 'ArrowRight' });
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
    b.focus();
    fireEvent.keyDown(b, { key: 'Home' });
    expect(screen.getByText('a')).toHaveFocus();
    fireEvent.keyDown(screen.getByText('a'), { key: 'End' });
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
    a.focus();
    fireEvent.keyDown(a, { key: 'ArrowLeft' });
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
    a.focus();
    fireEvent.keyDown(a, { key: 'ArrowDown' });
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
    link.focus();
    fireEvent.keyDown(link, { key: ' ' });
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
    a.focus();
    fireEvent.keyDown(a, { key: 'ArrowRight' });
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
    a.focus();
    // toolbar's keyboard handler should pick up B as the next sibling
    fireEvent.keyDown(a, { key: 'ArrowRight' });
    expect(screen.getByText('B')).toHaveFocus();
  });
});
