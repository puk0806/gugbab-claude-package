import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Toast } from './Toast';

function Rooted(props: React.ComponentProps<typeof Toast.Root>) {
  return (
    <Toast.Provider>
      <Toast.Root open {...props}>
        <Toast.Title>Saved</Toast.Title>
      </Toast.Root>
      <Toast.Viewport />
    </Toast.Provider>
  );
}

describe('Toast.Root — 소비자 이벤트 핸들러 보존', () => {
  it('onClickCapture 를 넘기면 일반 클릭에서 호출된다', () => {
    const onClickCapture = vi.fn();
    render(<Rooted onClickCapture={onClickCapture} />);
    fireEvent.click(screen.getByText('Saved'));
    expect(onClickCapture).toHaveBeenCalledTimes(1);
  });

  it('스와이프 직후 억제되는 클릭에서도 소비자 onClickCapture 는 호출된다 (경계)', () => {
    const onClickCapture = vi.fn();
    render(<Rooted onClickCapture={onClickCapture} />);
    const li = screen.getByText('Saved').closest('li') as HTMLLIElement;
    fireEvent.pointerDown(li, { clientX: 0, clientY: 0, pointerId: 1, button: 0 });
    fireEvent.pointerMove(li, { clientX: 10, clientY: 0, pointerId: 1 });
    fireEvent.pointerUp(li, { clientX: 10, clientY: 0, pointerId: 1 });
    fireEvent.click(li);
    expect(onClickCapture).toHaveBeenCalledTimes(1);
  });

  it('언마운트하면 클릭 억제 해제 타이머도 정리된다 (경계)', () => {
    vi.useFakeTimers();
    const { unmount } = render(<Rooted duration={Number.POSITIVE_INFINITY} />);
    const li = screen.getByText('Saved').closest('li') as HTMLLIElement;
    const before = vi.getTimerCount();
    fireEvent.pointerDown(li, { clientX: 0, clientY: 0, pointerId: 1, button: 0 });
    fireEvent.pointerMove(li, { clientX: 10, clientY: 0, pointerId: 1 });
    fireEvent.pointerUp(li, { clientX: 10, clientY: 0, pointerId: 1 });
    expect(vi.getTimerCount()).toBe(before + 1);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
    vi.useRealTimers();
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
