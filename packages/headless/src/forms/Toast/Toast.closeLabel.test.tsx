import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Toast } from './Toast';

function IconClose({ closeLabel, ariaLabel }: { closeLabel?: string; ariaLabel?: string }) {
  return (
    <Toast.Provider closeLabel={closeLabel}>
      <Toast.Root open>
        <Toast.Title>Saved</Toast.Title>
        <Toast.Close aria-label={ariaLabel} />
      </Toast.Root>
      <Toast.Viewport />
    </Toast.Provider>
  );
}

describe('Toast.Close — 아이콘 버튼 접근성 이름 현지화', () => {
  it('기본 이름은 "Close" 다 (하위 호환)', () => {
    render(<IconClose />);
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
  });

  it('Provider 의 closeLabel 로 현지화한다', () => {
    render(<IconClose closeLabel="닫기" />);
    expect(screen.getByRole('button', { name: '닫기' })).toBeInTheDocument();
  });

  it('버튼에 직접 준 aria-label 이 closeLabel 보다 우선한다', () => {
    render(<IconClose closeLabel="닫기" ariaLabel="알림 닫기" />);
    expect(screen.getByRole('button', { name: '알림 닫기' })).toBeInTheDocument();
  });

  it('빈 closeLabel 은 이름 없는 버튼 대신 기본값을 쓴다 (경계)', () => {
    render(<IconClose closeLabel="   " />);
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
  });

  it('보이는 텍스트가 있으면 aria-label 을 붙이지 않는다', () => {
    render(
      <Toast.Provider closeLabel="닫기">
        <Toast.Root open>
          <Toast.Close>Dismiss</Toast.Close>
        </Toast.Root>
        <Toast.Viewport />
      </Toast.Provider>,
    );
    expect(screen.getByRole('button', { name: 'Dismiss' })).not.toHaveAttribute('aria-label');
  });

  it('Root 밖의 Close 는 명확한 에러로 거부한다 (오용)', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Toast.Close />)).toThrow();
    spy.mockRestore();
  });
});
