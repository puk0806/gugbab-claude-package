import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Progress } from '../Progress';

describe('Progress (styled-radix)', () => {
  it('Root has grx-progress + size class', () => {
    render(
      <Progress.Root data-testid="root" value={50}>
        <Progress.Indicator />
      </Progress.Root>,
    );
    const root = screen.getByTestId('root');
    expect(root).toHaveClass('grx-progress');
    expect(root).toHaveClass('grx-progress--md');
  });

  it('Indicator has grx-progress__indicator class', () => {
    render(
      <Progress.Root value={42}>
        <Progress.Indicator data-testid="ind" />
      </Progress.Root>,
    );
    expect(screen.getByTestId('ind')).toHaveClass('grx-progress__indicator');
  });

  it('reflects indeterminate state via data-state when value is null', () => {
    render(
      <Progress.Root data-testid="root" value={null}>
        <Progress.Indicator />
      </Progress.Root>,
    );
    expect(screen.getByTestId('root')).toHaveAttribute('data-state', 'indeterminate');
  });

  it('size variant sm applies modifier', () => {
    render(
      <Progress.Root data-testid="root" size="sm" value={10}>
        <Progress.Indicator />
      </Progress.Root>,
    );
    expect(screen.getByTestId('root')).toHaveClass('grx-progress--sm');
  });
});
