import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Combobox } from '../Combobox';

describe('Combobox (styled-radix)', () => {
  it('Anchor / Input / Trigger / Content / Item carry BEM classes', () => {
    const { container } = render(
      <Combobox.Root>
        <Combobox.Anchor data-testid="anchor">
          <Combobox.Input data-testid="input" />
          <Combobox.Trigger data-testid="trigger">▾</Combobox.Trigger>
        </Combobox.Anchor>
      </Combobox.Root>,
    );
    expect(container.querySelector('[data-testid="anchor"]')).toHaveClass('grx-combobox__anchor');
    expect(container.querySelector('[data-testid="input"]')).toHaveClass('grx-combobox__input');
    expect(container.querySelector('[data-testid="trigger"]')).toHaveClass('grx-combobox__trigger');
  });

  it.each(['sm', 'md'] as const)('Input size %s applies modifier', (size) => {
    const { container } = render(
      <Combobox.Root>
        <Combobox.Anchor>
          <Combobox.Input data-testid="input" size={size} />
        </Combobox.Anchor>
      </Combobox.Root>,
    );
    expect(container.querySelector('[data-testid="input"]')).toHaveClass(
      `grx-combobox__input--${size}`,
    );
  });

  it('Input merges consumer className', () => {
    const { container } = render(
      <Combobox.Root>
        <Combobox.Anchor>
          <Combobox.Input data-testid="input" className="custom" />
        </Combobox.Anchor>
      </Combobox.Root>,
    );
    const el = container.querySelector('[data-testid="input"]');
    expect(el).toHaveClass('grx-combobox__input');
    expect(el).toHaveClass('custom');
  });
});
