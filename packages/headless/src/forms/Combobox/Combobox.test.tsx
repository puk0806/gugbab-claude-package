import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Combobox } from './Combobox';

describe('Combobox', () => {
  it('opens on input focus and selects on item click', () => {
    const onValueChange = vi.fn();
    render(
      <Combobox.Root onValueChange={onValueChange}>
        <Combobox.Anchor>
          <Combobox.Input aria-label="fruit" />
        </Combobox.Anchor>
        <Combobox.Portal>
          <Combobox.Content>
            <Combobox.Item value="apple">Apple</Combobox.Item>
            <Combobox.Item value="banana">Banana</Combobox.Item>
          </Combobox.Content>
        </Combobox.Portal>
      </Combobox.Root>,
    );

    fireEvent.focus(screen.getByLabelText('fruit'));
    expect(screen.getByText('Apple')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Apple'));
    expect(onValueChange).toHaveBeenCalledWith('apple');
  });
});

// 재오픈 시나리오: Escape로 닫은 뒤 ArrowDown 3회 — 첫 회는 목록 열기, 이후 2회가
// 첫 번째 → 두 번째 항목으로 이동하므로 DOM 순서상 두 번째 항목이 선택되어야 한다.
const REOPEN_EXPECTED = 'banana';

function Fruits({
  onValueChange,
  items = ['apple', 'banana', 'cherry'],
}: {
  onValueChange?: (v: string) => void;
  items?: string[];
}) {
  return (
    <Combobox.Root onValueChange={onValueChange}>
      <Combobox.Anchor>
        <Combobox.Input aria-label="fruit" />
      </Combobox.Anchor>
      <Combobox.Portal>
        <Combobox.Content>
          {items.map((v) => (
            <Combobox.Item key={v} value={v}>
              {v}
            </Combobox.Item>
          ))}
        </Combobox.Content>
      </Combobox.Portal>
    </Combobox.Root>
  );
}

describe('Combobox — 키보드 선택', () => {
  it('ArrowDown 두 번 후 Enter로 두 번째 항목을 선택한다', () => {
    const onValueChange = vi.fn();
    render(<Fruits onValueChange={onValueChange} />);
    const input = screen.getByLabelText('fruit');

    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onValueChange).toHaveBeenCalledWith('banana');
    expect(screen.queryByRole('option')).toBeNull();
  });

  it('활성 항목에 data-highlighted가 붙고 input의 aria-activedescendant가 그 id를 가리킨다', () => {
    render(<Fruits />);
    const input = screen.getByLabelText('fruit');
    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: 'ArrowDown' });

    const highlighted = screen.getAllByRole('option').filter((o) => o.hasAttribute('data-highlighted'));
    expect(highlighted).toHaveLength(1);
    expect(highlighted[0]).toHaveTextContent('apple');
    expect(input.getAttribute('aria-activedescendant')).toBe(highlighted[0].id);
  });
});

describe('Combobox — 재오픈·필터 (경계)', () => {
  it('닫았다 다시 열어도 키보드 선택이 DOM 순서대로 동작한다', () => {
    const onValueChange = vi.fn();
    render(<Fruits onValueChange={onValueChange} />);
    const input = screen.getByLabelText('fruit');

    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(screen.queryByRole('option')).toBeNull();

    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });

    // 누적 버그가 있으면 분리된 노드를 가리켜 호출되지 않거나 엉뚱한 값이 된다
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenCalledWith(REOPEN_EXPECTED);
  });

  it('IME 조합 중 Enter는 항목을 선택하지 않는다 (한글 입력 확정)', () => {
    const onValueChange = vi.fn();
    render(<Fruits onValueChange={onValueChange} />);
    const input = screen.getByLabelText('fruit');
    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter', isComposing: true });
    fireEvent.keyDown(input, { key: 'Enter', keyCode: 229 });

    expect(onValueChange).not.toHaveBeenCalled();
    expect(screen.getAllByRole('option')).toHaveLength(3);
  });

  it('활성 항목이 필터로 사라지면 Enter를 가로채지 않는다 (폼 제출 유지)', () => {
    const onValueChange = vi.fn();
    const { rerender } = render(<Fruits onValueChange={onValueChange} />);
    const input = screen.getByLabelText('fruit');
    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'ArrowDown' });

    rerender(<Fruits onValueChange={onValueChange} items={['apple']} />);
    const notPrevented = fireEvent.keyDown(input, { key: 'Enter' });

    expect(onValueChange).not.toHaveBeenCalled();
    expect(notPrevented).toBe(true);
  });

  it('활성 항목이 없을 때 어떤 항목에도 data-highlighted가 없다', () => {
    render(<Fruits />);
    fireEvent.focus(screen.getByLabelText('fruit'));
    expect(screen.getAllByRole('option').some((o) => o.hasAttribute('data-highlighted'))).toBe(false);
  });

  it('필터로 목록이 바뀌면 새 목록 기준으로 선택한다', () => {
    const onValueChange = vi.fn();
    const { rerender } = render(<Fruits onValueChange={onValueChange} />);
    const input = screen.getByLabelText('fruit');
    fireEvent.focus(input);

    rerender(<Fruits onValueChange={onValueChange} items={['cherry']} />);
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onValueChange).toHaveBeenCalledWith('cherry');
  });

  it('활성 항목이 없을 때 Enter는 아무것도 선택하지 않는다', () => {
    const onValueChange = vi.fn();
    render(<Fruits onValueChange={onValueChange} />);
    const input = screen.getByLabelText('fruit');
    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('disabled 항목은 Enter로도 선택되지 않는다 (오남용 방어)', () => {
    const onValueChange = vi.fn();
    render(
      <Combobox.Root onValueChange={onValueChange}>
        <Combobox.Anchor>
          <Combobox.Input aria-label="fruit" />
        </Combobox.Anchor>
        <Combobox.Portal>
          <Combobox.Content>
            <Combobox.Item value="apple" disabled>
              apple
            </Combobox.Item>
          </Combobox.Content>
        </Combobox.Portal>
      </Combobox.Root>,
    );
    const input = screen.getByLabelText('fruit');
    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onValueChange).not.toHaveBeenCalled();
  });
});
