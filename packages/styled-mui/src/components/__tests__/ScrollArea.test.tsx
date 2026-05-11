import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ScrollArea } from '../ScrollArea';

describe('ScrollArea (styled-mui)', () => {
  it('Root applies gmui-scroll-area', () => {
    const { container } = render(<ScrollArea.Root data-testid="root" />);
    expect(container.querySelector('[data-testid="root"]')).toHaveClass('gmui-scroll-area');
  });

  it('Viewport / Scrollbar / Thumb have BEM classes', () => {
    // forceMount 로 Scrollbar 의 가시성 게이팅을 우회 — jsdom 환경에서는 viewport
    // metrics 가 0 이라 overflow 분기로는 Scrollbar 가 렌더되지 않는다.
    const { container } = render(
      <ScrollArea.Root>
        <ScrollArea.Viewport data-testid="viewport">content</ScrollArea.Viewport>
        <ScrollArea.Scrollbar data-testid="scrollbar" orientation="vertical" forceMount>
          <ScrollArea.Thumb data-testid="thumb" />
        </ScrollArea.Scrollbar>
      </ScrollArea.Root>,
    );
    expect(container.querySelector('[data-testid="viewport"]')).toHaveClass(
      'gmui-scroll-area__viewport',
    );
    expect(container.querySelector('[data-testid="scrollbar"]')).toHaveClass(
      'gmui-scroll-area__scrollbar',
    );
    expect(container.querySelector('[data-testid="thumb"]')).toHaveClass('gmui-scroll-area__thumb');
  });

  it('Corner exposes BEM class when both axes are mounted', () => {
    // Corner 는 vertical+horizontal Scrollbar 양쪽이 모두 등록될 때만 렌더된다.
    const { container } = render(
      <ScrollArea.Root>
        <ScrollArea.Viewport>content</ScrollArea.Viewport>
        <ScrollArea.Scrollbar orientation="vertical" forceMount>
          <ScrollArea.Thumb />
        </ScrollArea.Scrollbar>
        <ScrollArea.Scrollbar orientation="horizontal" forceMount>
          <ScrollArea.Thumb />
        </ScrollArea.Scrollbar>
        <ScrollArea.Corner data-testid="corner" />
      </ScrollArea.Root>,
    );
    expect(container.querySelector('[data-testid="corner"]')).toHaveClass(
      'gmui-scroll-area__corner',
    );
  });
});
