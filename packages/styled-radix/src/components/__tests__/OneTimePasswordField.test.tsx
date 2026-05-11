import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { OneTimePasswordField } from '../OneTimePasswordField';

describe('OneTimePasswordField (styled-radix)', () => {
  it('Root applies grx-otp', () => {
    const { container } = render(
      <OneTimePasswordField.Root data-testid="root" length={4}>
        <OneTimePasswordField.Input index={0} />
      </OneTimePasswordField.Root>,
    );
    expect(container.querySelector('[data-testid="root"]')).toHaveClass('grx-otp');
  });

  it('Input applies grx-otp__input', () => {
    const { container } = render(
      <OneTimePasswordField.Root length={4}>
        <OneTimePasswordField.Input data-testid="input" index={0} />
      </OneTimePasswordField.Root>,
    );
    expect(container.querySelector('[data-testid="input"]')).toHaveClass('grx-otp__input');
  });
});
