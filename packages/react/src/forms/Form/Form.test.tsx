import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Form } from './Form';

describe('Form', () => {
  it('Root renders a native <form>', () => {
    render(
      <Form.Root data-testid="f">
        <input />
      </Form.Root>,
    );
    expect(screen.getByTestId('f').tagName).toBe('FORM');
  });

  it('Field/Control wires the input name from Field', () => {
    render(
      <Form.Root>
        <Form.Field name="email">
          <Form.Label>Email</Form.Label>
          <Form.Control data-testid="ctl" />
        </Form.Field>
      </Form.Root>,
    );
    const input = screen.getByTestId('ctl');
    expect(input.tagName).toBe('INPUT');
    expect(input.getAttribute('name')).toBe('email');
  });

  it('Label htmlFor matches Control id', () => {
    render(
      <Form.Root>
        <Form.Field name="email">
          <Form.Label data-testid="lbl">Email</Form.Label>
          <Form.Control data-testid="ctl" />
        </Form.Field>
      </Form.Root>,
    );
    const label = screen.getByTestId('lbl') as HTMLLabelElement;
    const input = screen.getByTestId('ctl') as HTMLInputElement;
    expect(label.htmlFor).toBe(input.id);
  });

  it('Message shows when validity matches "valueMissing" and input is invalid', () => {
    render(
      <Form.Root>
        <Form.Field name="email">
          <Form.Label>Email</Form.Label>
          <Form.Control required data-testid="ctl" />
          <Form.Message match="valueMissing" data-testid="msg">
            Required
          </Form.Message>
        </Form.Field>
      </Form.Root>,
    );
    const input = screen.getByTestId('ctl') as HTMLInputElement;
    // initially valid (no submit/no blur), message hidden
    expect(screen.queryByTestId('msg')).toBeNull();
    // simulate invalid event (browser would fire on submit attempt of empty required)
    fireEvent.invalid(input);
    expect(screen.getByTestId('msg')).toBeInTheDocument();
  });

  it('Message stays hidden when input becomes valid after being invalid', () => {
    render(
      <Form.Root>
        <Form.Field name="email">
          <Form.Control required data-testid="ctl" />
          <Form.Message match="valueMissing" data-testid="msg">
            Required
          </Form.Message>
        </Form.Field>
      </Form.Root>,
    );
    const input = screen.getByTestId('ctl') as HTMLInputElement;
    fireEvent.invalid(input);
    expect(screen.getByTestId('msg')).toBeInTheDocument();
    fireEvent.change(input, { target: { value: 'a@b.com' } });
    expect(screen.queryByTestId('msg')).toBeNull();
  });

  it('Submit calls onSubmit when the form is submitted', () => {
    const onSubmit = vi.fn((e) => e.preventDefault());
    render(
      <Form.Root onSubmit={onSubmit}>
        <Form.Submit data-testid="submit">Go</Form.Submit>
      </Form.Root>,
    );
    fireEvent.click(screen.getByTestId('submit'));
    expect(onSubmit).toHaveBeenCalled();
  });
});
