import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ToggleGroup } from './ToggleGroup';

describe('ToggleGroup', () => {
  it('single: selecting one deselects others', () => {
    render(
      <ToggleGroup.Root type="single">
        <ToggleGroup.Item value="a">A</ToggleGroup.Item>
        <ToggleGroup.Item value="b">B</ToggleGroup.Item>
      </ToggleGroup.Root>,
    );
    fireEvent.click(screen.getByText('A'));
    expect(screen.getByText('A').getAttribute('aria-checked')).toBe('true');
    fireEvent.click(screen.getByText('B'));
    expect(screen.getByText('A').getAttribute('aria-checked')).toBe('false');
    expect(screen.getByText('B').getAttribute('aria-checked')).toBe('true');
  });

  it('single: clicking selected item deselects it', () => {
    render(
      <ToggleGroup.Root type="single">
        <ToggleGroup.Item value="a">A</ToggleGroup.Item>
      </ToggleGroup.Root>,
    );
    fireEvent.click(screen.getByText('A'));
    fireEvent.click(screen.getByText('A'));
    expect(screen.getByText('A').getAttribute('aria-checked')).toBe('false');
  });

  it('multiple: multiple items can be toggled on', () => {
    render(
      <ToggleGroup.Root type="multiple">
        <ToggleGroup.Item value="a">A</ToggleGroup.Item>
        <ToggleGroup.Item value="b">B</ToggleGroup.Item>
      </ToggleGroup.Root>,
    );
    fireEvent.click(screen.getByText('A'));
    fireEvent.click(screen.getByText('B'));
    expect(screen.getByText('A').getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByText('B').getAttribute('aria-pressed')).toBe('true');
  });
});
