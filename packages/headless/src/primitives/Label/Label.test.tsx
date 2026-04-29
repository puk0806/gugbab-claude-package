import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Label } from './Label';

describe('Label', () => {
  it('renders a native <label> element with htmlFor forwarded', () => {
    render(<Label htmlFor="input-1">Name</Label>);
    const el = screen.getByText('Name');
    expect(el.tagName).toBe('LABEL');
    expect(el.getAttribute('for')).toBe('input-1');
  });

  it('prevents text selection on double-click (detail > 1)', () => {
    render(<Label data-testid="l">hi</Label>);
    const label = screen.getByTestId('l');

    const event = new MouseEvent('mousedown', {
      bubbles: true,
      cancelable: true,
    });
    Object.defineProperty(event, 'detail', { value: 2 });
    fireEvent(label, event);

    expect(event.defaultPrevented).toBe(true);
  });

  it('does not prevent default for a single click (detail === 1)', () => {
    render(<Label data-testid="l">hi</Label>);
    const label = screen.getByTestId('l');

    const event = new MouseEvent('mousedown', {
      bubbles: true,
      cancelable: true,
    });
    Object.defineProperty(event, 'detail', { value: 1 });
    fireEvent(label, event);

    expect(event.defaultPrevented).toBe(false);
  });

  it('calls the user onMouseDown handler', () => {
    const handler = vi.fn();
    render(
      <Label data-testid="l" onMouseDown={handler}>
        hi
      </Label>,
    );
    fireEvent.mouseDown(screen.getByTestId('l'));
    expect(handler).toHaveBeenCalled();
  });
});
