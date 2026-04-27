import { fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Slot } from './Slot';

describe('Slot', () => {
  it('renders the child element and merges className onto it', () => {
    render(
      <Slot className="slot-class" data-testid="s">
        <button type="button" className="btn-class">
          click
        </button>
      </Slot>,
    );
    const btn = screen.getByTestId('s');
    expect(btn.tagName).toBe('BUTTON');
    expect(btn.className).toContain('slot-class');
    expect(btn.className).toContain('btn-class');
  });

  it('calls both the slot handler and the child handler on event', () => {
    const slotClick = vi.fn();
    const childClick = vi.fn();
    render(
      <Slot onClick={slotClick}>
        <button type="button" onClick={childClick}>
          x
        </button>
      </Slot>,
    );
    fireEvent.click(screen.getByText('x'));
    expect(slotClick).toHaveBeenCalledTimes(1);
    expect(childClick).toHaveBeenCalledTimes(1);
  });

  it('skips the slot handler if the child handler prevents default', () => {
    const slotClick = vi.fn();
    const childClick = vi.fn((e: React.MouseEvent) => {
      e.preventDefault();
    });
    render(
      <Slot onClick={slotClick}>
        <button type="button" onClick={childClick}>
          x
        </button>
      </Slot>,
    );
    fireEvent.click(screen.getByText('x'));
    expect(childClick).toHaveBeenCalledTimes(1);
    expect(slotClick).not.toHaveBeenCalled();
  });

  it('forwards the ref to the child DOM node', () => {
    const ref = createRef<HTMLButtonElement>();
    render(
      <Slot ref={ref}>
        <button type="button">x</button>
      </Slot>,
    );
    expect(ref.current?.tagName).toBe('BUTTON');
  });

  it('child props win over slot props for non-handler, non-style, non-className props', () => {
    render(
      <Slot data-testid="s" id="slot-id">
        <div id="child-id">x</div>
      </Slot>,
    );
    expect(screen.getByTestId('s').id).toBe('child-id');
  });

  it('returns null when children is not a valid element', () => {
    const { container } = render(<Slot>just text</Slot>);
    expect(container.firstChild).toBeNull();
  });
});
