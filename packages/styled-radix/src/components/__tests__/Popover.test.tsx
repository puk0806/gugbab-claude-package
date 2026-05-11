import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Popover } from '../Popover';

describe('Popover (styled-radix)', () => {
  it('Trigger applies grx-popover__trigger', () => {
    const { container } = render(
      <Popover.Root>
        <Popover.Trigger data-testid="trigger">Open</Popover.Trigger>
      </Popover.Root>,
    );
    expect(container.querySelector('[data-testid="trigger"]')).toHaveClass('grx-popover__trigger');
  });

  it('Anchor / Content / Close have BEM classes', () => {
    render(
      <Popover.Root defaultOpen>
        <Popover.Anchor data-testid="anchor" />
        <Popover.Portal>
          <Popover.Content data-testid="content">
            body
            <Popover.Close data-testid="close">x</Popover.Close>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>,
    );
    expect(document.body.querySelector('[data-testid="anchor"]')).toHaveClass(
      'grx-popover__anchor',
    );
    expect(document.body.querySelector('[data-testid="content"]')).toHaveClass(
      'grx-popover__content',
    );
    expect(document.body.querySelector('[data-testid="close"]')).toHaveClass('grx-popover__close');
  });
});
