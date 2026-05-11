import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Toggle } from '../Toggle';

describe('Toggle (styled-mui)', () => {
  it('renders gmui-toggle with default size + variant', () => {
    const { container } = render(<Toggle data-testid="t" />);
    const el = container.querySelector('[data-testid="t"]');
    expect(el).toHaveClass('gmui-toggle');
    expect(el).toHaveClass('gmui-toggle--md');
    expect(el).toHaveClass('gmui-toggle--default');
  });

  it.each(['sm', 'md'] as const)('applies size %s', (size) => {
    const { container } = render(<Toggle data-testid="t" size={size} />);
    expect(container.querySelector('[data-testid="t"]')).toHaveClass(`gmui-toggle--${size}`);
  });

  it.each(['default', 'outline'] as const)('applies variant %s', (variant) => {
    const { container } = render(<Toggle data-testid="t" variant={variant} />);
    expect(container.querySelector('[data-testid="t"]')).toHaveClass(`gmui-toggle--${variant}`);
  });

  it('merges consumer className with built-ins', () => {
    const { container } = render(
      <Toggle data-testid="t" size="sm" variant="outline" className="custom" />,
    );
    const el = container.querySelector('[data-testid="t"]');
    expect(el).toHaveClass('gmui-toggle');
    expect(el).toHaveClass('gmui-toggle--sm');
    expect(el).toHaveClass('gmui-toggle--outline');
    expect(el).toHaveClass('custom');
  });

  it('forwards ref', () => {
    let captured: HTMLButtonElement | null = null;
    render(<Toggle ref={(el) => (captured = el)} />);
    expect(captured).toBeInstanceOf(HTMLButtonElement);
  });
});
