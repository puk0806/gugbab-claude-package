import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Separator } from '../Separator';

describe('Separator (styled-mui)', () => {
  it('renders gmui-separator with default horizontal orientation', () => {
    const { container } = render(<Separator data-testid="sep" />);
    const el = container.querySelector('[data-testid="sep"]');
    expect(el).toHaveClass('gmui-separator');
    expect(el).toHaveClass('gmui-separator--horizontal');
  });

  it('renders vertical orientation modifier', () => {
    const { container } = render(<Separator data-testid="sep" orientation="vertical" />);
    expect(container.querySelector('[data-testid="sep"]')).toHaveClass('gmui-separator--vertical');
  });

  it('merges consumer className', () => {
    const { container } = render(<Separator data-testid="sep" className="custom" />);
    const el = container.querySelector('[data-testid="sep"]');
    expect(el).toHaveClass('gmui-separator');
    expect(el).toHaveClass('custom');
  });

  it('forwards ref', () => {
    let captured: HTMLDivElement | null = null;
    render(<Separator ref={(el) => (captured = el)} />);
    expect(captured).toBeInstanceOf(HTMLDivElement);
  });
});
