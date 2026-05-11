import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Menubar } from '../Menubar';

describe('Menubar (styled-radix)', () => {
  it('Root applies grx-menubar', () => {
    const { container } = render(<Menubar.Root data-testid="root" />);
    expect(container.querySelector('[data-testid="root"]')).toHaveClass('grx-menubar');
  });

  it('Trigger applies grx-menubar__trigger', () => {
    const { container } = render(
      <Menubar.Root>
        <Menubar.Menu>
          <Menubar.Trigger data-testid="trigger">File</Menubar.Trigger>
        </Menubar.Menu>
      </Menubar.Root>,
    );
    expect(container.querySelector('[data-testid="trigger"]')).toHaveClass('grx-menubar__trigger');
  });

  it('Content / Item reuse grx-menu__* BEM classes', () => {
    render(
      <Menubar.Root defaultValue="file">
        <Menubar.Menu value="file">
          <Menubar.Trigger>File</Menubar.Trigger>
          <Menubar.Portal>
            <Menubar.Content data-testid="content">
              <Menubar.Item data-testid="item">New</Menubar.Item>
            </Menubar.Content>
          </Menubar.Portal>
        </Menubar.Menu>
      </Menubar.Root>,
    );
    expect(document.body.querySelector('[data-testid="content"]')).toHaveClass('grx-menu__content');
    expect(document.body.querySelector('[data-testid="item"]')).toHaveClass('grx-menu__item');
  });
});
