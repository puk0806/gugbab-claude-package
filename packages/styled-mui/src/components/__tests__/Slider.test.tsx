import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Slider } from '../Slider';

describe('Slider (styled-mui)', () => {
  it('Root applies gmui-slider with default md size', () => {
    const { container } = render(
      <Slider.Root data-testid="root" defaultValue={[20]}>
        <Slider.Track>
          <Slider.Range />
        </Slider.Track>
        <Slider.Thumb />
      </Slider.Root>,
    );
    const el = container.querySelector('[data-testid="root"]');
    expect(el).toHaveClass('gmui-slider');
    expect(el).toHaveClass('gmui-slider--md');
  });

  it.each(['sm', 'md'] as const)('size %s applies modifier', (size) => {
    const { container } = render(
      <Slider.Root data-testid="root" size={size} defaultValue={[20]}>
        <Slider.Track />
        <Slider.Thumb />
      </Slider.Root>,
    );
    expect(container.querySelector('[data-testid="root"]')).toHaveClass(`gmui-slider--${size}`);
  });

  it('Track/Range/Thumb have BEM classes', () => {
    const { container } = render(
      <Slider.Root defaultValue={[40]}>
        <Slider.Track data-testid="track">
          <Slider.Range data-testid="range" />
        </Slider.Track>
        <Slider.Thumb data-testid="thumb" />
      </Slider.Root>,
    );
    expect(container.querySelector('[data-testid="track"]')).toHaveClass('gmui-slider__track');
    expect(container.querySelector('[data-testid="range"]')).toHaveClass('gmui-slider__range');
    expect(container.querySelector('[data-testid="thumb"]')).toHaveClass('gmui-slider__thumb');
  });
});
