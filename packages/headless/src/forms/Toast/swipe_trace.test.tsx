import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Toast } from './Toast';

// jsdom's fireEvent drops PointerEvent coordinates — dispatch native events.
function pointer(type: 'pointerdown' | 'pointermove' | 'pointerup', el: HTMLElement, x: number) {
  el.dispatchEvent(
    new PointerEvent(type, {
      bubbles: true,
      cancelable: true,
      button: 0,
      clientX: x,
      clientY: 0,
      pointerId: 1,
    }),
  );
}

function swipeBelowThreshold(el: HTMLElement) {
  act(() => {
    pointer('pointerdown', el, 0);
    pointer('pointermove', el, 20);
    pointer('pointerup', el, 20);
  });
}

function Harness() {
  return (
    <Toast.Provider swipeDirection="right" swipeThreshold={50}>
      <Toast.Root open data-testid="toast">
        <Toast.Title>title</Toast.Title>
        <a href="#details">details</a>
      </Toast.Root>
      <Toast.Viewport />
    </Toast.Provider>
  );
}

describe('Toast — 스와이프 뒤 클릭 억제 범위 (경계)', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('스와이프 직후 이어지는 click 은 억제한다 (드래그가 클릭으로 오인되지 않게)', () => {
    render(<Harness />);
    swipeBelowThreshold(screen.getByTestId('toast'));
    const notPrevented = fireEvent.click(screen.getByText('details'));
    expect(notPrevented).toBe(false);
  });

  it('스와이프 뒤 click 이 오지 않았다면, 나중의 정상 클릭을 막지 않는다 (남는 리스너 금지)', () => {
    render(<Harness />);
    swipeBelowThreshold(screen.getByTestId('toast'));
    act(() => {
      vi.runAllTimers();
    });
    const notPrevented = fireEvent.click(screen.getByText('details'));
    expect(notPrevented).toBe(true);
  });

  it('스와이프 없는 단순 클릭은 막지 않는다 (회귀 방지)', () => {
    render(<Harness />);
    expect(fireEvent.click(screen.getByText('details'))).toBe(true);
  });

  it('Provider 밖의 Root 는 명확한 에러로 거부한다 (오용)', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() =>
      render(
        <Toast.Root open>
          <Toast.Title>x</Toast.Title>
        </Toast.Root>,
      ),
    ).toThrow();
    spy.mockRestore();
  });
});
