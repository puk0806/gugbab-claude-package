import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Menubar } from '../Menubar';

describe('Menubar (styled-mui)', () => {
  it('Root applies gmui-menubar', () => {
    const { container } = render(<Menubar.Root data-testid="root" />);
    expect(container.querySelector('[data-testid="root"]')).toHaveClass('gmui-menubar');
  });

  it('Trigger applies gmui-menubar__trigger', () => {
    const { container } = render(
      <Menubar.Root>
        <Menubar.Menu>
          <Menubar.Trigger data-testid="trigger">File</Menubar.Trigger>
        </Menubar.Menu>
      </Menubar.Root>,
    );
    expect(container.querySelector('[data-testid="trigger"]')).toHaveClass('gmui-menubar__trigger');
  });

  it('Content / Item reuse gmui-menu__* BEM classes', () => {
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
    expect(document.body.querySelector('[data-testid="content"]')).toHaveClass(
      'gmui-menu__content',
    );
    expect(document.body.querySelector('[data-testid="item"]')).toHaveClass('gmui-menu__item');
  });
});
