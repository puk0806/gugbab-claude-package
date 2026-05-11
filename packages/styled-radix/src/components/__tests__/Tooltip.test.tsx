import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Tooltip } from '../Tooltip';

describe('Tooltip (styled-radix)', () => {
  it('Trigger applies grx-tooltip__trigger', () => {
    const { container } = render(
      <Tooltip.Provider>
        <Tooltip.Root>
          <Tooltip.Trigger data-testid="trigger">Hover</Tooltip.Trigger>
        </Tooltip.Root>
      </Tooltip.Provider>,
    );
    expect(container.querySelector('[data-testid="trigger"]')).toHaveClass('grx-tooltip__trigger');
  });

  it('Content applies grx-tooltip__content when defaultOpen', () => {
    render(
      <Tooltip.Provider>
        <Tooltip.Root defaultOpen>
          <Tooltip.Trigger>Hover</Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content data-testid="content">tip</Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      </Tooltip.Provider>,
    );
    expect(document.body.querySelector('[data-testid="content"]')).toHaveClass(
      'grx-tooltip__content',
    );
  });
});
