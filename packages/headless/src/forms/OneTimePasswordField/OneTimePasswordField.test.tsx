import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { OneTimePasswordField } from './OneTimePasswordField';

function Sample(props: Partial<Parameters<typeof OneTimePasswordField.Root>[0]> = {}) {
  return (
    <OneTimePasswordField.Root maxLength={6} {...props}>
      <OneTimePasswordField.Input data-testid="i0" />
      <OneTimePasswordField.Input data-testid="i1" />
      <OneTimePasswordField.Input data-testid="i2" />
      <OneTimePasswordField.Input data-testid="i3" />
      <OneTimePasswordField.Input data-testid="i4" />
      <OneTimePasswordField.Input data-testid="i5" />
      <OneTimePasswordField.HiddenInput name="otp" data-testid="hidden" />
    </OneTimePasswordField.Root>
  );
}

describe('OneTimePasswordField', () => {
  it('typing a digit advances focus to the next Input', () => {
    render(<Sample />);
    const i0 = screen.getByTestId('i0') as HTMLInputElement;
    i0.focus();
    fireEvent.change(i0, { target: { value: '1' } });
    expect(screen.getByTestId('i1')).toHaveFocus();
  });

  it('Backspace on empty Input moves focus to and clears previous', () => {
    function Probe() {
      const [v, setV] = useState('12');
      return <Sample value={v} onValueChange={setV} />;
    }
    render(<Probe />);
    // value="12" → i0=1, i1=2, i2=empty
    const i2 = screen.getByTestId('i2') as HTMLInputElement;
    i2.focus();
    fireEvent.keyDown(i2, { key: 'Backspace' });
    expect(screen.getByTestId('i1')).toHaveFocus();
    expect((screen.getByTestId('i1') as HTMLInputElement).value).toBe('');
  });

  it('paste distributes across Inputs starting from current', () => {
    function Probe() {
      const [v, setV] = useState('');
      return (
        <>
          <Sample value={v} onValueChange={setV} />
          <span data-testid="value">{v}</span>
        </>
      );
    }
    render(<Probe />);
    const i0 = screen.getByTestId('i0') as HTMLInputElement;
    i0.focus();
    fireEvent.paste(i0, { clipboardData: { getData: () => '123456' } });
    expect(screen.getByTestId('value').textContent).toBe('123456');
  });

  it('rejects non-numeric input when type="numeric" (default)', () => {
    function Probe() {
      const [v, setV] = useState('');
      return (
        <>
          <Sample value={v} onValueChange={setV} />
          <span data-testid="value">{v}</span>
        </>
      );
    }
    render(<Probe />);
    const i0 = screen.getByTestId('i0') as HTMLInputElement;
    fireEvent.change(i0, { target: { value: 'a' } });
    expect(screen.getByTestId('value').textContent).toBe('');
  });

  it('ArrowLeft/Right move focus between Inputs (LTR)', () => {
    render(<Sample />);
    const i2 = screen.getByTestId('i2') as HTMLInputElement;
    i2.focus();
    fireEvent.keyDown(i2, { key: 'ArrowLeft' });
    expect(screen.getByTestId('i1')).toHaveFocus();
    fireEvent.keyDown(screen.getByTestId('i1'), { key: 'ArrowRight' });
    expect(screen.getByTestId('i2')).toHaveFocus();
  });

  it('Home/End jump to first/last Input', () => {
    render(<Sample />);
    const i3 = screen.getByTestId('i3') as HTMLInputElement;
    i3.focus();
    fireEvent.keyDown(i3, { key: 'Home' });
    expect(screen.getByTestId('i0')).toHaveFocus();
    fireEvent.keyDown(screen.getByTestId('i0'), { key: 'End' });
    expect(screen.getByTestId('i5')).toHaveFocus();
  });

  it('HiddenInput reflects the combined value', () => {
    function Probe() {
      const [v, setV] = useState('');
      return <Sample value={v} onValueChange={setV} />;
    }
    render(<Probe />);
    const i0 = screen.getByTestId('i0') as HTMLInputElement;
    fireEvent.change(i0, { target: { value: '1' } });
    fireEvent.change(screen.getByTestId('i1'), { target: { value: '2' } });
    expect((screen.getByTestId('hidden') as HTMLInputElement).value).toBe('12');
  });

  it('value clamps to maxLength', () => {
    function Probe() {
      const [v, setV] = useState('');
      return (
        <>
          <Sample value={v} onValueChange={setV} maxLength={4} />
          <span data-testid="value">{v}</span>
        </>
      );
    }
    render(<Probe />);
    const i0 = screen.getByTestId('i0') as HTMLInputElement;
    fireEvent.paste(i0, { clipboardData: { getData: () => '12345678' } });
    expect(screen.getByTestId('value').textContent).toBe('1234');
  });
});
