import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Popover } from './Popover';

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
      <Popover.Root>
        <Popover.Trigger>open</Popover.Trigger>
        <Popover.Portal>
          <Popover.Content aria-label="panel" onCloseAutoFocus={onCloseAutoFocus}>
            <button type="button">inside</button>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
      <input aria-label="outside" />
    </>
  );
}

function open() {
  fireEvent.click(screen.getByText('open'));
  flush();
  expect(screen.getByRole('dialog', { name: 'panel' })).toBeInTheDocument();
}

describe('Popover — 바깥 상호작용으로 닫힐 때 (WCAG 2.4.3)', () => {
  it('바깥 입력칸을 클릭하면 닫히고 포커스는 그 입력칸에 남는다 (트리거로 빼앗지 않음)', () => {
    render(<Harness />);
    open();
    const outside = screen.getByLabelText('outside');

    fireEvent.pointerDown(outside);
    act(() => outside.focus());
    flush();

    expect(screen.queryByRole('dialog', { name: 'panel' })).toBeNull();
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

    expect(screen.queryByRole('dialog', { name: 'panel' })).toBeNull();
    expect(document.activeElement).toBe(outside);
  });

  it('Escape 로 닫히면 기존대로 트리거로 포커스를 되돌린다 (회귀 방지)', () => {
    render(<Harness />);
    open();
    fireEvent.keyDown(document.activeElement ?? document.body, { key: 'Escape' });
    flush();

    expect(screen.queryByRole('dialog', { name: 'panel' })).toBeNull();
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

describe('Popover — 열린 트리거를 다시 누를 때 (경계)', () => {
  it('pointerdown 후 click 이 이어져도 닫힌 상태를 유지한다 (닫혔다 바로 재오픈 금지)', () => {
    render(<Harness />);
    open();
    const trigger = screen.getByText('open');

    fireEvent.pointerDown(trigger);
    fireEvent.mouseDown(trigger);
    fireEvent.click(trigger);
    flush();

    expect(screen.queryByRole('dialog', { name: 'panel' })).toBeNull();
  });

  it('닫힌 상태에서 트리거 클릭은 정상적으로 연다 (회귀 방지)', () => {
    render(<Harness />);
    open();
    fireEvent.keyDown(document.activeElement ?? document.body, { key: 'Escape' });
    flush();
    open();
  });
});

describe('Popover — 리뷰 반영 회귀 (모달·Anchor·빈 영역)', () => {
  it('모달 Popover 는 바깥 클릭으로 닫혀도 트리거로 포커스를 돌린다 (바깥은 포인터 차단)', () => {
    render(
      <>
        <Popover.Root modal>
          <Popover.Trigger>open</Popover.Trigger>
          <Popover.Portal>
            <Popover.Content aria-label="panel">
              <button type="button">inside</button>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
        <input aria-label="outside" />
      </>,
    );
    act(() => screen.getByText('open').focus());
    open();
    fireEvent.pointerDown(screen.getByLabelText('outside'));
    flush();
    expect(screen.queryByRole('dialog', { name: 'panel' })).toBeNull();
    expect(document.activeElement).toBe(screen.getByText('open'));
  });

  it('Anchor 를 써도 Escape 후 트리거로 돌아가고, 열린 트리거 재클릭은 닫힌 채 유지된다', () => {
    render(
      <Popover.Root>
        <Popover.Trigger>open</Popover.Trigger>
        {/* Anchor 가 트리거 뒤에서 setReference 를 덮어쓰는 순서 */}
        <Popover.Anchor>
          <span>anchor</span>
        </Popover.Anchor>
        <Popover.Portal>
          <Popover.Content aria-label="panel">
            <button type="button">inside</button>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>,
    );
    open();
    fireEvent.keyDown(document.activeElement ?? document.body, { key: 'Escape' });
    flush();
    expect(document.activeElement).toBe(screen.getByText('open'));

    open();
    const trigger = screen.getByText('open');
    fireEvent.pointerDown(trigger);
    fireEvent.click(trigger);
    flush();
    expect(screen.queryByRole('dialog', { name: 'panel' })).toBeNull();
  });

  it('포커스를 받지 않는 빈 영역을 클릭해 닫히면 body 에 버려두지 않고 트리거로 돌린다 (빈 값 경계)', () => {
    render(
      <>
        <Harness />
        <div data-testid="blank">blank</div>
      </>,
    );
    act(() => screen.getByText('open').focus());
    open();
    fireEvent.pointerDown(screen.getByTestId('blank'));
    flush();
    expect(screen.queryByRole('dialog', { name: 'panel' })).toBeNull();
    expect(document.activeElement).toBe(screen.getByText('open'));
  });
});

