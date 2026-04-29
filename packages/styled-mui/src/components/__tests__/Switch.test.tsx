import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Switch } from '../Switch';

describe('Switch (styled-mui)', () => {
  it('applies gmui-switch class with default md size', () => {
    render(
      <Switch.Root data-testid="root">
        <Switch.Thumb />
      </Switch.Root>,
    );
    const root = screen.getByTestId('root');
    expect(root).toHaveClass('gmui-switch');
    expect(root).toHaveClass('gmui-switch--md');
  });

  it('Thumb gets gmui-switch__thumb class', () => {
    render(
      <Switch.Root>
        <Switch.Thumb data-testid="thumb" />
      </Switch.Root>,
    );
    expect(screen.getByTestId('thumb')).toHaveClass('gmui-switch__thumb');
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
    expect(screen.getByTestId('root')).toHaveClass('gmui-switch--lg');
  });
});
