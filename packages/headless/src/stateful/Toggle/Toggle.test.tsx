import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Toggle } from './Toggle';

describe('Toggle', () => {
  it('starts unpressed by default', () => {
    render(<Toggle>x</Toggle>);
    expect(screen.getByText('x').getAttribute('aria-pressed')).toBe('false');
  });

  it('toggles on click', () => {
    render(<Toggle>x</Toggle>);
    fireEvent.click(screen.getByText('x'));
    expect(screen.getByText('x').getAttribute('aria-pressed')).toBe('true');
    fireEvent.click(screen.getByText('x'));
    expect(screen.getByText('x').getAttribute('aria-pressed')).toBe('false');
  });

  it('controlled mode emits onPressedChange', () => {
    const cb = vi.fn();
    render(
      <Toggle pressed={false} onPressedChange={cb}>
        x
      </Toggle>,
    );
    fireEvent.click(screen.getByText('x'));
    expect(cb).toHaveBeenCalledWith(true);
  });

  it('disabled does not toggle', () => {
    render(<Toggle disabled>x</Toggle>);
    fireEvent.click(screen.getByText('x'));
    expect(screen.getByText('x').getAttribute('aria-pressed')).toBe('false');
  });
});
