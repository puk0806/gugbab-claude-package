import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Checkbox } from './Checkbox';

describe('Checkbox', () => {
  it('renders role="checkbox" unchecked by default', () => {
    render(
      <Checkbox.Root>
        <Checkbox.Indicator>✓</Checkbox.Indicator>
      </Checkbox.Root>,
    );
    expect(screen.getByRole('checkbox').getAttribute('aria-checked')).toBe('false');
    expect(screen.queryByText('✓')).toBeNull();
  });

  it('toggles checked on click', () => {
    render(
      <Checkbox.Root>
        <Checkbox.Indicator>✓</Checkbox.Indicator>
      </Checkbox.Root>,
    );
    fireEvent.click(screen.getByRole('checkbox'));
    expect(screen.getByRole('checkbox').getAttribute('aria-checked')).toBe('true');
    expect(screen.getByText('✓')).toBeInTheDocument();
  });

  it('indeterminate becomes checked on click', () => {
    render(
      <Checkbox.Root defaultChecked="indeterminate">
        <Checkbox.Indicator>i</Checkbox.Indicator>
      </Checkbox.Root>,
    );
    const cb = screen.getByRole('checkbox');
    expect(cb.getAttribute('aria-checked')).toBe('mixed');
    fireEvent.click(cb);
    expect(cb.getAttribute('aria-checked')).toBe('true');
  });

  it('indicator stays mounted with forceMount when unchecked', () => {
    render(
      <Checkbox.Root>
        <Checkbox.Indicator forceMount>✓</Checkbox.Indicator>
      </Checkbox.Root>,
    );
    expect(screen.getByText('✓')).toBeInTheDocument();
  });
});
