import { fireEvent, render, screen } from '@testing-library/react';
import { useRef } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Presence } from './Presence';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Presence — element children', () => {
  it('renders the child when present=true', () => {
    render(
      <Presence present={true}>
        <div data-testid="el">x</div>
      </Presence>,
    );
    expect(screen.getByTestId('el')).toBeInTheDocument();
  });

  it('does not render the child when present=false initially', () => {
    render(
      <Presence present={false}>
        <div data-testid="el">x</div>
      </Presence>,
    );
    expect(screen.queryByTestId('el')).toBeNull();
  });

  it('mounts the child when present transitions false → true', () => {
    const { rerender } = render(
      <Presence present={false}>
        <div data-testid="el">x</div>
      </Presence>,
    );
    rerender(
      <Presence present={true}>
        <div data-testid="el">x</div>
      </Presence>,
    );
    expect(screen.getByTestId('el')).toBeInTheDocument();
  });

  it('unmounts immediately when no CSS animation/transition is detected', () => {
    const { rerender } = render(
      <Presence present={true}>
        <div data-testid="el">x</div>
      </Presence>,
    );
    rerender(
      <Presence present={false}>
        <div data-testid="el">x</div>
      </Presence>,
    );
    expect(screen.queryByTestId('el')).toBeNull();
  });

  it('defers unmount until animationend when an animation is running', () => {
    vi.spyOn(window, 'getComputedStyle').mockImplementation(
      () =>
        ({
          animationName: 'fadeOut',
          animationDuration: '200ms',
          transitionDuration: '0s',
        }) as CSSStyleDeclaration,
    );
    const { rerender } = render(
      <Presence present={true}>
        <div data-testid="el">x</div>
      </Presence>,
    );
    const el = screen.getByTestId('el');
    rerender(
      <Presence present={false}>
        <div data-testid="el">x</div>
      </Presence>,
    );
    expect(screen.getByTestId('el')).toBeInTheDocument();
    fireEvent.animationEnd(el, { animationName: 'fadeOut' });
    expect(screen.queryByTestId('el')).toBeNull();
  });

  it('forwards refs onto the child element', () => {
    function Tree({ present }: { present: boolean }) {
      const ref = useRef<HTMLDivElement | null>(null);
      return (
        <Presence present={present}>
          <div ref={ref} data-testid="el">
            {ref.current ? 'attached' : 'pending'}
          </div>
        </Presence>
      );
    }
    render(<Tree present={true} />);
    expect(screen.getByTestId('el')).toBeInTheDocument();
  });
});

describe('Presence — function children', () => {
  it('passes the live present boolean to the function', () => {
    const { rerender } = render(
      <Presence present={true}>
        {(present) => (
          <div data-testid="el" data-present={present ? 'true' : 'false'}>
            {present ? 'open' : 'closed'}
          </div>
        )}
      </Presence>,
    );
    expect(screen.getByTestId('el').getAttribute('data-present')).toBe('true');
    expect(screen.getByTestId('el').textContent).toBe('open');

    rerender(
      <Presence present={false}>
        {(present) => (
          <div data-testid="el" data-present={present ? 'true' : 'false'}>
            {present ? 'open' : 'closed'}
          </div>
        )}
      </Presence>,
    );
    // No animation → unmounts immediately
    expect(screen.queryByTestId('el')).toBeNull();
  });

  it('keeps the element rendered with present=false during exit animation, with function children', () => {
    vi.spyOn(window, 'getComputedStyle').mockImplementation(
      () =>
        ({
          animationName: 'fadeOut',
          animationDuration: '200ms',
          transitionDuration: '0s',
        }) as CSSStyleDeclaration,
    );

    const { rerender } = render(
      <Presence present={true}>
        {(present) => (
          <div data-testid="el" data-state={present ? 'open' : 'closed'}>
            x
          </div>
        )}
      </Presence>,
    );
    const el = screen.getByTestId('el');
    rerender(
      <Presence present={false}>
        {(present) => (
          <div data-testid="el" data-state={present ? 'open' : 'closed'}>
            x
          </div>
        )}
      </Presence>,
    );
    // Element still rendered, but data-state reflects the new (closing) value
    expect(screen.getByTestId('el')).toBeInTheDocument();
    expect(el.getAttribute('data-state')).toBe('closed');

    fireEvent.animationEnd(el, { animationName: 'fadeOut' });
    expect(screen.queryByTestId('el')).toBeNull();
  });
});
