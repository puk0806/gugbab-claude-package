import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Toolbar } from '../Toolbar';

describe('Toolbar (styled-radix)', () => {
  it('Root applies grx-toolbar', () => {
    const { container } = render(<Toolbar.Root data-testid="root" />);
    expect(container.querySelector('[data-testid="root"]')).toHaveClass('grx-toolbar');
  });

  it('Button / Link / Separator / ToggleGroup / ToggleItem have BEM classes', () => {
    const { container } = render(
      <Toolbar.Root>
        <Toolbar.Button data-testid="button">B</Toolbar.Button>
        <Toolbar.Link data-testid="link" href="/">
          L
        </Toolbar.Link>
        <Toolbar.Separator data-testid="sep" />
        <Toolbar.ToggleGroup data-testid="tg" type="single">
          <Toolbar.ToggleItem data-testid="ti" value="x">
            X
          </Toolbar.ToggleItem>
        </Toolbar.ToggleGroup>
      </Toolbar.Root>,
    );
    expect(container.querySelector('[data-testid="button"]')).toHaveClass('grx-toolbar__button');
    expect(container.querySelector('[data-testid="link"]')).toHaveClass('grx-toolbar__link');
    expect(container.querySelector('[data-testid="sep"]')).toHaveClass('grx-toolbar__separator');
    expect(container.querySelector('[data-testid="tg"]')).toHaveClass('grx-toolbar__toggle-group');
    expect(container.querySelector('[data-testid="ti"]')).toHaveClass('grx-toolbar__toggle-item');
  });
});
