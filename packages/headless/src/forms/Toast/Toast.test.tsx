import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Toast } from './Toast';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function BasicToast({
  open = true,
  onOpenChange,
  type,
  title = 'Saved',
  description,
  duration,
}: {
  open?: boolean;
  onOpenChange?: (v: boolean) => void;
  type?: 'foreground' | 'background';
  title?: string;
  description?: string;
  duration?: number;
}) {
  return (
    <Toast.Provider>
      <Toast.Root
        open={open}
        onOpenChange={onOpenChange}
        type={type}
        duration={duration}
        data-testid="toast"
      >
        <Toast.Title>{title}</Toast.Title>
        {description && <Toast.Description>{description}</Toast.Description>}
        <Toast.Close>닫기</Toast.Close>
      </Toast.Root>
      <Toast.Viewport data-testid="viewport" />
    </Toast.Provider>
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Toast', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('renders title and description when open', () => {
    render(<BasicToast title="저장됨" description="변경 사항이 저장되었습니다" />);
    expect(screen.getByText('저장됨')).toBeInTheDocument();
    expect(screen.getByText('변경 사항이 저장되었습니다')).toBeInTheDocument();
  });

  it('does not render when open=false', () => {
    render(<BasicToast open={false} title="숨김" />);
    expect(screen.queryByText('숨김')).toBeNull();
  });

  it('calls onOpenChange(false) when Close is clicked', () => {
    const spy = vi.fn();
    render(<BasicToast onOpenChange={spy} title="닫기테스트" />);
    fireEvent.click(screen.getByText('닫기'));
    expect(spy).toHaveBeenCalledWith(false);
  });

  it('Announcer 의 aria-live 는 foreground=assertive, background=polite (단일 낭독 채널)', () => {
    const { rerender } = render(<BasicToast type="foreground" title="A" />);
    const live = () => Array.from(document.querySelectorAll('[aria-live]'));
    expect(live().map((el) => el.getAttribute('aria-live'))).toEqual(['assertive']);
    rerender(<BasicToast type="background" title="A" />);
    expect(live().map((el) => el.getAttribute('aria-live'))).toEqual(['polite']);
  });

  it('토스트 <li> 자체는 낭독 영역이 아니다 (이중 낭독·허용되지 않은 role 방지)', () => {
    render(<BasicToast />);
    const toast = screen.getByTestId('toast');
    expect(toast.tagName).toBe('LI');
    expect(toast).not.toHaveAttribute('role');
    expect(toast).not.toHaveAttribute('aria-live');
  });

  it('viewport 랜드마크(region)는 래퍼에 있고 <ol> 은 목록 의미를 유지한다', () => {
    render(<BasicToast />);
    const viewport = screen.getByTestId('viewport');
    expect(viewport.tagName).toBe('OL');
    expect(viewport).not.toHaveAttribute('role');
    const region = screen.getByRole('region');
    expect(region).toHaveAttribute('aria-label');
    expect(region.contains(viewport)).toBe(true);
  });

  it('auto-dismisses after duration', () => {
    const spy = vi.fn();
    render(<BasicToast duration={3000} onOpenChange={spy} title="자동닫힘" />);
    expect(screen.getByText('자동닫힘')).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(spy).toHaveBeenCalledWith(false);
  });

  it('data-state=open when open, data-state=closed when closed', () => {
    const { rerender } = render(<BasicToast open={true} title="상태" />);
    expect(screen.getByTestId('toast')).toHaveAttribute('data-state', 'open');
    rerender(<BasicToast open={false} title="상태" />);
    expect(screen.queryByTestId('toast')).toBeNull();
  });
});
