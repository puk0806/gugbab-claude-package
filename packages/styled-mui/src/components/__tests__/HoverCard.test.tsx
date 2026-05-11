import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { HoverCard } from '../HoverCard';

describe('HoverCard (styled-mui)', () => {
  it('Trigger applies gmui-hover-card__trigger', () => {
    const { container } = render(
      <HoverCard.Root>
        <HoverCard.Trigger data-testid="trigger">Hover</HoverCard.Trigger>
      </HoverCard.Root>,
    );
    expect(container.querySelector('[data-testid="trigger"]')).toHaveClass(
      'gmui-hover-card__trigger',
    );
  });

  it('Content applies gmui-hover-card__content when forced open', () => {
    render(
      <HoverCard.Root defaultOpen>
        <HoverCard.Portal>
          <HoverCard.Content data-testid="content">body</HoverCard.Content>
        </HoverCard.Portal>
      </HoverCard.Root>,
    );
    expect(document.body.querySelector('[data-testid="content"]')).toHaveClass(
      'gmui-hover-card__content',
    );
  });
});
