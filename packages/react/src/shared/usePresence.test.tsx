import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { usePresence } from './usePresence';

function Probe({ present }: { present: boolean }) {
  const { mounted, presenceRef } = usePresence(present);
  if (!mounted) return null;
  return (
    <div ref={presenceRef} data-testid="el">
      x
    </div>
  );
}

describe('usePresence', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('starts mounted when initial present=true', () => {
    render(<Probe present />);
    expect(screen.getByTestId('el')).toBeInTheDocument();
  });

  it('starts unmounted when initial present=false', () => {
    render(<Probe present={false} />);
    expect(screen.queryByTestId('el')).toBeNull();
  });

  it('mounts immediately when present transitions false → true', () => {
    const { rerender } = render(<Probe present={false} />);
    rerender(<Probe present />);
    expect(screen.getByTestId('el')).toBeInTheDocument();
  });

  it('unmounts immediately when no animation/transition is active', () => {
    const { rerender } = render(<Probe present />);
    rerender(<Probe present={false} />);
    expect(screen.queryByTestId('el')).toBeNull();
  });

  it('defers unmount until animationend when an animation is active', () => {
    vi.spyOn(window, 'getComputedStyle').mockImplementation(
      () =>
        ({
          animationName: 'fadeOut',
          animationDuration: '200ms',
          transitionDuration: '0s',
        }) as CSSStyleDeclaration,
    );

    const { rerender } = render(<Probe present />);
    const el = screen.getByTestId('el');
    rerender(<Probe present={false} />);

    // still mounted while animation runs
    expect(screen.getByTestId('el')).toBeInTheDocument();

    fireEvent.animationEnd(el, { animationName: 'fadeOut' });
    expect(screen.queryByTestId('el')).toBeNull();
  });

  it('defers unmount until transitionend when a transition is active', () => {
    vi.spyOn(window, 'getComputedStyle').mockImplementation(
      () =>
        ({
          animationName: 'none',
          animationDuration: '0s',
          transitionDuration: '0.3s',
        }) as CSSStyleDeclaration,
    );

    const { rerender } = render(<Probe present />);
    const el = screen.getByTestId('el');
    rerender(<Probe present={false} />);

    expect(screen.getByTestId('el')).toBeInTheDocument();

    fireEvent.transitionEnd(el, {});
    expect(screen.queryByTestId('el')).toBeNull();
  });
});
