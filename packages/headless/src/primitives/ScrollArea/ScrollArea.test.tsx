import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ScrollArea } from './ScrollArea';

describe('ScrollArea', () => {
  it('Root renders a relative-positioned div', () => {
    render(
      <ScrollArea.Root data-testid="r">
        <ScrollArea.Viewport>content</ScrollArea.Viewport>
      </ScrollArea.Root>,
    );
    expect(screen.getByTestId('r').style.position).toBe('relative');
  });

  it('Viewport applies overflow:scroll', () => {
    render(
      <ScrollArea.Root>
        <ScrollArea.Viewport data-testid="v">content</ScrollArea.Viewport>
      </ScrollArea.Root>,
    );
    expect(screen.getByTestId('v').style.overflow).toBe('scroll');
  });

  it('Scrollbar renders with role="scrollbar" and aria-orientation', () => {
    render(
      <ScrollArea.Root type="always">
        <ScrollArea.Viewport>content</ScrollArea.Viewport>
        <ScrollArea.Scrollbar orientation="vertical" data-testid="sb-v">
          <ScrollArea.Thumb />
        </ScrollArea.Scrollbar>
      </ScrollArea.Root>,
    );
    const sb = screen.getByTestId('sb-v');
    expect(sb.getAttribute('role')).toBe('scrollbar');
    expect(sb.getAttribute('aria-orientation')).toBe('vertical');
    expect(sb.getAttribute('data-orientation')).toBe('vertical');
  });

  it('Scrollbar with type="auto" hides when content does not overflow', () => {
    // jsdom returns 0 for scrollHeight/clientHeight unless layout is provided
    render(
      <ScrollArea.Root type="auto">
        <ScrollArea.Viewport>content</ScrollArea.Viewport>
        <ScrollArea.Scrollbar orientation="vertical" data-testid="sb-v">
          <ScrollArea.Thumb />
        </ScrollArea.Scrollbar>
      </ScrollArea.Root>,
    );
    // No overflow → scrollbar is rendered (auto means visible when overflow), but in
    // jsdom layout is zero, so it is treated as no overflow → null.
    expect(screen.queryByTestId('sb-v')).toBeNull();
  });

  it('Scrollbar with type="always" is visible regardless of overflow', () => {
    render(
      <ScrollArea.Root type="always">
        <ScrollArea.Viewport>content</ScrollArea.Viewport>
        <ScrollArea.Scrollbar orientation="vertical" data-testid="sb-v">
          <ScrollArea.Thumb data-testid="thumb" />
        </ScrollArea.Scrollbar>
      </ScrollArea.Root>,
    );
    expect(screen.getByTestId('sb-v')).toBeInTheDocument();
    expect(screen.getByTestId('thumb')).toBeInTheDocument();
  });

  it('Corner renders only when both vertical and horizontal scrollbars exist', () => {
    const { rerender } = render(
      <ScrollArea.Root type="always">
        <ScrollArea.Viewport>content</ScrollArea.Viewport>
        <ScrollArea.Scrollbar orientation="vertical">
          <ScrollArea.Thumb />
        </ScrollArea.Scrollbar>
        <ScrollArea.Corner data-testid="corner" />
      </ScrollArea.Root>,
    );
    expect(screen.queryByTestId('corner')).toBeNull();

    rerender(
      <ScrollArea.Root type="always">
        <ScrollArea.Viewport>content</ScrollArea.Viewport>
        <ScrollArea.Scrollbar orientation="vertical">
          <ScrollArea.Thumb />
        </ScrollArea.Scrollbar>
        <ScrollArea.Scrollbar orientation="horizontal">
          <ScrollArea.Thumb />
        </ScrollArea.Scrollbar>
        <ScrollArea.Corner data-testid="corner" />
      </ScrollArea.Root>,
    );
    expect(screen.getByTestId('corner')).toBeInTheDocument();
  });

  it('Viewport scroll triggers metrics recompute (no error)', () => {
    render(
      <ScrollArea.Root type="always">
        <ScrollArea.Viewport data-testid="v">content</ScrollArea.Viewport>
        <ScrollArea.Scrollbar orientation="vertical">
          <ScrollArea.Thumb />
        </ScrollArea.Scrollbar>
      </ScrollArea.Root>,
    );
    fireEvent.scroll(screen.getByTestId('v'));
    // smoke — no error thrown
    expect(screen.getByTestId('v')).toBeInTheDocument();
  });
});
