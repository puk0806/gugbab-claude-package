import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Form } from '../Form';

describe('Form (styled-radix)', () => {
  it('Root applies grx-form', () => {
    const { container } = render(<Form.Root data-testid="root" />);
    expect(container.querySelector('[data-testid="root"]')).toHaveClass('grx-form');
  });

  it('Field/Label/Control/Message/Submit have BEM classes', () => {
    const { container } = render(
      <Form.Root>
        <Form.Field data-testid="field" name="x">
          <Form.Label data-testid="label">x</Form.Label>
          <Form.Control data-testid="control" />
          <Form.Message data-testid="msg" match="valueMissing">
            err
          </Form.Message>
        </Form.Field>
        <Form.Submit data-testid="submit">go</Form.Submit>
      </Form.Root>,
    );
    expect(container.querySelector('[data-testid="field"]')).toHaveClass('grx-form__field');
    expect(container.querySelector('[data-testid="label"]')).toHaveClass('grx-form__label');
    expect(container.querySelector('[data-testid="control"]')).toHaveClass('grx-form__control');
    expect(container.querySelector('[data-testid="submit"]')).toHaveClass('grx-form__submit');
  });

  it.each([
    'error',
    'success',
    'warning',
    'serverInvalid',
  ] as const)('Field status %s applies modifier', (status) => {
    const { container } = render(
      <Form.Root>
        <Form.Field data-testid="field" name="x" status={status}>
          <Form.Label>x</Form.Label>
          <Form.Control />
        </Form.Field>
      </Form.Root>,
    );
    expect(container.querySelector('[data-testid="field"]')).toHaveClass(
      `grx-form__field--${status}`,
    );
  });

  it('Field default status omits status modifier', () => {
    const { container } = render(
      <Form.Root>
        <Form.Field data-testid="field" name="x">
          <Form.Label>x</Form.Label>
          <Form.Control />
        </Form.Field>
      </Form.Root>,
    );
    const el = container.querySelector('[data-testid="field"]');
    expect(el).toHaveClass('grx-form__field');
    expect(el?.className).not.toMatch(/grx-form__field--(error|success|warning|serverInvalid)/);
  });
});
