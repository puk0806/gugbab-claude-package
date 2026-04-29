import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Select } from './Select';

function Sample(props: Omit<Parameters<typeof Select.Root>[0], 'children'> = {}) {
  return (
    <Select.Root {...props}>
      <Select.Trigger aria-label="fruit">
        <Select.Value placeholder="Pick" />
      </Select.Trigger>
      <Select.Portal>
        <Select.Content>
          <Select.Viewport>
            <Select.Item value="apple">Apple</Select.Item>
            <Select.Item value="banana">Banana</Select.Item>
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}

describe('Select', () => {
  it('opens on trigger click and shows options', () => {
    render(<Sample />);
    fireEvent.click(screen.getByRole('combobox', { name: 'fruit' }));
    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.getByText('Banana')).toBeInTheDocument();
  });

  it('selecting an option calls onValueChange and closes', () => {
    const onValueChange = vi.fn();
    render(<Sample onValueChange={onValueChange} />);
    fireEvent.click(screen.getByRole('combobox', { name: 'fruit' }));
    fireEvent.click(screen.getByRole('option', { name: 'Banana' }));
    expect(onValueChange).toHaveBeenCalledWith('banana');
    expect(screen.queryByRole('listbox')).toBeNull();
  });
});
