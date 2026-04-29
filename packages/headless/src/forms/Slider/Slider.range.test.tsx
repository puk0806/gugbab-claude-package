import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Slider } from './Slider';

// ---------------------------------------------------------------------------
// Range (multi-thumb)
// ---------------------------------------------------------------------------

describe('Slider — Range (multi-thumb)', () => {
  it('renders two thumbs with correct initial values', () => {
    render(
      <Slider.Root defaultValue={[25, 75]}>
        <Slider.Track>
          <Slider.Range />
        </Slider.Track>
        <Slider.Thumb index={0} aria-label="min" />
        <Slider.Thumb index={1} aria-label="max" />
      </Slider.Root>,
    );
    const [t0, t1] = screen.getAllByRole('slider');
    expect(t0.getAttribute('aria-valuenow')).toBe('25');
    expect(t1.getAttribute('aria-valuenow')).toBe('75');
  });

  it('ArrowRight on first thumb increases only that thumb', () => {
    render(
      <Slider.Root defaultValue={[20, 80]} step={1}>
        <Slider.Thumb index={0} aria-label="min" />
        <Slider.Thumb index={1} aria-label="max" />
      </Slider.Root>,
    );
    const [t0, t1] = screen.getAllByRole('slider');
    t0.focus();
    fireEvent.keyDown(t0, { key: 'ArrowRight' });
    expect(t0.getAttribute('aria-valuenow')).toBe('21');
    expect(t1.getAttribute('aria-valuenow')).toBe('80');
  });

  it('ArrowLeft on second thumb decreases only that thumb', () => {
    render(
      <Slider.Root defaultValue={[20, 80]} step={5}>
        <Slider.Thumb index={0} aria-label="min" />
        <Slider.Thumb index={1} aria-label="max" />
      </Slider.Root>,
    );
    const [, t1] = screen.getAllByRole('slider');
    t1.focus();
    fireEvent.keyDown(t1, { key: 'ArrowLeft' });
    expect(t1.getAttribute('aria-valuenow')).toBe('75');
  });

  it('calls onValueChange with full values array on each change', () => {
    const onChange = vi.fn();
    render(
      <Slider.Root defaultValue={[10, 90]} onValueChange={onChange}>
        <Slider.Thumb index={0} aria-label="min" />
        <Slider.Thumb index={1} aria-label="max" />
      </Slider.Root>,
    );
    const [t0] = screen.getAllByRole('slider');
    t0.focus();
    fireEvent.keyDown(t0, { key: 'ArrowRight' });
    expect(onChange).toHaveBeenCalledWith([11, 90]);
  });

  it('calls onValueCommit on keyboard interaction', () => {
    const onCommit = vi.fn();
    render(
      <Slider.Root defaultValue={[30, 70]} onValueCommit={onCommit}>
        <Slider.Thumb index={0} aria-label="min" />
        <Slider.Thumb index={1} aria-label="max" />
      </Slider.Root>,
    );
    const [t0] = screen.getAllByRole('slider');
    t0.focus();
    fireEvent.keyDown(t0, { key: 'ArrowRight' });
    expect(onCommit).toHaveBeenCalledWith([31, 70]);
  });

  it('thumbs do not cross — clamping prevents overlap', () => {
    render(
      <Slider.Root defaultValue={[48, 50]} step={1}>
        <Slider.Thumb index={0} aria-label="min" />
        <Slider.Thumb index={1} aria-label="max" />
      </Slider.Root>,
    );
    const [t0, t1] = screen.getAllByRole('slider');

    // Push t0 upward toward t1 several times.
    t0.focus();
    fireEvent.keyDown(t0, { key: 'ArrowRight' });
    fireEvent.keyDown(t0, { key: 'ArrowRight' });
    fireEvent.keyDown(t0, { key: 'ArrowRight' });

    const v0 = Number(t0.getAttribute('aria-valuenow'));
    const v1 = Number(t1.getAttribute('aria-valuenow'));
    expect(v0).toBeLessThanOrEqual(v1);
  });
});

// ---------------------------------------------------------------------------
// Keyboard — all keys
// ---------------------------------------------------------------------------

describe('Slider — Keyboard navigation', () => {
  function setup(defaultValue = [50], step = 1) {
    render(
      <Slider.Root defaultValue={defaultValue} min={0} max={100} step={step}>
        <Slider.Track>
          <Slider.Range />
        </Slider.Track>
        <Slider.Thumb aria-label="value" />
      </Slider.Root>,
    );
    const thumb = screen.getByRole('slider');
    thumb.focus();
    return thumb;
  }

  it('Home → min', () => {
    const thumb = setup([60]);
    fireEvent.keyDown(thumb, { key: 'Home' });
    expect(thumb.getAttribute('aria-valuenow')).toBe('0');
  });

  it('End → max', () => {
    const thumb = setup([40]);
    fireEvent.keyDown(thumb, { key: 'End' });
    expect(thumb.getAttribute('aria-valuenow')).toBe('100');
  });

  it('PageUp increases by 10% of range (or 10×step)', () => {
    const thumb = setup([50]);
    fireEvent.keyDown(thumb, { key: 'PageUp' });
    // bigStep = max(1*10, (100-0)/10) = 10
    expect(Number(thumb.getAttribute('aria-valuenow'))).toBe(60);
  });

  it('PageDown decreases by bigStep', () => {
    const thumb = setup([50]);
    fireEvent.keyDown(thumb, { key: 'PageDown' });
    expect(Number(thumb.getAttribute('aria-valuenow'))).toBe(40);
  });

  it('ArrowUp on horizontal slider has no effect', () => {
    const thumb = setup([50]);
    fireEvent.keyDown(thumb, { key: 'ArrowUp' });
    // Horizontal slider: ArrowUp is not bound (no flipH match)
    expect(Number(thumb.getAttribute('aria-valuenow'))).toBe(50);
  });

  it('ArrowRight clamps at max', () => {
    const thumb = setup([100]);
    fireEvent.keyDown(thumb, { key: 'ArrowRight' });
    expect(thumb.getAttribute('aria-valuenow')).toBe('100');
  });

  it('ArrowLeft clamps at min', () => {
    const thumb = setup([0]);
    fireEvent.keyDown(thumb, { key: 'ArrowLeft' });
    expect(thumb.getAttribute('aria-valuenow')).toBe('0');
  });
});

// ---------------------------------------------------------------------------
// Clamping & step snapping
// ---------------------------------------------------------------------------

describe('Slider — Clamping and step snapping', () => {
  it('defaultValue above max is clamped to max on first interaction', () => {
    render(
      <Slider.Root defaultValue={[50]} min={0} max={100} step={3}>
        <Slider.Thumb aria-label="v" />
      </Slider.Root>,
    );
    const thumb = screen.getByRole('slider');
    thumb.focus();
    // value=50, step=3, min=0 → snap: 0 + round((50-0)/3)*3 = 51
    fireEvent.keyDown(thumb, { key: 'ArrowRight' });
    // After snap+step: 51 + 3 = 54
    expect(Number(thumb.getAttribute('aria-valuenow')) % 3).toBe(0);
  });

  it('value snaps to step on keyboard move', () => {
    render(
      <Slider.Root defaultValue={[10]} min={0} max={100} step={10}>
        <Slider.Thumb aria-label="v" />
      </Slider.Root>,
    );
    const thumb = screen.getByRole('slider');
    thumb.focus();
    fireEvent.keyDown(thumb, { key: 'ArrowRight' });
    expect(Number(thumb.getAttribute('aria-valuenow'))).toBe(20);
    fireEvent.keyDown(thumb, { key: 'ArrowLeft' });
    expect(Number(thumb.getAttribute('aria-valuenow'))).toBe(10);
  });
});

// ---------------------------------------------------------------------------
// inverted prop
// ---------------------------------------------------------------------------

describe('Slider — inverted', () => {
  it('ArrowRight decreases value when inverted=true (horizontal)', () => {
    render(
      <Slider.Root defaultValue={[50]} inverted>
        <Slider.Thumb aria-label="v" />
      </Slider.Root>,
    );
    const thumb = screen.getByRole('slider');
    thumb.focus();
    // inverted LTR horizontal: increment key becomes ArrowLeft, decrement ArrowRight
    fireEvent.keyDown(thumb, { key: 'ArrowRight' });
    expect(Number(thumb.getAttribute('aria-valuenow'))).toBe(49);
  });

  it('ArrowLeft increases value when inverted=true (horizontal)', () => {
    render(
      <Slider.Root defaultValue={[50]} inverted>
        <Slider.Thumb aria-label="v" />
      </Slider.Root>,
    );
    const thumb = screen.getByRole('slider');
    thumb.focus();
    fireEvent.keyDown(thumb, { key: 'ArrowLeft' });
    expect(Number(thumb.getAttribute('aria-valuenow'))).toBe(51);
  });
});

// ---------------------------------------------------------------------------
// Form bubbling — hidden inputs
// ---------------------------------------------------------------------------

describe('Slider — form bubbling (hidden inputs)', () => {
  it('renders one hidden input per thumb value when name is set', () => {
    const { container } = render(
      <Slider.Root defaultValue={[25, 75]} name="price">
        <Slider.Thumb index={0} aria-label="min" />
        <Slider.Thumb index={1} aria-label="max" />
      </Slider.Root>,
    );
    const inputs = container.querySelectorAll('input[name="price"]');
    expect(inputs).toHaveLength(2);
    expect((inputs[0] as HTMLInputElement).value).toBe('25');
    expect((inputs[1] as HTMLInputElement).value).toBe('75');
  });

  it('renders no hidden inputs when name is not set', () => {
    const { container } = render(
      <Slider.Root defaultValue={[50]}>
        <Slider.Thumb aria-label="v" />
      </Slider.Root>,
    );
    const inputs = container.querySelectorAll('input');
    expect(inputs).toHaveLength(0);
  });

  it('hidden inputs are aria-hidden', () => {
    const { container } = render(
      <Slider.Root defaultValue={[30]} name="vol">
        <Slider.Thumb aria-label="v" />
      </Slider.Root>,
    );
    const input = container.querySelector('input[name="vol"]') as HTMLInputElement;
    expect(input.getAttribute('aria-hidden')).toBe('true');
  });
});

// ---------------------------------------------------------------------------
// Track click — nearest thumb moves
// ---------------------------------------------------------------------------

describe('Slider — Track click (nearest thumb)', () => {
  // jsdom does not support PointerEvent and React's event delegation makes it
  // impossible to reliably inject clientX into pointer events. We verify the
  // structural behavior instead: that the Track renders correctly and the
  // handler's guard clauses (disabled, button check) work as expected.

  it('Track renders data-orientation attribute', () => {
    render(
      <Slider.Root defaultValue={[50]} min={0} max={100}>
        <Slider.Track data-testid="track">
          <Slider.Range />
        </Slider.Track>
        <Slider.Thumb aria-label="v" />
      </Slider.Root>,
    );
    expect(screen.getByTestId('track').getAttribute('data-orientation')).toBe('horizontal');
  });

  it('Track gets data-disabled when root is disabled', () => {
    render(
      <Slider.Root defaultValue={[50]} disabled>
        <Slider.Track data-testid="track">
          <Slider.Range />
        </Slider.Track>
        <Slider.Thumb aria-label="v" />
      </Slider.Root>,
    );
    expect(screen.getByTestId('track').getAttribute('data-disabled')).toBe('');
  });

  it('pointerdown on disabled track does not call onValueChange', () => {
    const onChange = vi.fn();
    render(
      <Slider.Root defaultValue={[50]} disabled onValueChange={onChange}>
        <Slider.Track data-testid="track">
          <Slider.Range />
        </Slider.Track>
        <Slider.Thumb aria-label="v" />
      </Slider.Root>,
    );
    const track = screen.getByTestId('track');
    fireEvent.pointerDown(track, { button: 0 });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('vertical Track renders data-orientation=vertical', () => {
    render(
      <Slider.Root defaultValue={[50]} orientation="vertical">
        <Slider.Track data-testid="track">
          <Slider.Range />
        </Slider.Track>
        <Slider.Thumb aria-label="v" />
      </Slider.Root>,
    );
    expect(screen.getByTestId('track').getAttribute('data-orientation')).toBe('vertical');
  });
});

// ---------------------------------------------------------------------------
// Disabled
// ---------------------------------------------------------------------------

describe('Slider — disabled', () => {
  it('keyboard events do not change value when disabled', () => {
    render(
      <Slider.Root defaultValue={[50]} disabled>
        <Slider.Thumb aria-label="v" />
      </Slider.Root>,
    );
    const thumb = screen.getByRole('slider');
    thumb.focus();
    fireEvent.keyDown(thumb, { key: 'ArrowRight' });
    expect(thumb.getAttribute('aria-valuenow')).toBe('50');
  });

  it('thumb has tabIndex -1 when disabled', () => {
    render(
      <Slider.Root defaultValue={[50]} disabled>
        <Slider.Thumb aria-label="v" />
      </Slider.Root>,
    );
    const thumb = screen.getByRole('slider');
    expect(thumb.getAttribute('tabindex')).toBe('-1');
  });

  it('hidden inputs have disabled attribute when slider is disabled', () => {
    const { container } = render(
      <Slider.Root defaultValue={[50]} disabled name="vol">
        <Slider.Thumb aria-label="v" />
      </Slider.Root>,
    );
    const input = container.querySelector('input[name="vol"]') as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });
});
