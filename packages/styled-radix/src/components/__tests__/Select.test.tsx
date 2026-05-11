import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Select } from '../Select';

describe('Select (styled-radix)', () => {
  it('Trigger / Value / Content / Viewport / Item have BEM classes', () => {
    render(
      <Select.Root defaultOpen>
        <Select.Trigger data-testid="trigger">
          <Select.Value data-testid="value" placeholder="Pick" />
        </Select.Trigger>
        <Select.Portal>
          <Select.Content data-testid="content">
            <Select.Viewport data-testid="viewport">
              <Select.Item data-testid="item" value="a">
                A
              </Select.Item>
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>,
    );
    const trigger = document.body.querySelector('[data-testid="trigger"]');
    expect(trigger).toHaveClass('grx-select__trigger');
    const value = document.body.querySelector('[data-testid="value"]');
    expect(value).toHaveClass('grx-select__value');
    expect(document.body.querySelector('[data-testid="content"]')).toHaveClass(
      'grx-select__content',
    );
    expect(document.body.querySelector('[data-testid="viewport"]')).toHaveClass(
      'grx-select__viewport',
    );
    expect(document.body.querySelector('[data-testid="item"]')).toHaveClass('grx-select__item');
  });

  it.each(['sm', 'md'] as const)('Trigger size %s applies modifier', (size) => {
    render(
      <Select.Root>
        <Select.Trigger data-testid="trigger" size={size}>
          <Select.Value placeholder="Pick" />
        </Select.Trigger>
      </Select.Root>,
    );
    expect(document.body.querySelector('[data-testid="trigger"]')).toHaveClass(
      `grx-select__trigger--${size}`,
    );
  });

  it('ScrollUpButton / ScrollDownButton apply BEM modifiers', () => {
    render(
      <Select.Root defaultOpen>
        <Select.Portal>
          <Select.Content>
            <Select.ScrollUpButton data-testid="up" />
            <Select.Viewport />
            <Select.ScrollDownButton data-testid="down" />
          </Select.Content>
        </Select.Portal>
      </Select.Root>,
    );
    expect(document.body.querySelector('[data-testid="up"]')).toHaveClass(
      'grx-select__scroll-button--up',
    );
    expect(document.body.querySelector('[data-testid="down"]')).toHaveClass(
      'grx-select__scroll-button--down',
    );
  });
});
