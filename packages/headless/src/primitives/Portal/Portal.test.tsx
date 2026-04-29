import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Portal } from './Portal';

describe('Portal', () => {
  it('renders children into a wrapper div appended to document.body by default', () => {
    render(
      <Portal>
        <span data-testid="p">hi</span>
      </Portal>,
    );
    const inner = screen.getByTestId('p');
    // Radix wraps children in a <div> attached to the container
    expect(inner.parentElement?.tagName).toBe('DIV');
    expect(inner.parentElement?.parentElement).toBe(document.body);
  });

  it('renders children into a provided container', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    render(
      <Portal container={container}>
        <span data-testid="p">hi</span>
      </Portal>,
    );

    const inner = screen.getByTestId('p');
    expect(inner.parentElement?.parentElement).toBe(container);

    document.body.removeChild(container);
  });

  it('renders nothing when container is explicitly null', () => {
    const { container } = render(
      <Portal container={null}>
        <span data-testid="p">hi</span>
      </Portal>,
    );
    expect(container.firstChild).toBeNull();
  });

  it('forwards HTML props (className) to the wrapper div', () => {
    render(
      <Portal className="my-portal">
        <span data-testid="p">hi</span>
      </Portal>,
    );
    const wrapper = screen.getByTestId('p').parentElement as HTMLElement;
    expect(wrapper.className).toContain('my-portal');
  });
});
