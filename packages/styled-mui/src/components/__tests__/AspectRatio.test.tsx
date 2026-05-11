import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AspectRatio } from '../AspectRatio';

describe('AspectRatio (styled-mui)', () => {
  it('renders with gmui-aspect-ratio class', () => {
    const { container } = render(<AspectRatio data-testid="ar" />);
    expect(container.querySelector('[data-testid="ar"]')).toHaveClass('gmui-aspect-ratio');
  });

  it('forwards ratio prop to headless', () => {
    const { container } = render(<AspectRatio data-testid="ar" ratio={16 / 9} />);
    expect(container.querySelector('[data-testid="ar"]')).toBeInTheDocument();
  });

  it('merges consumer className', () => {
    const { container } = render(<AspectRatio data-testid="ar" className="custom" />);
    const el = container.querySelector('[data-testid="ar"]');
    expect(el).toHaveClass('gmui-aspect-ratio');
    expect(el).toHaveClass('custom');
  });

  it('forwards ref', () => {
    let captured: HTMLDivElement | null = null;
    render(<AspectRatio ref={(el) => (captured = el)} />);
    expect(captured).toBeInstanceOf(HTMLDivElement);
  });
});
