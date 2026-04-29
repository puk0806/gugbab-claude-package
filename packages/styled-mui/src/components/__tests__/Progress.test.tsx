import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Progress } from '../Progress';

describe('Progress (styled-mui)', () => {
  it('Root has gmui-progress + size class', () => {
    render(
      <Progress.Root data-testid="root" value={50}>
        <Progress.Indicator />
      </Progress.Root>,
    );
    const root = screen.getByTestId('root');
    expect(root).toHaveClass('gmui-progress');
    expect(root).toHaveClass('gmui-progress--md');
  });

  it('Indicator has gmui-progress__indicator class', () => {
    render(
      <Progress.Root value={42}>
        <Progress.Indicator data-testid="ind" />
      </Progress.Root>,
    );
    expect(screen.getByTestId('ind')).toHaveClass('gmui-progress__indicator');
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
    expect(screen.getByTestId('root')).toHaveClass('gmui-progress--sm');
  });
});
