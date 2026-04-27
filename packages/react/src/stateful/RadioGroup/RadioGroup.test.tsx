import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { RadioGroup } from './RadioGroup';

function Sample(props: Parameters<typeof RadioGroup.Root>[0]) {
  return (
    <RadioGroup.Root {...props}>
      <RadioGroup.Item value="a">A</RadioGroup.Item>
      <RadioGroup.Item value="b">B</RadioGroup.Item>
      <RadioGroup.Item value="c">C</RadioGroup.Item>
    </RadioGroup.Root>
  );
}

describe('RadioGroup', () => {
  it('selects item on click', () => {
    render(<Sample />);
    fireEvent.click(screen.getByText('A'));
    expect(screen.getByText('A').getAttribute('aria-checked')).toBe('true');
    fireEvent.click(screen.getByText('B'));
    expect(screen.getByText('A').getAttribute('aria-checked')).toBe('false');
    expect(screen.getByText('B').getAttribute('aria-checked')).toBe('true');
  });

  it('ArrowDown moves focus & selection to next (vertical default)', () => {
    render(<Sample defaultValue="a" />);
    const a = screen.getByText('A');
    a.focus();
    fireEvent.keyDown(a, { key: 'ArrowDown' });
    expect(screen.getByText('B').getAttribute('aria-checked')).toBe('true');
  });

  it('ArrowUp wraps to last item', () => {
    render(<Sample defaultValue="a" />);
    const a = screen.getByText('A');
    a.focus();
    fireEvent.keyDown(a, { key: 'ArrowUp' });
    expect(screen.getByText('C').getAttribute('aria-checked')).toBe('true');
  });

  it('horizontal orientation uses ArrowLeft/Right', () => {
    render(<Sample orientation="horizontal" defaultValue="a" />);
    const a = screen.getByText('A');
    a.focus();
    fireEvent.keyDown(a, { key: 'ArrowRight' });
    expect(screen.getByText('B').getAttribute('aria-checked')).toBe('true');
  });
});
