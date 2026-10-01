import { act, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Dialog } from './Dialog';

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
    <Dialog.Root>
      <Dialog.Trigger>open</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay />
        <Dialog.Content onCloseAutoFocus={onCloseAutoFocus}>
          <Dialog.Title>title</Dialog.Title>
          <Dialog.Description>desc</Dialog.Description>
          <Dialog.Close>close</Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

describe('Dialog — 닫힌 뒤 트리거로 포커스 복귀 (WCAG 2.4.3, APG Dialog)', () => {
  it('클릭이 트리거에 포커스를 주지 않는 환경(Safari)에서도 닫히면 트리거로 돌아간다', () => {
    render(<Harness />);
    // jsdom 의 click 은 Safari 처럼 버튼에 포커스를 주지 않는다 → 열 때 activeElement 는 body
    fireEvent.click(screen.getByText('open'));
    flush();
    expect(document.activeElement).not.toBe(document.body);

    fireEvent.click(screen.getByText('close'));
    flush();

    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(screen.getByText('open'));
  });

  it('Escape 로 닫아도 트리거로 돌아간다', () => {
    render(<Harness />);
    fireEvent.click(screen.getByText('open'));
    flush();
    fireEvent.keyDown(document.activeElement ?? document.body, { key: 'Escape' });
    flush();
    expect(document.activeElement).toBe(screen.getByText('open'));
  });

  it('소비자가 onCloseAutoFocus 에서 preventDefault 하면 트리거로 옮기지 않는다 (제어권 존중)', () => {
    render(<Harness onCloseAutoFocus={(e) => e.preventDefault()} />);
    fireEvent.click(screen.getByText('open'));
    flush();
    fireEvent.click(screen.getByText('close'));
    flush();
    expect(document.activeElement).not.toBe(screen.getByText('open'));
  });

  it('Trigger 없이 제어형으로 열면, 닫힐 때 열기 전 포커스 요소로 돌아간다 (body 로 잃지 않음)', () => {
    function Controlled() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>
            external
          </button>
          <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Portal>
              <Dialog.Content>
                <Dialog.Title>title</Dialog.Title>
                <Dialog.Description>desc</Dialog.Description>
                <Dialog.Close>close</Dialog.Close>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </>
      );
    }
    render(<Controlled />);
    const external = screen.getByText('external');
    act(() => external.focus());
    fireEvent.click(external);
    flush();
    fireEvent.click(screen.getByText('close'));
    flush();
    expect(document.activeElement).toBe(external);
  });

  it('Root 밖의 Content 는 명확한 에러로 거부한다 (오용)', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Dialog.Content>x</Dialog.Content>)).toThrow('must be used inside');
    spy.mockRestore();
  });
});
