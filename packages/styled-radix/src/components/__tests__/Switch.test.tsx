import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Switch } from '../Switch';

describe('Switch (styled-radix)', () => {
  it('applies grx-switch class with default md size', () => {
    render(
      <Switch.Root data-testid="root">
        <Switch.Thumb />
      </Switch.Root>,
    );
    const root = screen.getByTestId('root');
    expect(root).toHaveClass('grx-switch');
    expect(root).toHaveClass('grx-switch--md');
  });

  it('Thumb gets grx-switch__thumb class', () => {
    render(
      <Switch.Root>
        <Switch.Thumb data-testid="thumb" />
      </Switch.Root>,
    );
    expect(screen.getByTestId('thumb')).toHaveClass('grx-switch__thumb');
  });

  it('reflects checked state via data-state attribute', () => {
    render(
      <Switch.Root data-testid="root" defaultChecked>
        <Switch.Thumb />
      </Switch.Root>,
    );
    expect(screen.getByTestId('root')).toHaveAttribute('data-state', 'checked');
  });

  it('size variant lg applies modifier class', () => {
    render(
      <Switch.Root data-testid="root" size="lg">
        <Switch.Thumb />
      </Switch.Root>,
    );
    expect(screen.getByTestId('root')).toHaveClass('grx-switch--lg');
  });
});
