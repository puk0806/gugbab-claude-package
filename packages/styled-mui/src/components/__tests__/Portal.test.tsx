import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Portal } from '../Portal';

describe('Portal (styled-mui — re-export from headless)', () => {
  it('is exported as a defined value', () => {
    expect(Portal).toBeDefined();
  });

  it('renders children into document.body via portal', () => {
    render(
      <Portal>
        <span data-testid="portal-child">hello</span>
      </Portal>,
    );
    expect(document.body.querySelector('[data-testid="portal-child"]')).toBeInTheDocument();
  });
});
