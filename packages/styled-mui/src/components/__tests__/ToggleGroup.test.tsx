import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ToggleGroup } from '../ToggleGroup';

describe('ToggleGroup (styled-mui)', () => {
  it('Root applies gmui-toggle-group with default size + variant', () => {
    const { container } = render(
      <ToggleGroup.Root data-testid="root" type="single">
        <ToggleGroup.Item value="a">A</ToggleGroup.Item>
      </ToggleGroup.Root>,
    );
    const el = container.querySelector('[data-testid="root"]');
    expect(el).toHaveClass('gmui-toggle-group');
    expect(el).toHaveClass('gmui-toggle-group--md');
    expect(el).toHaveClass('gmui-toggle-group--default');
  });

  it.each(['default', 'outline'] as const)('variant %s applies modifier', (variant) => {
    const { container } = render(
      <ToggleGroup.Root data-testid="root" type="single" variant={variant}>
        <ToggleGroup.Item value="a">A</ToggleGroup.Item>
      </ToggleGroup.Root>,
    );
    expect(container.querySelector('[data-testid="root"]')).toHaveClass(
      `gmui-toggle-group--${variant}`,
    );
  });

  it.each(['sm', 'md'] as const)('size %s applies modifier', (size) => {
    const { container } = render(
      <ToggleGroup.Root data-testid="root" type="single" size={size}>
        <ToggleGroup.Item value="a">A</ToggleGroup.Item>
      </ToggleGroup.Root>,
    );
    expect(container.querySelector('[data-testid="root"]')).toHaveClass(
      `gmui-toggle-group--${size}`,
    );
  });

  it('Item applies gmui-toggle-group__item', () => {
    const { container } = render(
      <ToggleGroup.Root type="single">
        <ToggleGroup.Item data-testid="item" value="a">
          A
        </ToggleGroup.Item>
      </ToggleGroup.Root>,
    );
    expect(container.querySelector('[data-testid="item"]')).toHaveClass('gmui-toggle-group__item');
  });
});
