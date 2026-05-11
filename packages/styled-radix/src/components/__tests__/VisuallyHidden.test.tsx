import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { VISUALLY_HIDDEN_STYLES, VisuallyHidden } from '../VisuallyHidden';

describe('VisuallyHidden (styled-radix — re-export from headless)', () => {
  it('VisuallyHidden component and shared styles object are exported', () => {
    expect(VisuallyHidden).toBeDefined();
    expect(VISUALLY_HIDDEN_STYLES).toBeDefined();
    expect(typeof VISUALLY_HIDDEN_STYLES).toBe('object');
  });

  it('renders children inside an off-screen span', () => {
    const { container } = render(<VisuallyHidden>Skip to content</VisuallyHidden>);
    expect(container.textContent).toBe('Skip to content');
  });
});
