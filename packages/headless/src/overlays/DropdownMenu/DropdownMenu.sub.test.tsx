import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DropdownMenu } from './DropdownMenu';

describe('DropdownMenu.Sub', () => {
  it('SubTrigger has role="menuitem" and aria-haspopup="menu"', () => {
    render(
      <DropdownMenu.Root defaultOpen>
        <DropdownMenu.Trigger>menu</DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Sub>
            <DropdownMenu.SubTrigger>more</DropdownMenu.SubTrigger>
            <DropdownMenu.SubContent>
              <DropdownMenu.Item>nested</DropdownMenu.Item>
            </DropdownMenu.SubContent>
          </DropdownMenu.Sub>
        </DropdownMenu.Content>
      </DropdownMenu.Root>,
    );
    const subTrigger = screen.getByText('more');
    expect(subTrigger.getAttribute('role')).toBe('menuitem');
    expect(subTrigger.getAttribute('aria-haspopup')).toBe('menu');
    expect(subTrigger.getAttribute('aria-expanded')).toBe('false');
  });

  it('SubContent is hidden until Sub opens', () => {
    render(
      <DropdownMenu.Root defaultOpen>
        <DropdownMenu.Trigger>menu</DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Sub>
            <DropdownMenu.SubTrigger>more</DropdownMenu.SubTrigger>
            <DropdownMenu.SubContent>
              <DropdownMenu.Item>nested</DropdownMenu.Item>
            </DropdownMenu.SubContent>
          </DropdownMenu.Sub>
        </DropdownMenu.Content>
      </DropdownMenu.Root>,
    );
    expect(screen.queryByText('nested')).toBeNull();
  });

  it('ArrowRight on SubTrigger opens SubContent', () => {
    render(
      <DropdownMenu.Root defaultOpen>
        <DropdownMenu.Trigger>menu</DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Sub>
            <DropdownMenu.SubTrigger>more</DropdownMenu.SubTrigger>
            <DropdownMenu.SubContent>
              <DropdownMenu.Item>nested</DropdownMenu.Item>
            </DropdownMenu.SubContent>
          </DropdownMenu.Sub>
        </DropdownMenu.Content>
      </DropdownMenu.Root>,
    );
    const subTrigger = screen.getByText('more');
    subTrigger.focus();
    fireEvent.keyDown(subTrigger, { key: 'ArrowRight' });
    expect(screen.getByText('nested')).toBeInTheDocument();
    expect(subTrigger.getAttribute('aria-expanded')).toBe('true');
    expect(subTrigger.getAttribute('data-state')).toBe('open');
  });

  it('SubContent closes when parent menu closes', () => {
    function Probe({ open }: { open: boolean }) {
      return (
        <DropdownMenu.Root open={open}>
          <DropdownMenu.Trigger>menu</DropdownMenu.Trigger>
          <DropdownMenu.Content>
            <DropdownMenu.Sub defaultOpen>
              <DropdownMenu.SubTrigger>more</DropdownMenu.SubTrigger>
              <DropdownMenu.SubContent>
                <DropdownMenu.Item>nested</DropdownMenu.Item>
              </DropdownMenu.SubContent>
            </DropdownMenu.Sub>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      );
    }
    const { rerender } = render(<Probe open />);
    expect(screen.getByText('nested')).toBeInTheDocument();
    rerender(<Probe open={false} />);
    expect(screen.queryByText('nested')).toBeNull();
  });
});
