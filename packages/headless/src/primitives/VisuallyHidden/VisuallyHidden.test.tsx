import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { VisuallyHidden } from './VisuallyHidden';

describe('VisuallyHidden', () => {
  it('renders children', () => {
    render(<VisuallyHidden>hello</VisuallyHidden>);
    expect(screen.getByText('hello')).toBeInTheDocument();
  });

  it('applies visually-hidden styles that keep content accessible but not visible', () => {
    render(<VisuallyHidden data-testid="vh">x</VisuallyHidden>);
    const el = screen.getByTestId('vh');
    expect(el.style.position).toBe('absolute');
    expect(el.style.width).toBe('1px');
    expect(el.style.height).toBe('1px');
    expect(el.style.overflow).toBe('hidden');
    expect(el.style.whiteSpace).toBe('nowrap');
  });

  it('merges user-provided style without dropping visually-hidden styles', () => {
    render(<VisuallyHidden data-testid="vh" style={{ color: 'red' }} />);
    const el = screen.getByTestId('vh');
    expect(el.style.color).toBe('red');
    expect(el.style.position).toBe('absolute');
  });
});
