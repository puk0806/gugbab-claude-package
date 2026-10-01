/**
 * Regressions found in the priority-4 review: focus after a rejected outside
 * dismiss, non-modal Dialog focus after an outside click, RadioGroup `dir`
 * attribute without an explicit direction.
 */
import { act, fireEvent, render, screen } from '@testing-library/react';
import { useRef, useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Dialog } from './overlays/Dialog';
import { Popover } from './overlays/Popover';
import { DirectionProvider } from './shared';
import { RadioGroup } from './stateful/RadioGroup';

beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }));
afterEach(() => vi.useRealTimers());

function flush() {
  act(() => {
    vi.runOnlyPendingTimers();
  });
}

describe('Popover — 바깥 닫힘을 거부한 뒤 Escape 로 닫기 (경계)', () => {
  function Guarded() {
    const [open, setOpen] = useState(true);
    const outsideRef = useRef(false);
    return (
      <>
        <button type="button">outside</button>
        <Popover.Root
          open={open}
          onOpenChange={(next) => {
            // Reject outside-dismiss (e.g. "discard changes?"); allow Escape.
            if (!next && outsideRef.current) {
              outsideRef.current = false;
              return;
            }
            setOpen(next);
          }}
        >
          <Popover.Trigger>open</Popover.Trigger>
          <Popover.Portal>
            <Popover.Content aria-label="details" onInteractOutside={() => {
                outsideRef.current = true;
              }}>
              <button type="button">inside</button>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      </>
    );
  }

  it('거부된 바깥 상호작용 뒤 Escape 로 닫으면 트리거로 포커스가 돌아온다', () => {
    render(<Guarded />);
    flush();
    const outside = screen.getByText('outside');
    fireEvent.pointerDown(outside);
    outside.focus();
    fireEvent.pointerUp(outside);
    fireEvent.click(outside);
    flush();
    expect(screen.getByText('inside')).toBeInTheDocument(); // still open
    const inside = screen.getByText('inside');
    inside.focus();
    fireEvent.keyDown(inside, { key: 'Escape' });
    flush();
    flush();
    expect(document.activeElement).toBe(screen.getByText('open'));
  });
});

describe('Dialog (비모달) — 바깥 클릭으로 닫힐 때 포커스', () => {
  it('바깥의 다른 컨트롤을 눌러 닫으면 포커스를 그 컨트롤에 둔다 (Radix 동일)', () => {
    render(
      <>
        <button type="button">elsewhere</button>
        <Dialog.Root modal={false} defaultOpen>
          <Dialog.Trigger>open dialog</Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Content>
              <Dialog.Title>Settings</Dialog.Title>
              <button type="button">inside</button>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </>,
    );
    flush();
    const elsewhere = screen.getByText('elsewhere');
    fireEvent.pointerDown(elsewhere);
    elsewhere.focus();
    fireEvent.pointerUp(elsewhere);
    fireEvent.click(elsewhere);
    flush();
    flush();
    expect(screen.queryByText('Settings')).toBeNull();
    expect(document.activeElement).toBe(elsewhere);
  });

  it('비모달이라도 Escape 로 닫으면 트리거로 돌아간다', () => {
    render(
      <Dialog.Root modal={false} defaultOpen>
        <Dialog.Trigger>open dialog</Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Content>
            <Dialog.Title>Settings</Dialog.Title>
            <button type="button">inside</button>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>,
    );
    flush();
    const inside = screen.getByText('inside');
    inside.focus();
    fireEvent.keyDown(inside, { key: 'Escape' });
    flush();
    flush();
    expect(document.activeElement).toBe(screen.getByText('open dialog'));
  });
});

describe('RadioGroup — dir 속성 렌더링', () => {
  const Group = (props: { dir?: 'ltr' | 'rtl' }) => (
    <RadioGroup.Root aria-label="size" data-testid="g" {...props}>
      <RadioGroup.Item value="s">S</RadioGroup.Item>
    </RadioGroup.Root>
  );

  it('prop·Provider 가 없으면 dir 를 렌더링하지 않아 <html dir> 을 상속한다', () => {
    render(<Group />);
    expect(screen.getByTestId('g')).not.toHaveAttribute('dir');
  });

  it('dir prop 을 주면 렌더링한다', () => {
    render(<Group dir="rtl" />);
    expect(screen.getByTestId('g')).toHaveAttribute('dir', 'rtl');
  });

  it('DirectionProvider 가 있으면 그 값을 렌더링한다', () => {
    render(
      <DirectionProvider dir="rtl">
        <Group />
      </DirectionProvider>,
    );
    expect(screen.getByTestId('g')).toHaveAttribute('dir', 'rtl');
  });

  it('Root 밖의 Item 은 명확한 에러로 거부한다 (오용)', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<RadioGroup.Item value="x">X</RadioGroup.Item>)).toThrow();
    spy.mockRestore();
  });
});
