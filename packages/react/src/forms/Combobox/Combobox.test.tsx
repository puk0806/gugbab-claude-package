import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Combobox } from './Combobox';

describe('Combobox', () => {
  it('opens on input focus and selects on item click', () => {
    const onValueChange = vi.fn();
    render(
      <Combobox.Root onValueChange={onValueChange}>
        <Combobox.Anchor>
          <Combobox.Input aria-label="fruit" />
        </Combobox.Anchor>
        <Combobox.Portal>
          <Combobox.Content>
            <Combobox.Item value="apple">Apple</Combobox.Item>
            <Combobox.Item value="banana">Banana</Combobox.Item>
          </Combobox.Content>
        </Combobox.Portal>
      </Combobox.Root>,
    );

    fireEvent.focus(screen.getByLabelText('fruit'));
    expect(screen.getByText('Apple')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Apple'));
    expect(onValueChange).toHaveBeenCalledWith('apple');
  });
});
