import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Avatar } from '../Avatar';

describe('Avatar (styled-radix)', () => {
  it('applies grx-avatar class on Root with default md size', () => {
    render(
      <Avatar.Root data-testid="root">
        <Avatar.Fallback>JD</Avatar.Fallback>
      </Avatar.Root>,
    );
    const root = screen.getByTestId('root');
    expect(root).toHaveClass('grx-avatar');
    expect(root).toHaveClass('grx-avatar--md');
  });

  it('respects size variant (sm/lg)', () => {
    const { rerender } = render(
      <Avatar.Root data-testid="root" size="sm">
        <Avatar.Fallback>S</Avatar.Fallback>
      </Avatar.Root>,
    );
    expect(screen.getByTestId('root')).toHaveClass('grx-avatar--sm');

    rerender(
      <Avatar.Root data-testid="root" size="lg">
        <Avatar.Fallback>L</Avatar.Fallback>
      </Avatar.Root>,
    );
    expect(screen.getByTestId('root')).toHaveClass('grx-avatar--lg');
  });

  it('Fallback renders with grx-avatar__fallback class', () => {
    render(
      <Avatar.Root>
        <Avatar.Fallback data-testid="fb">JD</Avatar.Fallback>
      </Avatar.Root>,
    );
    expect(screen.getByTestId('fb')).toHaveClass('grx-avatar__fallback');
  });

  it('merges consumer className with built-in classes', () => {
    render(
      <Avatar.Root data-testid="root" className="custom">
        <Avatar.Fallback>X</Avatar.Fallback>
      </Avatar.Root>,
    );
    const root = screen.getByTestId('root');
    expect(root).toHaveClass('grx-avatar');
    expect(root).toHaveClass('custom');
  });
});
