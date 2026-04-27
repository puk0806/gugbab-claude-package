import { useControllableState } from '@gugbab-ui/hooks';
import {
  createContext,
  forwardRef,
  type HTMLAttributes,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useContext,
  useRef,
} from 'react';
import { useDirection } from '../../shared/DirectionProvider';

interface SliderContextValue {
  values: number[];
  setValue: (index: number, value: number) => void;
  min: number;
  max: number;
  step: number;
  orientation: 'horizontal' | 'vertical';
  disabled: boolean;
  dir: 'ltr' | 'rtl';
  trackRef: React.RefObject<HTMLElement | null>;
  activeThumbRef: React.RefObject<number | null>;
}

const Ctx = createContext<SliderContextValue | null>(null);
const useCtx = (n: string) => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error(`${n} must be used inside <Slider.Root>`);
  return ctx;
};

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function snapToStep(v: number, min: number, step: number) {
  return min + Math.round((v - min) / step) * step;
}

function valueFromPointer(
  trackRect: DOMRect,
  clientX: number,
  clientY: number,
  orientation: 'horizontal' | 'vertical',
  dir: 'ltr' | 'rtl',
  min: number,
  max: number,
): number {
  if (orientation === 'horizontal') {
    const ratio = (clientX - trackRect.left) / trackRect.width;
    const bounded = clamp(ratio, 0, 1);
    const pct = dir === 'rtl' ? 1 - bounded : bounded;
    return min + pct * (max - min);
  }
  const ratio = 1 - (clientY - trackRect.top) / trackRect.height;
  const bounded = clamp(ratio, 0, 1);
  return min + bounded * (max - min);
}

export interface SliderRootProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange'> {
  value?: number[];
  defaultValue?: number[];
  onValueChange?: (value: number[]) => void;
  onValueCommit?: (value: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  orientation?: 'horizontal' | 'vertical';
  disabled?: boolean;
  dir?: 'ltr' | 'rtl';
}

const Root = forwardRef<HTMLDivElement, SliderRootProps>(function SliderRoot(
  {
    value,
    defaultValue,
    onValueChange,
    onValueCommit,
    min = 0,
    max = 100,
    step = 1,
    orientation = 'horizontal',
    disabled = false,
    dir: localDir,
    ...rest
  },
  ref,
) {
  const dir = useDirection(localDir);
  const [values, setValues] = useControllableState<number[]>({
    value,
    defaultValue: defaultValue ?? [min],
    onChange: onValueChange,
  });
  const trackRef = useRef<HTMLElement | null>(null);
  const activeThumbRef = useRef<number | null>(null);
  const valuesRef = useRef<number[]>(values);
  valuesRef.current = values;

  const setValue = useCallback(
    (index: number, next: number) => {
      setValues((prev) => {
        const clamped = clamp(snapToStep(next, min, step), min, max);
        const result = [...prev];
        result[index] = clamped;
        if (result.length === 2 && result[0] !== undefined && result[1] !== undefined) {
          if (result[0] > result[1]) result.sort((a, b) => a - b);
        }
        return result;
      });
    },
    [min, max, step, setValues],
  );

  return (
    <Ctx.Provider
      value={{
        values,
        setValue,
        min,
        max,
        step,
        orientation,
        disabled,
        dir,
        trackRef,
        activeThumbRef,
      }}
    >
      <div
        ref={ref}
        data-orientation={orientation}
        data-disabled={disabled ? '' : undefined}
        dir={dir}
        onPointerUp={() => {
          if (activeThumbRef.current !== null) {
            onValueCommit?.(valuesRef.current);
            activeThumbRef.current = null;
          }
        }}
        {...rest}
      />
    </Ctx.Provider>
  );
});

const Track = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(function SliderTrack(
  { onPointerDown, onPointerMove, ...props },
  ref,
) {
  const ctx = useCtx('Slider.Track');

  const pickNearestThumb = (value: number) => {
    let nearest = 0;
    let minDist = Number.POSITIVE_INFINITY;
    for (let i = 0; i < ctx.values.length; i++) {
      const v = ctx.values[i];
      if (v === undefined) continue;
      const d = Math.abs(v - value);
      if (d < minDist) {
        minDist = d;
        nearest = i;
      }
    }
    return nearest;
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLSpanElement>) => {
    onPointerDown?.(event);
    if (event.defaultPrevented || ctx.disabled) return;
    if (event.button !== 0 && event.pointerType === 'mouse') return;
    event.preventDefault();

    const track = event.currentTarget;
    track.setPointerCapture(event.pointerId);

    const rect = track.getBoundingClientRect();
    const nextValue = valueFromPointer(
      rect,
      event.clientX,
      event.clientY,
      ctx.orientation,
      ctx.dir,
      ctx.min,
      ctx.max,
    );
    const nearest = pickNearestThumb(nextValue);
    ctx.activeThumbRef.current = nearest;
    ctx.setValue(nearest, nextValue);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLSpanElement>) => {
    onPointerMove?.(event);
    if (event.defaultPrevented) return;
    if (ctx.activeThumbRef.current === null || ctx.disabled) return;
    event.preventDefault();
    const rect = event.currentTarget.getBoundingClientRect();
    const nextValue = valueFromPointer(
      rect,
      event.clientX,
      event.clientY,
      ctx.orientation,
      ctx.dir,
      ctx.min,
      ctx.max,
    );
    ctx.setValue(ctx.activeThumbRef.current, nextValue);
  };

  return (
    <span
      ref={(node) => {
        ctx.trackRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      }}
      data-orientation={ctx.orientation}
      data-disabled={ctx.disabled ? '' : undefined}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      {...props}
    />
  );
});

const Range = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(
  function SliderRange(props, ref) {
    const ctx = useCtx('Slider.Range');
    return (
      <span
        ref={ref}
        data-orientation={ctx.orientation}
        data-disabled={ctx.disabled ? '' : undefined}
        {...props}
      />
    );
  },
);

export interface SliderThumbProps extends HTMLAttributes<HTMLSpanElement> {
  /** Index of the value this thumb controls (0 = first). Default 0. */
  index?: number;
  'aria-label'?: string;
  'aria-labelledby'?: string;
}

const Thumb = forwardRef<HTMLSpanElement, SliderThumbProps>(function SliderThumb(
  { index = 0, onKeyDown, tabIndex, ...rest },
  ref,
) {
  const ctx = useCtx('Slider.Thumb');
  const value = ctx.values[index] ?? ctx.min;

  const handleKeyDown = (e: KeyboardEvent<HTMLSpanElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented || ctx.disabled) return;
    const horizontal = ctx.orientation === 'horizontal';
    const bigStep = Math.max(ctx.step * 10, (ctx.max - ctx.min) / 10);
    const rtl = ctx.dir === 'rtl';
    const incrementKey = horizontal ? (rtl ? 'ArrowLeft' : 'ArrowRight') : 'ArrowUp';
    const decrementKey = horizontal ? (rtl ? 'ArrowRight' : 'ArrowLeft') : 'ArrowDown';

    switch (e.key) {
      case incrementKey:
        e.preventDefault();
        ctx.setValue(index, value + ctx.step);
        break;
      case decrementKey:
        e.preventDefault();
        ctx.setValue(index, value - ctx.step);
        break;
      case 'Home':
        e.preventDefault();
        ctx.setValue(index, ctx.min);
        break;
      case 'End':
        e.preventDefault();
        ctx.setValue(index, ctx.max);
        break;
      case 'PageUp':
        e.preventDefault();
        ctx.setValue(index, value + bigStep);
        break;
      case 'PageDown':
        e.preventDefault();
        ctx.setValue(index, value - bigStep);
        break;
    }
  };

  return (
    <span
      ref={ref}
      role="slider"
      aria-valuemin={ctx.min}
      aria-valuemax={ctx.max}
      aria-valuenow={value}
      aria-orientation={ctx.orientation}
      aria-disabled={ctx.disabled || undefined}
      tabIndex={ctx.disabled ? -1 : (tabIndex ?? 0)}
      data-orientation={ctx.orientation}
      data-disabled={ctx.disabled ? '' : undefined}
      data-value={value}
      onKeyDown={handleKeyDown}
      {...rest}
    />
  );
});

export const Slider = { Root, Track, Range, Thumb };
