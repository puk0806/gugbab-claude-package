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

  it('renders hidden radio BubbleInputs when name is provided', () => {
    const { container } = render(<Sample name="color" defaultValue="a" />);
    const radios = container.querySelectorAll('input[type="radio"]');
    expect(radios.length).toBe(3);
    expect(radios[0]?.getAttribute('name')).toBe('color');
  });

  it('BubbleInput value attributes match item values', () => {
    const { container } = render(<Sample name="color" defaultValue="b" />);
    const radios = container.querySelectorAll<HTMLInputElement>('input[type="radio"]');
    expect(radios[0]?.value).toBe('a');
    expect(radios[1]?.value).toBe('b');
    expect(radios[2]?.value).toBe('c');
  });

  it('does not render BubbleInput when name prop is not explicitly provided', () => {
    const { container } = render(<Sample defaultValue="a" />);
    const radios = container.querySelectorAll('input[type="radio"]');
    // name was not passed to Sample → hasName=false → no BubbleInputs
    expect(radios.length).toBe(0);
  });
});
