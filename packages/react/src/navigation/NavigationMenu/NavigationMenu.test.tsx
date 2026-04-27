import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { NavigationMenu } from './NavigationMenu';

describe('NavigationMenu', () => {
  it('opens a single submenu at a time and reflects in aria-expanded', () => {
    render(
      <NavigationMenu.Root>
        <NavigationMenu.List>
          <NavigationMenu.Item value="products">
            <NavigationMenu.Trigger>Products</NavigationMenu.Trigger>
            <NavigationMenu.Content>product-links</NavigationMenu.Content>
          </NavigationMenu.Item>
          <NavigationMenu.Item value="company">
            <NavigationMenu.Trigger>Company</NavigationMenu.Trigger>
            <NavigationMenu.Content>company-links</NavigationMenu.Content>
          </NavigationMenu.Item>
        </NavigationMenu.List>
      </NavigationMenu.Root>,
    );

    fireEvent.click(screen.getByText('Products'));
    expect(screen.getByText('product-links')).toBeInTheDocument();
    expect(screen.getByText('Products').getAttribute('aria-expanded')).toBe('true');

    fireEvent.click(screen.getByText('Company'));
    expect(screen.queryByText('product-links')).toBeNull();
    expect(screen.getByText('company-links')).toBeInTheDocument();
  });

  it('toggles off when the open trigger is clicked again', () => {
    render(
      <NavigationMenu.Root defaultValue="products">
        <NavigationMenu.List>
          <NavigationMenu.Item value="products">
            <NavigationMenu.Trigger>Products</NavigationMenu.Trigger>
            <NavigationMenu.Content>product-links</NavigationMenu.Content>
          </NavigationMenu.Item>
        </NavigationMenu.List>
      </NavigationMenu.Root>,
    );
    expect(screen.getByText('product-links')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Products'));
    expect(screen.queryByText('product-links')).toBeNull();
  });
});
