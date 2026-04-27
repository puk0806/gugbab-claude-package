import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Select } from './Select';

describe('Select typeahead', () => {
  it('jumps to an item whose label starts with the typed prefix', () => {
    render(
      <Select.Root defaultOpen>
        <Select.Trigger aria-label="fruit">
          <Select.Value placeholder="Pick" />
        </Select.Trigger>
        <Select.Portal>
          <Select.Content>
            <Select.Viewport>
              <Select.Item value="apple">Apple</Select.Item>
              <Select.Item value="banana">Banana</Select.Item>
              <Select.Item value="cherry">Cherry</Select.Item>
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>,
    );

    const listbox = screen.getByRole('listbox');
    // Typing "b" should focus Banana
    fireEvent.keyDown(listbox, { key: 'b' });
    expect(screen.getByText('Banana')).toHaveFocus();
  });

  it('uses explicit `label` prop when provided', () => {
    render(
      <Select.Root defaultOpen>
        <Select.Trigger aria-label="fruit">
          <Select.Value placeholder="Pick" />
        </Select.Trigger>
        <Select.Portal>
          <Select.Content>
            <Select.Viewport>
              <Select.Item value="a" label="Banana">
                <span>{'\u{1F34C}'}</span>
              </Select.Item>
              <Select.Item value="b" label="Cherry">
                <span>{'\u{1F352}'}</span>
              </Select.Item>
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>,
    );

    const listbox = screen.getByRole('listbox');
    fireEvent.keyDown(listbox, { key: 'c' });
    const cherryOption = screen.getAllByRole('option')[1];
    expect(cherryOption).toHaveFocus();
  });
});
