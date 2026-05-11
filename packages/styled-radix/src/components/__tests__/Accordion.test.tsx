import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Accordion } from '../Accordion';

describe('Accordion (styled-radix)', () => {
  it('Root applies grx-accordion with default variant', () => {
    const { container } = render(
      <Accordion.Root data-testid="root" type="single">
        <Accordion.Item value="a" />
      </Accordion.Root>,
    );
    const el = container.querySelector('[data-testid="root"]');
    expect(el).toHaveClass('grx-accordion');
    expect(el).toHaveClass('grx-accordion--default');
  });

  it.each(['default', 'outline'] as const)('renders grx-accordion--%s', (variant) => {
    const { container } = render(
      <Accordion.Root data-testid="root" type="single" variant={variant}>
        <Accordion.Item value="a" />
      </Accordion.Root>,
    );
    expect(container.querySelector('[data-testid="root"]')).toHaveClass(
      `grx-accordion--${variant}`,
    );
  });

  it('Item / Header / Trigger / Content carry their BEM classes', () => {
    const { container } = render(
      <Accordion.Root type="single" defaultValue="a">
        <Accordion.Item value="a" data-testid="item">
          <Accordion.Header data-testid="header">
            <Accordion.Trigger data-testid="trigger">Open</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content data-testid="content">body</Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>,
    );
    expect(container.querySelector('[data-testid="item"]')).toHaveClass('grx-accordion__item');
    expect(container.querySelector('[data-testid="header"]')).toHaveClass('grx-accordion__header');
    expect(container.querySelector('[data-testid="trigger"]')).toHaveClass(
      'grx-accordion__trigger',
    );
    expect(container.querySelector('[data-testid="content"]')).toHaveClass(
      'grx-accordion__content',
    );
  });

  it('Root merges consumer className', () => {
    const { container } = render(
      <Accordion.Root data-testid="root" type="single" className="custom">
        <Accordion.Item value="a" />
      </Accordion.Root>,
    );
    const el = container.querySelector('[data-testid="root"]');
    expect(el).toHaveClass('grx-accordion');
    expect(el).toHaveClass('custom');
  });
});
