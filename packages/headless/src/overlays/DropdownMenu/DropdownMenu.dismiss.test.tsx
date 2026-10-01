import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DropdownMenu } from './DropdownMenu';

// DismissableLayer · FocusScope defer work with setTimeout(0).
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

function Harness({ onCloseAutoFocus }: { onCloseAutoFocus?: (e: Event) => void }) {
  return (
    <>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>open</DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content aria-label="panel" onCloseAutoFocus={onCloseAutoFocus}>
            <DropdownMenu.Item>inside</DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
      <input aria-label="outside" />
    </>
  );
}

function open() {
  fireEvent.click(screen.getByText('open'));
  flush();
  expect(screen.getByText('inside')).toBeInTheDocument();
}

describe('DropdownMenu — 바깥 상호작용으로 닫힐 때 (WCAG 2.4.3)', () => {
  it('바깥 입력칸을 클릭하면 닫히고 포커스는 그 입력칸에 남는다 (트리거로 빼앗지 않음)', () => {
    render(<Harness />);
    open();
    const outside = screen.getByLabelText('outside');

    fireEvent.pointerDown(outside);
    act(() => outside.focus());
    flush();

    expect(screen.queryByText('inside')).toBeNull();
    expect(document.activeElement).toBe(outside);
  });

  it('트리거에 포커스가 있던 상태(Chrome 클릭)에서도 바깥 클릭 후 포커스를 빼앗지 않는다', () => {
    render(<Harness />);
    const trigger = screen.getByText('open');
    act(() => trigger.focus());
    open();
    const outside = screen.getByLabelText('outside');

    fireEvent.pointerDown(outside);
    act(() => outside.focus());
    flush();

    expect(screen.queryByText('inside')).toBeNull();
    expect(document.activeElement).toBe(outside);
  });

  it('Escape 로 닫히면 기존대로 트리거로 포커스를 되돌린다 (회귀 방지)', () => {
    render(<Harness />);
    open();
    fireEvent.keyDown(document.activeElement ?? document.body, { key: 'Escape' });
    flush();

    expect(screen.queryByText('inside')).toBeNull();
    expect(document.activeElement).toBe(screen.getByText('open'));
  });

  it('소비자의 onCloseAutoFocus 는 바깥 클릭으로 닫힐 때도 호출된다 (콜백 계약 유지)', () => {
    const onCloseAutoFocus = vi.fn();
    render(<Harness onCloseAutoFocus={onCloseAutoFocus} />);
    open();
    fireEvent.pointerDown(screen.getByLabelText('outside'));
    flush();
    expect(onCloseAutoFocus).toHaveBeenCalledTimes(1);
  });
});

describe('DropdownMenu — 열린 트리거를 다시 누를 때 (경계)', () => {
  it('pointerdown 후 click 이 이어져도 닫힌 상태를 유지한다 (닫혔다 바로 재오픈 금지)', () => {
    render(<Harness />);
    open();
    const trigger = screen.getByText('open');

    fireEvent.pointerDown(trigger);
    fireEvent.mouseDown(trigger);
    fireEvent.click(trigger);
    flush();

    expect(screen.queryByText('inside')).toBeNull();
  });

  it('닫힌 상태에서 트리거 클릭은 정상적으로 연다 (회귀 방지)', () => {
    render(<Harness />);
    open();
    fireEvent.keyDown(document.activeElement ?? document.body, { key: 'Escape' });
    flush();
    open();
  });
});
