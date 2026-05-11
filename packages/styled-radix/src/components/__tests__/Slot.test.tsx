import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Slot, Slottable } from '../Slot';

describe('Slot (styled-radix — re-export from headless)', () => {
  it('Slot and Slottable are defined', () => {
    expect(Slot).toBeDefined();
    expect(Slottable).toBeDefined();
  });

  it('Slot merges props onto its single child', () => {
    const { container } = render(
      <Slot className="from-slot">
        <button type="button" data-testid="btn" className="from-child">
          go
        </button>
      </Slot>,
    );
    const btn = container.querySelector('[data-testid="btn"]');
    // Both className values should chain — child first, slot appended.
    expect(btn?.className).toContain('from-child');
    expect(btn?.className).toContain('from-slot');
  });
});
