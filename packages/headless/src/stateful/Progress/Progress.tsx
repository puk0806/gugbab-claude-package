import { createContext, forwardRef, type HTMLAttributes, useContext, useMemo } from 'react';

const DEFAULT_MAX = 100;

type ProgressState = 'indeterminate' | 'complete' | 'loading';

interface ProgressContextValue {
  value: number | null;
  max: number;
}
const Ctx = createContext<ProgressContextValue | null>(null);
const useCtx = (n: string) => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error(`${n} must be used inside <Progress.Root>`);
  return ctx;
};

export interface ProgressRootProps extends HTMLAttributes<HTMLDivElement> {
  /** Current value. Set to `null` for indeterminate. */
  value?: number | null;
  /** Max value. Default 100. */
  max?: number;
  getValueLabel?: (value: number, max: number) => string;
}

function defaultGetValueLabel(value: number, max: number) {
  return `${Math.round((value / max) * 100)}%`;
}

function isNumber(value: unknown): value is number {
  return typeof value === 'number';
}
function isValidMaxNumber(max: unknown): max is number {
  return isNumber(max) && !Number.isNaN(max) && max > 0;
}
function isValidValueNumber(value: unknown, max: number): value is number {
  return isNumber(value) && !Number.isNaN(value) && value <= max && value >= 0;
}
function getProgressState(value: number | null | undefined, max: number): ProgressState {
  return value == null ? 'indeterminate' : value === max ? 'complete' : 'loading';
}

const Root = forwardRef<HTMLDivElement, ProgressRootProps>(function ProgressRoot(
  { value: valueProp = null, max: maxProp, getValueLabel = defaultGetValueLabel, ...rest },
  ref,
) {
  if (
    (maxProp || maxProp === 0) &&
    !isValidMaxNumber(maxProp) &&
    process.env.NODE_ENV !== 'production'
  ) {
    console.error(
      `Invalid prop \`max\` of value \`${maxProp}\` supplied to \`Progress\`. Only numbers greater than 0 are valid max values. Defaulting to \`${DEFAULT_MAX}\`.`,
    );
  }
  const max = isValidMaxNumber(maxProp) ? maxProp : DEFAULT_MAX;

  if (
    valueProp !== null &&
    !isValidValueNumber(valueProp, max) &&
    process.env.NODE_ENV !== 'production'
  ) {
    console.error(
      `Invalid prop \`value\` of value \`${valueProp}\` supplied to \`Progress\`. The \`value\` prop must be a number between 0 and \`max\` (or null for indeterminate). Defaulting to \`null\`.`,
    );
  }
  const value = isValidValueNumber(valueProp, max) ? valueProp : null;
  const valueLabel = isNumber(value) ? getValueLabel(value, max) : undefined;
  const state = getProgressState(value, max);

  const ctxValue = useMemo(() => ({ value, max }), [value, max]);
  return (
    <Ctx.Provider value={ctxValue}>
      <div
        ref={ref}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={isNumber(value) ? value : undefined}
        aria-valuetext={valueLabel}
        data-state={state}
        data-value={value ?? undefined}
        data-max={max}
        {...rest}
      />
    </Ctx.Provider>
  );
});

const Indicator = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function ProgressIndicator(props, ref) {
    const ctx = useCtx('Progress.Indicator');
    const state = getProgressState(ctx.value, ctx.max);
    return (
      <div
        ref={ref}
        data-state={state}
        data-value={ctx.value ?? undefined}
        data-max={ctx.max}
        {...props}
      />
    );
  },
);

export const Progress = { Root, Indicator };
