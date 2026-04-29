import { useControllableState } from '@gugbab-ui/hooks';
import {
  createContext,
  forwardRef,
  type HTMLAttributes,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { useDirection } from '../../shared/DirectionProvider';

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface SliderContextValue {
  values: number[];
  setValue: (index: number, value: number) => void;
  /** Set value and immediately fire onValueCommit with the new value. */
  setValueAndCommit: (index: number, value: number) => void;
  commit: () => void;
  min: number;
  max: number;
  step: number;
  orientation: 'horizontal' | 'vertical';
  disabled: boolean;
  dir: 'ltr' | 'rtl';
  inverted: boolean;
  name?: string;
  trackRef: React.RefObject<HTMLElement | null>;
  activeThumbRef: React.RefObject<number | null>;
  thumbCount: number;
  registerThumb: () => number;
}

const Ctx = createContext<SliderContextValue | null>(null);
const useCtx = (n: string) => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error(`${n} must be used inside <Slider.Root>`);
  return ctx;
};

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function snapToStep(v: number, min: number, step: number) {
  return min + Math.round((v - min) / step) * step;
}

function clampAndSnap(v: number, min: number, max: number, step: number) {
  return clamp(snapToStep(v, min, step), min, max);
}

/**
 * Convert a pointer position to a slider value.
 * When `inverted` is true the visual direction is flipped:
 *   horizontal → right side = min  (instead of max)
 *   vertical   → top   side = min  (instead of max, which is the normal case)
 */
function valueFromPointer(
  trackRect: DOMRect,
  clientX: number,
  clientY: number,
  orientation: 'horizontal' | 'vertical',
  dir: 'ltr' | 'rtl',
  inverted: boolean,
  min: number,
  max: number,
): number {
  if (orientation === 'horizontal') {
    const ratio = (clientX - trackRect.left) / trackRect.width;
    const bounded = clamp(ratio, 0, 1);
    // RTL flips the visual axis; inverted also flips independently.
    const flip = (dir === 'rtl') !== inverted;
    const pct = flip ? 1 - bounded : bounded;
    return min + pct * (max - min);
  }
  // Vertical: bottom = min, top = max (default). inverted swaps.
  const ratio = (clientY - trackRect.top) / trackRect.height;
  const bounded = clamp(ratio, 0, 1);
  const pct = inverted ? bounded : 1 - bounded;
  return min + pct * (max - min);
}

/** Index of the thumb closest to `target` value. */
function nearestThumbIndex(values: number[], target: number): number {
  let nearest = 0;
  let minDist = Number.POSITIVE_INFINITY;
  for (let i = 0; i < values.length; i++) {
    const v = values[i];
    if (v === undefined) continue;
    const d = Math.abs(v - target);
    if (d < minDist) {
      minDist = d;
      nearest = i;
    }
  }
  return nearest;
}

/**
 * Apply a new value for thumb at `index` while keeping thumbs sorted and
 * preventing them from crossing each other.
 */
function applyValue(
  prev: number[],
  index: number,
  next: number,
  min: number,
  max: number,
  step: number,
): number[] {
  const result = [...prev];
  const clamped = clampAndSnap(next, min, max, step);
  result[index] = clamped;

  // Keep array sorted (thumbs must not cross).
  if (result.length > 1) {
    result.sort((a, b) => a - b);
  }
  return result;
}

// ---------------------------------------------------------------------------
// Hidden number input for form bubbling
// ---------------------------------------------------------------------------

interface SliderBubbleInputProps {
  name: string;
  value: number;
  disabled?: boolean;
}

function SliderBubbleInput({ name, value, disabled }: SliderBubbleInputProps) {
  const ref = useRef<HTMLInputElement | null>(null);
  const prevValue = useRef<number | undefined>(undefined);

  useEffect(() => {
    const input = ref.current;
    if (!input) return;
    const proto = window.HTMLInputElement.prototype;
    const descriptor = Object.getOwnPropertyDescriptor(proto, 'value');
    const nativeSetter = descriptor?.set;
    if (prevValue.current !== value && nativeSetter) {
      const event = new Event('input', { bubbles: true });
      nativeSetter.call(input, String(value));
      input.dispatchEvent(event);
    }
    prevValue.current = value;
  }, [value]);

  return (
    <input
      ref={ref}
      aria-hidden
      name={name}
      type="number"
      defaultValue={value}
      tabIndex={-1}
      disabled={disabled}
      style={{
        position: 'absolute',
        pointerEvents: 'none',
        opacity: 0,
        margin: 0,
        width: 0,
        height: 0,
        overflow: 'hidden',
      }}
    />
  );
}

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

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
  /** Visually invert the slider direction. */
  inverted?: boolean;
  /** HTML form field name — renders hidden inputs for each thumb value. */
  name?: string;
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
    inverted = false,
    name,
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

  // Auto-assign index for each Thumb registered under this Root.
  const thumbCounterRef = useRef(0);
  const [thumbCount, setThumbCount] = useState(0);

  const registerThumb = useCallback(() => {
    const idx = thumbCounterRef.current++;
    setThumbCount(thumbCounterRef.current);
    return idx;
  }, []);

  const setValue = useCallback(
    (index: number, next: number) => {
      setValues((prev) => applyValue(prev, index, next, min, max, step));
    },
    [min, max, step, setValues],
  );

  const setValueAndCommit = useCallback(
    (index: number, next: number) => {
      // Compute the final value synchronously so we can pass the correct
      // array to onValueCommit immediately — without waiting for React's
      // async state flush.
      const newValues = applyValue(valuesRef.current, index, next, min, max, step);
      setValues(newValues);
      onValueCommit?.(newValues);
    },
    [min, max, step, setValues, onValueCommit],
  );

  const commit = useCallback(() => {
    onValueCommit?.(valuesRef.current);
  }, [onValueCommit]);

  return (
    <Ctx.Provider
      value={{
        values,
        setValue,
        setValueAndCommit,
        commit,
        min,
        max,
        step,
        orientation,
        disabled,
        dir,
        inverted,
        name,
        trackRef,
        activeThumbRef,
        thumbCount,
        registerThumb,
      }}
    >
      <div
        ref={ref}
        data-orientation={orientation}
        data-disabled={disabled ? '' : undefined}
        dir={dir}
        onPointerUp={() => {
          if (activeThumbRef.current !== null) {
            commit();
            activeThumbRef.current = null;
          }
        }}
        {...rest}
      >
        {rest.children}
        {/* Hidden inputs for form submission */}
        {name != null &&
          values.map((v, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: value order mirrors the stable values array; no reorder occurs
            <SliderBubbleInput key={i} name={name} value={v} disabled={disabled} />
          ))}
      </div>
    </Ctx.Provider>
  );
});

// ---------------------------------------------------------------------------
// Track
// ---------------------------------------------------------------------------

const Track = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(function SliderTrack(
  { onPointerDown, onPointerMove, ...props },
  ref,
) {
  const ctx = useCtx('Slider.Track');

  const handlePointerDown = (event: ReactPointerEvent<HTMLSpanElement>) => {
    onPointerDown?.(event);
    if (event.defaultPrevented || ctx.disabled) return;
    if (event.button !== 0 && event.pointerType === 'mouse') return;
    event.preventDefault();

    const track = event.currentTarget;
    if (track.setPointerCapture) track.setPointerCapture(event.pointerId);

    const rect = track.getBoundingClientRect();
    const nextValue = valueFromPointer(
      rect,
      event.clientX,
      event.clientY,
      ctx.orientation,
      ctx.dir,
      ctx.inverted,
      ctx.min,
      ctx.max,
    );
    const nearest = nearestThumbIndex(ctx.values, nextValue);
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
      ctx.inverted,
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

// ---------------------------------------------------------------------------
// Range
// ---------------------------------------------------------------------------

const Range = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(
  function SliderRange(props, ref) {
    const ctx = useCtx('Slider.Range');

    // Compute the CSS inline-start/end percentages so consumers can use
    // data-attributes for automatic range fill styling.
    const [low, high] =
      ctx.values.length >= 2
        ? [ctx.values[0] ?? ctx.min, ctx.values[ctx.values.length - 1] ?? ctx.max]
        : [ctx.min, ctx.values[0] ?? ctx.min];

    const span = ctx.max - ctx.min;
    const lowPct = span === 0 ? 0 : ((low - ctx.min) / span) * 100;
    const highPct = span === 0 ? 100 : ((high - ctx.min) / span) * 100;

    return (
      <span
        ref={ref}
        data-orientation={ctx.orientation}
        data-disabled={ctx.disabled ? '' : undefined}
        data-low={lowPct.toFixed(2)}
        data-high={highPct.toFixed(2)}
        {...props}
      />
    );
  },
);

// ---------------------------------------------------------------------------
// Thumb
// ---------------------------------------------------------------------------

export interface SliderThumbProps extends HTMLAttributes<HTMLSpanElement> {
  /**
   * Index of the value this thumb controls (0 = first).
   * When omitted, index is assigned automatically in render order.
   */
  index?: number;
  'aria-label'?: string;
  'aria-labelledby'?: string;
}

const Thumb = forwardRef<HTMLSpanElement, SliderThumbProps>(function SliderThumb(
  { index: explicitIndex, onKeyDown, onPointerDown, tabIndex, ...rest },
  ref,
) {
  const ctx = useCtx('Slider.Thumb');

  // Auto-register to get a stable index when `index` prop is not provided.
  const autoIndexRef = useRef<number | null>(null);
  // biome-ignore lint/correctness/useExhaustiveDependencies: register-once-on-mount pattern; re-registering on every dep change would corrupt the thumb index
  useLayoutEffect(() => {
    if (explicitIndex === undefined && autoIndexRef.current === null) {
      autoIndexRef.current = ctx.registerThumb();
    }
  }, []);

  const index = explicitIndex ?? autoIndexRef.current ?? 0;
  const value = ctx.values[index] ?? ctx.min;

  const handlePointerDown = (e: ReactPointerEvent<HTMLSpanElement>) => {
    onPointerDown?.(e);
    if (e.defaultPrevented || ctx.disabled) return;
    ctx.activeThumbRef.current = index;
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLSpanElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented || ctx.disabled) return;
    const horizontal = ctx.orientation === 'horizontal';
    const bigStep = Math.max(ctx.step * 10, (ctx.max - ctx.min) / 10);
    const rtl = ctx.dir === 'rtl';
    const inverted = ctx.inverted;
    // Effective flip: RTL XOR inverted for horizontal.
    const flipH = rtl !== inverted;
    const incrementKey = horizontal
      ? flipH
        ? 'ArrowLeft'
        : 'ArrowRight'
      : inverted
        ? 'ArrowDown'
        : 'ArrowUp';
    const decrementKey = horizontal
      ? flipH
        ? 'ArrowRight'
        : 'ArrowLeft'
      : inverted
        ? 'ArrowUp'
        : 'ArrowDown';

    const svc = ctx.setValueAndCommit;
    switch (e.key) {
      case incrementKey:
        e.preventDefault();
        svc(index, value + ctx.step);
        break;
      case decrementKey:
        e.preventDefault();
        svc(index, value - ctx.step);
        break;
      case 'ArrowUp':
        if (!horizontal) {
          e.preventDefault();
          svc(index, inverted ? value - ctx.step : value + ctx.step);
        }
        break;
      case 'ArrowDown':
        if (!horizontal) {
          e.preventDefault();
          svc(index, inverted ? value + ctx.step : value - ctx.step);
        }
        break;
      case 'Home':
        e.preventDefault();
        svc(index, ctx.min);
        break;
      case 'End':
        e.preventDefault();
        svc(index, ctx.max);
        break;
      case 'PageUp':
        e.preventDefault();
        svc(index, value + bigStep);
        break;
      case 'PageDown':
        e.preventDefault();
        svc(index, value - bigStep);
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
      data-index={index}
      onPointerDown={handlePointerDown}
      onKeyDown={handleKeyDown}
      {...rest}
    />
  );
});

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------

export const Slider = { Root, Track, Range, Thumb };
