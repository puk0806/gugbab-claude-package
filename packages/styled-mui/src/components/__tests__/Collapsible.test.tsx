import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Collapsible } from '../Collapsible';

describe('Collapsible (styled-mui)', () => {
  it('Root applies gmui-collapsible', () => {
    const { container } = render(
      <Collapsible.Root data-testid="root">
        <Collapsible.Trigger>Toggle</Collapsible.Trigger>
        <Collapsible.Content>body</Collapsible.Content>
      </Collapsible.Root>,
    );
    expect(container.querySelector('[data-testid="root"]')).toHaveClass('gmui-collapsible');
  });

  it('Trigger and Content carry BEM classes', () => {
    const { container } = render(
      <Collapsible.Root defaultOpen>
        <Collapsible.Trigger data-testid="trigger">Toggle</Collapsible.Trigger>
        <Collapsible.Content data-testid="content">body</Collapsible.Content>
      </Collapsible.Root>,
    );
    expect(container.querySelector('[data-testid="trigger"]')).toHaveClass(
      'gmui-collapsible__trigger',
    );
    expect(container.querySelector('[data-testid="content"]')).toHaveClass(
      'gmui-collapsible__content',
    );
  });

  it('Root merges consumer className', () => {
    const { container } = render(
      <Collapsible.Root data-testid="root" className="custom">
        <Collapsible.Trigger>x</Collapsible.Trigger>
      </Collapsible.Root>,
    );
    const el = container.querySelector('[data-testid="root"]');
    expect(el).toHaveClass('gmui-collapsible');
    expect(el).toHaveClass('custom');
  });
});
