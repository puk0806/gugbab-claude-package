import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { OneTimePasswordField } from './OneTimePasswordField';

function Dynamic() {
  const [count, setCount] = useState(4);
  return (
    <>
      <button type="button" onClick={() => setCount(3)}>
        shrink
      </button>
      <OneTimePasswordField.Root maxLength={count}>
        {Array.from({ length: count }, (_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: fixed positional slots
          <OneTimePasswordField.Input key={i} data-testid={`i${i}`} />
        ))}
      </OneTimePasswordField.Root>
    </>
  );
}

describe('OneTimePasswordField — 동적 칸 수 (경계)', () => {
  it('칸이 줄어든 뒤 End 는 남아 있는 마지막 칸으로 간다 (지워진 칸을 가리키지 않음)', () => {
    render(<Dynamic />);
    fireEvent.click(screen.getByText('shrink'));
    expect(screen.queryByTestId('i3')).toBeNull();

    const i0 = screen.getByTestId('i0');
    i0.focus();
    fireEvent.keyDown(i0, { key: 'End' });
    expect(document.activeElement).toBe(screen.getByTestId('i2'));
  });
});

function Six() {
  return (
    <OneTimePasswordField.Root maxLength={6} type="alphanumeric">
      {Array.from({ length: 6 }, (_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: fixed positional slots
        <OneTimePasswordField.Input key={i} data-testid={`s${i}`} />
      ))}
    </OneTimePasswordField.Root>
  );
}

function paste(el: HTMLElement, text: string) {
  fireEvent.paste(el, { clipboardData: { getData: () => text } });
}

describe('OneTimePasswordField — 악성·비정상 입력', () => {
  it('초장문 붙여넣기는 칸 수만큼만 채우고 나머지는 버린다', () => {
    render(<Six />);
    const s0 = screen.getByTestId('s0') as HTMLInputElement;
    s0.focus();
    paste(s0, 'A'.repeat(10_000));
    const values = Array.from(
      { length: 6 },
      (_, i) => (screen.getByTestId(`s${i}`) as HTMLInputElement).value,
    );
    expect(values.join('')).toBe('AAAAAA');
  });

  it('마크업 문자열을 붙여넣어도 DOM 요소가 생기지 않는다 (텍스트로만 취급)', () => {
    const { container } = render(<Six />);
    const s0 = screen.getByTestId('s0');
    s0.focus();
    paste(s0, '<img src=x onerror=alert(1)>');
    expect(container.querySelector('img')).toBeNull();
  });
});
