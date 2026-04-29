import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Checkbox } from '../Checkbox';

describe('Checkbox (styled-mui)', () => {
  it('Root has gmui-checkbox + size class', () => {
    render(
      <Checkbox.Root data-testid="root">
        <Checkbox.Indicator />
      </Checkbox.Root>,
    );
    const root = screen.getByTestId('root');
    expect(root).toHaveClass('gmui-checkbox');
    expect(root).toHaveClass('gmui-checkbox--md');
  });

  it('exposes data-state="checked" when defaultChecked', () => {
    render(
      <Checkbox.Root data-testid="root" defaultChecked>
        <Checkbox.Indicator />
      </Checkbox.Root>,
    );
    expect(screen.getByTestId('root')).toHaveAttribute('data-state', 'checked');
  });

  it('exposes data-state="indeterminate" when checked is the literal string', () => {
    render(
      <Checkbox.Root data-testid="root" checked="indeterminate" onCheckedChange={() => {}}>
        <Checkbox.Indicator />
      </Checkbox.Root>,
    );
    expect(screen.getByTestId('root')).toHaveAttribute('data-state', 'indeterminate');
  });

  it('Indicator renders with gmui-checkbox__indicator and stays empty so CSS glyph injects', () => {
    render(
      <Checkbox.Root defaultChecked>
        <Checkbox.Indicator data-testid="ind" />
      </Checkbox.Root>,
    );
    const ind = screen.getByTestId('ind');
    expect(ind).toHaveClass('gmui-checkbox__indicator');
    expect(ind).toBeEmptyDOMElement();
  });

  it('disabled state propagates to data-disabled', () => {
    render(
      <Checkbox.Root data-testid="root" disabled defaultChecked>
        <Checkbox.Indicator />
      </Checkbox.Root>,
    );
    const root = screen.getByTestId('root');
    expect(root).toBeDisabled();
  });
});
