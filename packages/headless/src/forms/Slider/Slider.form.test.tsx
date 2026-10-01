import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Slider } from './Slider';

function FormSlider({ onInput, value }: { onInput: () => void; value?: number[] }) {
  return (
    <form onInput={onInput}>
      <Slider.Root
        name="volume"
        {...(value ? { value } : { defaultValue: [50] })}
        min={0}
        max={100}
      >
        <Slider.Track>
          <Slider.Range />
        </Slider.Track>
        <Slider.Thumb aria-label="volume" />
      </Slider.Root>
    </form>
  );
}

describe('Slider — 폼 연동용 숨은 input 이벤트', () => {
  it('마운트만으로는 input 이벤트를 보내지 않는다 (초기 렌더에 폼 onInput 오발화 금지)', () => {
    const onInput = vi.fn();
    render(<FormSlider onInput={onInput} />);
    expect(onInput).not.toHaveBeenCalled();
  });

  it('값이 바뀌면 input 이벤트를 정확히 한 번 보낸다 (회귀 방지)', () => {
    const onInput = vi.fn();
    render(<FormSlider onInput={onInput} />);
    const thumb = screen.getByRole('slider');
    thumb.focus();
    fireEvent.keyDown(thumb, { key: 'ArrowRight' });
    expect(onInput).toHaveBeenCalledTimes(1);
  });

  it('같은 값으로 다시 렌더링하면 이벤트를 보내지 않는다 (경계)', () => {
    const onInput = vi.fn();
    const { rerender } = render(<FormSlider onInput={onInput} value={[30]} />);
    rerender(<FormSlider onInput={onInput} value={[30]} />);
    expect(onInput).not.toHaveBeenCalled();
  });

  it('Root 밖의 Thumb 은 명확한 에러로 거부한다 (오용)', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Slider.Thumb aria-label="orphan" />)).toThrow(
      'must be used inside <Slider.Root>',
    );
    spy.mockRestore();
  });
});
