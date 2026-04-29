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

  it('aria-live is assertive for foreground, polite for background', () => {
    const { rerender } = render(<BasicToast type="foreground" title="A" />);
    expect(screen.getByTestId('toast').getAttribute('aria-live')).toBe('assertive');
    rerender(<BasicToast type="background" title="A" />);
    expect(screen.getByTestId('toast').getAttribute('aria-live')).toBe('polite');
  });

  it('viewport has role=region with accessible label', () => {
    render(<BasicToast />);
    const viewport = screen.getByTestId('viewport');
    expect(viewport).toHaveAttribute('role', 'region');
    expect(viewport).toHaveAttribute('aria-label');
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
