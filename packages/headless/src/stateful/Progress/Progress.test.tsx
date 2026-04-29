import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Progress } from './Progress';

describe('Progress', () => {
  it('defaults to indeterminate when value is not provided', () => {
    render(
      <Progress.Root>
        <Progress.Indicator />
      </Progress.Root>,
    );
    const bar = screen.getByRole('progressbar');
    expect(bar.getAttribute('data-state')).toBe('indeterminate');
    expect(bar.hasAttribute('aria-valuenow')).toBe(false);
  });

  it('reports value and max via ARIA', () => {
    render(<Progress.Root value={30} max={100} />);
    const bar = screen.getByRole('progressbar');
    expect(bar.getAttribute('aria-valuenow')).toBe('30');
    expect(bar.getAttribute('aria-valuemax')).toBe('100');
    expect(bar.getAttribute('data-state')).toBe('loading');
  });

  it('marks state as complete when value >= max', () => {
    render(<Progress.Root value={100} max={100} />);
    expect(screen.getByRole('progressbar').getAttribute('data-state')).toBe('complete');
  });

  it('calls getValueLabel for aria-valuetext', () => {
    render(<Progress.Root value={25} max={100} getValueLabel={(v, m) => `${v} of ${m}`} />);
    expect(screen.getByRole('progressbar').getAttribute('aria-valuetext')).toBe('25 of 100');
  });
});
