import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Skeleton } from './Skeleton';

describe('Skeleton', () => {
  it('renders role="status" with aria-busy + default variant', () => {
    const { getByRole } = render(<Skeleton />);
    const el = getByRole('status');
    expect(el).toHaveAttribute('aria-busy', 'true');
    expect(el).toHaveAttribute('aria-live', 'polite');
    expect(el).toHaveAttribute('data-variant', 'rectangular');
  });

  it('forwards variant prop to data-variant', () => {
    const { getByRole } = render(<Skeleton variant="circular" />);
    expect(getByRole('status')).toHaveAttribute('data-variant', 'circular');
  });

  it('forwards extra props (className, style)', () => {
    const { getByRole } = render(<Skeleton className="custom" style={{ width: 40 }} />);
    const el = getByRole('status');
    expect(el).toHaveClass('custom');
    expect(el.style.width).toBe('40px');
  });
});
