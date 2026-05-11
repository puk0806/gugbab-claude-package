import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { NavigationMenu } from '../NavigationMenu';

describe('NavigationMenu (styled-mui)', () => {
  it('Root applies gmui-navigation-menu', () => {
    const { container } = render(<NavigationMenu.Root data-testid="root" />);
    expect(container.querySelector('[data-testid="root"]')).toHaveClass('gmui-navigation-menu');
  });

  it('List/Item/Trigger/Content/Link have BEM classes', () => {
    const { container } = render(
      <NavigationMenu.Root defaultValue="a">
        <NavigationMenu.List data-testid="list">
          <NavigationMenu.Item data-testid="item" value="a">
            <NavigationMenu.Trigger data-testid="trigger">More</NavigationMenu.Trigger>
            <NavigationMenu.Content data-testid="content">
              <NavigationMenu.Link data-testid="link" href="/">
                Home
              </NavigationMenu.Link>
            </NavigationMenu.Content>
          </NavigationMenu.Item>
        </NavigationMenu.List>
      </NavigationMenu.Root>,
    );
    expect(container.querySelector('[data-testid="list"]')).toHaveClass(
      'gmui-navigation-menu__list',
    );
    expect(container.querySelector('[data-testid="item"]')).toHaveClass(
      'gmui-navigation-menu__item',
    );
    expect(container.querySelector('[data-testid="trigger"]')).toHaveClass(
      'gmui-navigation-menu__trigger',
    );
    expect(container.querySelector('[data-testid="content"]')).toHaveClass(
      'gmui-navigation-menu__content',
    );
    expect(container.querySelector('[data-testid="link"]')).toHaveClass(
      'gmui-navigation-menu__link',
    );
  });
});
