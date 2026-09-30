import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DirectionProvider } from '../../shared/DirectionProvider';
import { DropdownMenu } from './DropdownMenu';

beforeEach(() => {
  vi.useFakeTimers();
});
afterEach(() => {
  vi.runOnlyPendingTimers();
  vi.useRealTimers();
});

function flush() {
  act(() => {
    vi.runAllTimers();
  });
}

function Menu() {
  return (
    <DropdownMenu.Root defaultOpen>
      <DropdownMenu.Trigger>menu</DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Item>first</DropdownMenu.Item>
        <DropdownMenu.Sub>
          <DropdownMenu.SubTrigger>more</DropdownMenu.SubTrigger>
          <DropdownMenu.SubContent>
            <DropdownMenu.Item>nested</DropdownMenu.Item>
          </DropdownMenu.SubContent>
        </DropdownMenu.Sub>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}

function pressOnSubTrigger(key: string) {
  const subTrigger = screen.getByText('more');
  act(() => subTrigger.focus());
  fireEvent.keyDown(subTrigger, { key });
  flush();
}

describe('DropdownMenu 서브메뉴 — 방향별 열기 키 (WCAG 2.1.1, APG Menu)', () => {
  it('LTR: ArrowRight 로 서브메뉴가 열린다 (회귀 방지)', () => {
    render(<Menu />);
    flush();
    pressOnSubTrigger('ArrowRight');
    expect(screen.getByText('nested')).toBeInTheDocument();
  });

  it('RTL: ArrowLeft 로 서브메뉴가 열린다 (서브메뉴가 왼쪽에 펼쳐지므로)', () => {
    render(
      <DirectionProvider dir="rtl">
        <Menu />
      </DirectionProvider>,
    );
    flush();
    pressOnSubTrigger('ArrowLeft');
    expect(screen.getByText('nested')).toBeInTheDocument();
  });

  it('RTL: ArrowRight 로는 서브메뉴가 열리지 않는다 (반대 방향 키 오작동 방지)', () => {
    render(
      <DirectionProvider dir="rtl">
        <Menu />
      </DirectionProvider>,
    );
    flush();
    pressOnSubTrigger('ArrowRight');
    expect(screen.queryByText('nested')).toBeNull();
  });

  it('비활성 SubTrigger 는 RTL ArrowLeft 로도 열리지 않는다 (경계)', () => {
    render(
      <DirectionProvider dir="rtl">
        <DropdownMenu.Root defaultOpen>
          <DropdownMenu.Trigger>menu</DropdownMenu.Trigger>
          <DropdownMenu.Content>
            <DropdownMenu.Sub>
              <DropdownMenu.SubTrigger disabled>more</DropdownMenu.SubTrigger>
              <DropdownMenu.SubContent>
                <DropdownMenu.Item>nested</DropdownMenu.Item>
              </DropdownMenu.SubContent>
            </DropdownMenu.Sub>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </DirectionProvider>,
    );
    flush();
    pressOnSubTrigger('ArrowLeft');
    expect(screen.queryByText('nested')).toBeNull();
  });

  it('비활성 SubTrigger 는 hover 로도 서브메뉴를 열지 않는다 (경계)', () => {
    render(
      <DropdownMenu.Root defaultOpen>
        <DropdownMenu.Trigger>menu</DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Sub>
            <DropdownMenu.SubTrigger disabled>more</DropdownMenu.SubTrigger>
            <DropdownMenu.SubContent>
              <DropdownMenu.Item>nested</DropdownMenu.Item>
            </DropdownMenu.SubContent>
          </DropdownMenu.Sub>
        </DropdownMenu.Content>
      </DropdownMenu.Root>,
    );
    flush();
    const subTrigger = screen.getByText('more');
    fireEvent.mouseEnter(subTrigger);
    fireEvent.mouseMove(subTrigger);
    flush();
    expect(screen.queryByText('nested')).toBeNull();
  });

  it('Root 밖의 SubTrigger 는 명확한 에러로 거부한다 (오용)', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<DropdownMenu.SubTrigger>x</DropdownMenu.SubTrigger>)).toThrow('must be used inside');
    spy.mockRestore();
  });
});
