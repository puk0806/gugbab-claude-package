import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Tooltip } from '../Tooltip';

describe('Tooltip (styled-mui)', () => {
  it('Trigger applies gmui-tooltip__trigger', () => {
    const { container } = render(
      <Tooltip.Provider>
        <Tooltip.Root>
          <Tooltip.Trigger data-testid="trigger">Hover</Tooltip.Trigger>
        </Tooltip.Root>
      </Tooltip.Provider>,
    );
    expect(container.querySelector('[data-testid="trigger"]')).toHaveClass('gmui-tooltip__trigger');
  });

  it('Content applies gmui-tooltip__content when defaultOpen', () => {
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
      'gmui-tooltip__content',
    );
  });
});
