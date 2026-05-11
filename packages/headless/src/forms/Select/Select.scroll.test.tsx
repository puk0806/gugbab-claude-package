import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Select } from './Select';

// ScrollUpButton / ScrollDownButton 의 onPointerEnter / onPointerLeave 사용자 콜백이
// 정확한 이벤트에 라우팅되어 호출되는지 확인. 이전에는 ScrollDownButton 의
// onPointerEnter 가 사용자 onPointerLeave 를 잘못 호출하던 회귀가 있었음.

function ScrollSample(props: {
  onUpEnter?: (e: React.PointerEvent<HTMLDivElement>) => void;
  onUpLeave?: (e: React.PointerEvent<HTMLDivElement>) => void;
  onDownEnter?: (e: React.PointerEvent<HTMLDivElement>) => void;
  onDownLeave?: (e: React.PointerEvent<HTMLDivElement>) => void;
}) {
  return (
    <Select.Root defaultOpen>
      <Select.Trigger aria-label="fruit">
        <Select.Value placeholder="Pick" />
      </Select.Trigger>
      <Select.Portal>
        <Select.Content>
          <Select.ScrollUpButton
            data-testid="scroll-up"
            onPointerEnter={props.onUpEnter}
            onPointerLeave={props.onUpLeave}
          />
          <Select.Viewport>
            <Select.Item value="apple">Apple</Select.Item>
          </Select.Viewport>
          <Select.ScrollDownButton
            data-testid="scroll-down"
            onPointerEnter={props.onDownEnter}
            onPointerLeave={props.onDownLeave}
          />
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}

describe('Select.ScrollUpButton', () => {
  it('forwards onPointerEnter to user callback exactly once', () => {
    const onUpEnter = vi.fn();
    const onUpLeave = vi.fn();
    const { getByTestId } = render(<ScrollSample onUpEnter={onUpEnter} onUpLeave={onUpLeave} />);
    fireEvent.pointerEnter(getByTestId('scroll-up'));
    expect(onUpEnter).toHaveBeenCalledTimes(1);
    expect(onUpLeave).not.toHaveBeenCalled();
  });

  it('forwards onPointerLeave to user callback exactly once', () => {
    const onUpEnter = vi.fn();
    const onUpLeave = vi.fn();
    const { getByTestId } = render(<ScrollSample onUpEnter={onUpEnter} onUpLeave={onUpLeave} />);
    fireEvent.pointerEnter(getByTestId('scroll-up'));
    fireEvent.pointerLeave(getByTestId('scroll-up'));
    expect(onUpLeave).toHaveBeenCalledTimes(1);
  });
});

describe('Select.ScrollDownButton', () => {
  it('forwards onPointerEnter to user callback exactly once (regression: was routing to onPointerLeave)', () => {
    const onDownEnter = vi.fn();
    const onDownLeave = vi.fn();
    const { getByTestId } = render(
      <ScrollSample onDownEnter={onDownEnter} onDownLeave={onDownLeave} />,
    );
    fireEvent.pointerEnter(getByTestId('scroll-down'));
    expect(onDownEnter).toHaveBeenCalledTimes(1);
    // 이전 회귀: onPointerEnter 발생 시 onDownLeave 가 호출됐었음
    expect(onDownLeave).not.toHaveBeenCalled();
  });

  it('forwards onPointerLeave to user callback exactly once (regression: was being called twice)', () => {
    const onDownEnter = vi.fn();
    const onDownLeave = vi.fn();
    const { getByTestId } = render(
      <ScrollSample onDownEnter={onDownEnter} onDownLeave={onDownLeave} />,
    );
    fireEvent.pointerEnter(getByTestId('scroll-down'));
    fireEvent.pointerLeave(getByTestId('scroll-down'));
    expect(onDownLeave).toHaveBeenCalledTimes(1);
  });
});
