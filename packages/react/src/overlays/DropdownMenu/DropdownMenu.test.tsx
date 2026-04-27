import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DropdownMenu } from './DropdownMenu';

describe('DropdownMenu', () => {
  it('opens on trigger click and renders items', () => {
    render(
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>menu</DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content>
            <DropdownMenu.Item>one</DropdownMenu.Item>
            <DropdownMenu.Item>two</DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>,
    );
    fireEvent.click(screen.getByText('menu'));
    expect(screen.getByText('one')).toBeInTheDocument();
    expect(screen.getByText('two')).toBeInTheDocument();
  });

  it('calls onSelect and closes when item is clicked', () => {
    const onSelect = vi.fn();
    render(
      <DropdownMenu.Root defaultOpen>
        <DropdownMenu.Trigger>menu</DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content>
            <DropdownMenu.Item onSelect={onSelect}>hit</DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>,
    );
    fireEvent.click(screen.getByText('hit'));
    expect(onSelect).toHaveBeenCalled();
    expect(screen.queryByText('hit')).toBeNull();
  });
});
