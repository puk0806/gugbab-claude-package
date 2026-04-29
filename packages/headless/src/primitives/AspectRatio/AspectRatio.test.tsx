import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AspectRatio } from './AspectRatio';

describe('AspectRatio', () => {
  it('wraps the inner element in an outer wrapper with padding-bottom', () => {
    const { container } = render(
      <AspectRatio ratio={16 / 9}>
        <span>child</span>
      </AspectRatio>,
    );
    const wrapper = container.querySelector('[data-aspect-ratio-wrapper]') as HTMLElement;
    expect(wrapper).not.toBeNull();
    expect(wrapper.style.position).toBe('relative');
    expect(wrapper.style.width).toBe('100%');
    expect(wrapper.style.paddingBottom).toBe(`${100 / (16 / 9)}%`);
  });

  it('inner element fills the wrapper absolutely', () => {
    render(
      <AspectRatio ratio={1} data-testid="ar">
        <span>child</span>
      </AspectRatio>,
    );
    const inner = screen.getByTestId('ar');
    expect(inner.style.position).toBe('absolute');
    expect(inner.style.top).toBe('0px');
    expect(inner.style.right).toBe('0px');
    expect(inner.style.bottom).toBe('0px');
    expect(inner.style.left).toBe('0px');
  });

  it('renders children inside the inner element', () => {
    render(
      <AspectRatio ratio={1}>
        <span>child</span>
      </AspectRatio>,
    );
    expect(screen.getByText('child')).toBeInTheDocument();
  });

  it('defaults to 1:1 when ratio is omitted', () => {
    const { container } = render(
      <AspectRatio>
        <span>child</span>
      </AspectRatio>,
    );
    const wrapper = container.querySelector('[data-aspect-ratio-wrapper]') as HTMLElement;
    expect(wrapper.style.paddingBottom).toBe('100%');
  });

  it('merges user style on the inner element', () => {
    render(
      <AspectRatio ratio={2} data-testid="ar" style={{ backgroundColor: 'red' }}>
        <span>child</span>
      </AspectRatio>,
    );
    const inner = screen.getByTestId('ar');
    expect(inner.style.backgroundColor).toBe('red');
    expect(inner.style.position).toBe('absolute');
  });
});
