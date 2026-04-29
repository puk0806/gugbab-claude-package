import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Slider } from './Slider';

describe('Slider', () => {
  it('renders role=slider with aria-valuenow from default value', () => {
    render(
      <Slider.Root defaultValue={[30]} min={0} max={100}>
        <Slider.Track>
          <Slider.Range />
        </Slider.Track>
        <Slider.Thumb aria-label="volume" />
      </Slider.Root>,
    );
    const thumb = screen.getByRole('slider');
    expect(thumb.getAttribute('aria-valuenow')).toBe('30');
  });

  it('ArrowRight increases the value by step', () => {
    render(
      <Slider.Root defaultValue={[10]} min={0} max={100} step={5}>
        <Slider.Thumb />
      </Slider.Root>,
    );
    const thumb = screen.getByRole('slider');
    thumb.focus();
    fireEvent.keyDown(thumb, { key: 'ArrowRight' });
    expect(thumb.getAttribute('aria-valuenow')).toBe('15');
  });

  it('clamps value at max', () => {
    render(
      <Slider.Root defaultValue={[98]} min={0} max={100} step={5}>
        <Slider.Thumb />
      </Slider.Root>,
    );
    const thumb = screen.getByRole('slider');
    thumb.focus();
    fireEvent.keyDown(thumb, { key: 'End' });
    expect(thumb.getAttribute('aria-valuenow')).toBe('100');
    fireEvent.keyDown(thumb, { key: 'ArrowRight' });
    expect(thumb.getAttribute('aria-valuenow')).toBe('100');
  });

  it('Home jumps to min', () => {
    render(
      <Slider.Root defaultValue={[50]} min={0} max={100}>
        <Slider.Thumb />
      </Slider.Root>,
    );
    const thumb = screen.getByRole('slider');
    thumb.focus();
    fireEvent.keyDown(thumb, { key: 'Home' });
    expect(thumb.getAttribute('aria-valuenow')).toBe('0');
  });

  it('range slider: second thumb controls values[1]', () => {
    render(
      <Slider.Root defaultValue={[20, 80]}>
        <Slider.Thumb index={0} aria-label="min" />
        <Slider.Thumb index={1} aria-label="max" />
      </Slider.Root>,
    );
    const [minThumb, maxThumb] = screen.getAllByRole('slider');
    expect(minThumb.getAttribute('aria-valuenow')).toBe('20');
    expect(maxThumb.getAttribute('aria-valuenow')).toBe('80');

    maxThumb.focus();
    fireEvent.keyDown(maxThumb, { key: 'ArrowLeft' });
    expect(maxThumb.getAttribute('aria-valuenow')).toBe('79');
    expect(minThumb.getAttribute('aria-valuenow')).toBe('20');
  });
});
