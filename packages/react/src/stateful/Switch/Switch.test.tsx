import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Switch } from './Switch';

describe('Switch', () => {
  it('renders role="switch" with aria-checked', () => {
    render(
      <Switch.Root>
        <Switch.Thumb />
      </Switch.Root>,
    );
    const sw = screen.getByRole('switch');
    expect(sw.getAttribute('aria-checked')).toBe('false');
  });

  it('toggles on click', () => {
    render(
      <Switch.Root>
        <Switch.Thumb />
      </Switch.Root>,
    );
    fireEvent.click(screen.getByRole('switch'));
    expect(screen.getByRole('switch').getAttribute('aria-checked')).toBe('true');
  });

  it('controlled mode fires onCheckedChange and does not self-update', () => {
    const cb = vi.fn();
    render(<Switch.Root checked={false} onCheckedChange={cb} />);
    fireEvent.click(screen.getByRole('switch'));
    expect(cb).toHaveBeenCalledWith(true);
    expect(screen.getByRole('switch').getAttribute('aria-checked')).toBe('false');
  });

  it('disabled does not toggle', () => {
    render(<Switch.Root disabled />);
    fireEvent.click(screen.getByRole('switch'));
    expect(screen.getByRole('switch').getAttribute('aria-checked')).toBe('false');
  });
});
