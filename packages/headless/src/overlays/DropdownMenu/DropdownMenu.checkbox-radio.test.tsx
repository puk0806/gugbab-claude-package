import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { DropdownMenu } from './DropdownMenu';

describe('DropdownMenu.CheckboxItem', () => {
  it('renders with role="menuitemcheckbox" and aria-checked reflects state', () => {
    render(
      <DropdownMenu.Root defaultOpen>
        <DropdownMenu.Trigger>menu</DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.CheckboxItem checked={false}>off</DropdownMenu.CheckboxItem>
          <DropdownMenu.CheckboxItem checked={true}>on</DropdownMenu.CheckboxItem>
        </DropdownMenu.Content>
      </DropdownMenu.Root>,
    );
    const off = screen.getByText('off');
    const on = screen.getByText('on');
    expect(off.getAttribute('role')).toBe('menuitemcheckbox');
    expect(off.getAttribute('aria-checked')).toBe('false');
    expect(on.getAttribute('aria-checked')).toBe('true');
  });

  it('calls onCheckedChange when clicked (controlled)', () => {
    const onCheckedChange = vi.fn();
    render(
      <DropdownMenu.Root defaultOpen>
        <DropdownMenu.Trigger>menu</DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.CheckboxItem checked={false} onCheckedChange={onCheckedChange}>
            cb
          </DropdownMenu.CheckboxItem>
        </DropdownMenu.Content>
      </DropdownMenu.Root>,
    );
    fireEvent.click(screen.getByText('cb'));
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it('renders ItemIndicator only when checked', () => {
    const { rerender } = render(
      <DropdownMenu.Root defaultOpen>
        <DropdownMenu.Trigger>menu</DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.CheckboxItem checked={false}>
            <DropdownMenu.ItemIndicator data-testid="ind">✓</DropdownMenu.ItemIndicator>
            cb
          </DropdownMenu.CheckboxItem>
        </DropdownMenu.Content>
      </DropdownMenu.Root>,
    );
    expect(screen.queryByTestId('ind')).toBeNull();
    rerender(
      <DropdownMenu.Root defaultOpen>
        <DropdownMenu.Trigger>menu</DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.CheckboxItem checked={true}>
            <DropdownMenu.ItemIndicator data-testid="ind">✓</DropdownMenu.ItemIndicator>
            cb
          </DropdownMenu.CheckboxItem>
        </DropdownMenu.Content>
      </DropdownMenu.Root>,
    );
    expect(screen.getByTestId('ind')).toBeInTheDocument();
  });
});

describe('DropdownMenu.RadioGroup / RadioItem', () => {
  it('reflects role and selection via aria-checked', () => {
    const { rerender } = render(
      <DropdownMenu.Root defaultOpen>
        <DropdownMenu.Trigger>menu</DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.RadioGroup value="a">
            <DropdownMenu.RadioItem value="a">A</DropdownMenu.RadioItem>
            <DropdownMenu.RadioItem value="b">B</DropdownMenu.RadioItem>
          </DropdownMenu.RadioGroup>
        </DropdownMenu.Content>
      </DropdownMenu.Root>,
    );
    expect(screen.getByText('A').getAttribute('role')).toBe('menuitemradio');
    expect(screen.getByText('A').getAttribute('aria-checked')).toBe('true');
    expect(screen.getByText('B').getAttribute('aria-checked')).toBe('false');

    rerender(
      <DropdownMenu.Root defaultOpen>
        <DropdownMenu.Trigger>menu</DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.RadioGroup value="b">
            <DropdownMenu.RadioItem value="a">A</DropdownMenu.RadioItem>
            <DropdownMenu.RadioItem value="b">B</DropdownMenu.RadioItem>
          </DropdownMenu.RadioGroup>
        </DropdownMenu.Content>
      </DropdownMenu.Root>,
    );
    expect(screen.getByText('A').getAttribute('aria-checked')).toBe('false');
    expect(screen.getByText('B').getAttribute('aria-checked')).toBe('true');
  });

  it('calls onValueChange when a RadioItem is clicked (uncontrolled)', () => {
    const onValueChange = vi.fn();
    function Probe() {
      const [v, setV] = useState('a');
      return (
        <DropdownMenu.Root defaultOpen>
          <DropdownMenu.Trigger>menu</DropdownMenu.Trigger>
          <DropdownMenu.Content>
            <DropdownMenu.RadioGroup
              value={v}
              onValueChange={(next) => {
                setV(next);
                onValueChange(next);
              }}
            >
              <DropdownMenu.RadioItem value="a">A</DropdownMenu.RadioItem>
              <DropdownMenu.RadioItem value="b">B</DropdownMenu.RadioItem>
            </DropdownMenu.RadioGroup>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      );
    }
    render(<Probe />);
    fireEvent.click(screen.getByText('B'));
    expect(onValueChange).toHaveBeenCalledWith('b');
  });

  it('ItemIndicator only renders on the selected RadioItem', () => {
    function Probe() {
      return (
        <DropdownMenu.Root defaultOpen>
          <DropdownMenu.Trigger>menu</DropdownMenu.Trigger>
          <DropdownMenu.Content>
            <DropdownMenu.RadioGroup value="a">
              <DropdownMenu.RadioItem value="a">
                <DropdownMenu.ItemIndicator data-testid="ind-a">•</DropdownMenu.ItemIndicator>A
              </DropdownMenu.RadioItem>
              <DropdownMenu.RadioItem value="b">
                <DropdownMenu.ItemIndicator data-testid="ind-b">•</DropdownMenu.ItemIndicator>B
              </DropdownMenu.RadioItem>
            </DropdownMenu.RadioGroup>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      );
    }
    render(<Probe />);
    expect(screen.getByTestId('ind-a')).toBeInTheDocument();
    expect(screen.queryByTestId('ind-b')).toBeNull();
  });
});
