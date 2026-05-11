import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ToggleGroup } from '../ToggleGroup';

describe('ToggleGroup (styled-radix)', () => {
  it('Root applies grx-toggle-group with default size + variant', () => {
    const { container } = render(
      <ToggleGroup.Root data-testid="root" type="single">
        <ToggleGroup.Item value="a">A</ToggleGroup.Item>
      </ToggleGroup.Root>,
    );
    const el = container.querySelector('[data-testid="root"]');
    expect(el).toHaveClass('grx-toggle-group');
    expect(el).toHaveClass('grx-toggle-group--md');
    expect(el).toHaveClass('grx-toggle-group--default');
  });

  it.each(['default', 'outline'] as const)('variant %s applies modifier', (variant) => {
    const { container } = render(
      <ToggleGroup.Root data-testid="root" type="single" variant={variant}>
        <ToggleGroup.Item value="a">A</ToggleGroup.Item>
      </ToggleGroup.Root>,
    );
    expect(container.querySelector('[data-testid="root"]')).toHaveClass(
      `grx-toggle-group--${variant}`,
    );
  });

  it.each(['sm', 'md'] as const)('size %s applies modifier', (size) => {
    const { container } = render(
      <ToggleGroup.Root data-testid="root" type="single" size={size}>
        <ToggleGroup.Item value="a">A</ToggleGroup.Item>
      </ToggleGroup.Root>,
    );
    expect(container.querySelector('[data-testid="root"]')).toHaveClass(
      `grx-toggle-group--${size}`,
    );
  });

  it('Item applies grx-toggle-group__item', () => {
    const { container } = render(
      <ToggleGroup.Root type="single">
        <ToggleGroup.Item data-testid="item" value="a">
          A
        </ToggleGroup.Item>
      </ToggleGroup.Root>,
    );
    expect(container.querySelector('[data-testid="item"]')).toHaveClass('grx-toggle-group__item');
  });
});
