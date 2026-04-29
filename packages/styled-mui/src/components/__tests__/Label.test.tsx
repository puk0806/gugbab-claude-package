import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Label } from '../Label';

describe('Label (styled-mui)', () => {
  it('renders with gmui-label class', () => {
    render(<Label data-testid="lbl">Email</Label>);
    expect(screen.getByTestId('lbl')).toHaveClass('gmui-label');
  });

  it('forwards htmlFor to underlying label', () => {
    render(
      <>
        <Label htmlFor="email">Email</Label>
        <input id="email" type="email" />
      </>,
    );
    const label = screen.getByText('Email');
    expect(label).toHaveAttribute('for', 'email');
  });

  it('preserves consumer className alongside built-in', () => {
    render(
      <Label data-testid="lbl" className="custom">
        x
      </Label>,
    );
    const lbl = screen.getByTestId('lbl');
    expect(lbl).toHaveClass('gmui-label');
    expect(lbl).toHaveClass('custom');
  });
});
