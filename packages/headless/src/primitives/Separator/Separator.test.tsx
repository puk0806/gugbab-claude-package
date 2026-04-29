import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Separator } from './Separator';

describe('Separator', () => {
  it('uses role="separator" with horizontal orientation by default (aria-orientation omitted, matching ARIA default)', () => {
    render(<Separator data-testid="s" />);
    const el = screen.getByTestId('s');
    expect(el.getAttribute('role')).toBe('separator');
    // ARIA default for separator orientation is horizontal — Radix omits the explicit attr
    expect(el.hasAttribute('aria-orientation')).toBe(false);
    expect(el.getAttribute('data-orientation')).toBe('horizontal');
  });

  it('reports aria-orientation="vertical" when orientation is vertical', () => {
    render(<Separator orientation="vertical" data-testid="s" />);
    const el = screen.getByTestId('s');
    expect(el.getAttribute('aria-orientation')).toBe('vertical');
    expect(el.getAttribute('data-orientation')).toBe('vertical');
  });

  it('uses role="none" and omits aria-orientation when decorative', () => {
    render(<Separator decorative data-testid="s" />);
    const el = screen.getByTestId('s');
    expect(el.getAttribute('role')).toBe('none');
    expect(el.hasAttribute('aria-orientation')).toBe(false);
  });
});
