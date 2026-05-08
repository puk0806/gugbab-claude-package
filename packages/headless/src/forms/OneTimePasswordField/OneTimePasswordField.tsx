import { useControllableState } from '@gugbab/hooks';
import {
  type ChangeEvent,
  type ClipboardEvent,
  createContext,
  forwardRef,
  type InputHTMLAttributes,
  type KeyboardEvent,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from 'react';
import { Slot } from '../../primitives/Slot/Slot';
import { type Direction, useDirection } from '../../shared/DirectionProvider';

/**
 * Headless OneTimePasswordField (OTP code input) — equivalent to Radix.
 *
 * Composition:
 *   <OneTimePasswordField.Root maxLength={6}>
 *     <OneTimePasswordField.Input />
 *     <OneTimePasswordField.Input />
 *     ... (one Input per digit)
 *     <OneTimePasswordField.HiddenInput name="otp" />
 *   </OneTimePasswordField.Root>
 *
 * Behaviors:
 *   - typing in an Input advances focus to the next Input
 *   - Backspace on an empty Input moves to and clears the previous Input
 *   - paste in any Input distributes across all Inputs
 *   - ArrowLeft/Right move between Inputs (RTL-aware)
 *   - HiddenInput stays in sync for native form submission
 */

interface OTPContextValue {
  value: string;
  setValue: (next: string) => void;
  maxLength: number;
  inputs: React.RefObject<HTMLInputElement | null>[];
  registerInput: (ref: React.RefObject<HTMLInputElement | null>) => () => void;
  /** Called by an Input to compute its index by registration order. */
  getIndex: (ref: React.RefObject<HTMLInputElement | null>) => number;
  disabled: boolean;
  isLtr: boolean;
  inputType: 'numeric' | 'alphanumeric';
}

const OTPContext = createContext<OTPContextValue | null>(null);
function useCtx(consumer: string) {
  const ctx = useContext(OTPContext);
  if (!ctx) throw new Error(`${consumer} must be used inside <OneTimePasswordField.Root>`);
  return ctx;
}

const ALLOWED_NUMERIC = /^\d*$/;
const ALLOWED_ALPHANUMERIC = /^[A-Za-z0-9]*$/;

export interface OTPFieldRootProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'defaultValue'> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Total number of digits expected. */
  maxLength?: number;
  /** Restrict accepted characters. Default `numeric`. */
  type?: 'numeric' | 'alphanumeric';
  disabled?: boolean;
  dir?: Direction;
  asChild?: boolean;
}

const Root = forwardRef<HTMLDivElement, OTPFieldRootProps>(function OTPFieldRoot(
  {
    value,
    defaultValue,
    onValueChange,
    maxLength = 6,
    type: inputType = 'numeric',
    disabled = false,
    dir,
    asChild,
    ...rest
  },
  ref,
) {
  const direction = useDirection(dir);
  const [current, setCurrent] = useControllableState<string>({
    value,
    defaultValue: defaultValue ?? '',
    onChange: onValueChange,
  });

  // input refs registered in mount order; index is implicitly DOM order
  const inputsRef = useRef<React.RefObject<HTMLInputElement | null>[]>([]);

  const registerInput = useCallback((r: React.RefObject<HTMLInputElement | null>) => {
    inputsRef.current.push(r);
    return () => {
      inputsRef.current = inputsRef.current.filter((x) => x !== r);
    };
  }, []);
  const getIndex = useCallback(
    (r: React.RefObject<HTMLInputElement | null>) => inputsRef.current.indexOf(r),
    [],
  );

  const setValueClamped = useCallback(
    (next: string) => {
      const allowed = inputType === 'numeric' ? ALLOWED_NUMERIC : ALLOWED_ALPHANUMERIC;
      if (!allowed.test(next)) return;
      setCurrent(next.slice(0, maxLength));
    },
    [setCurrent, maxLength, inputType],
  );

  const Comp = asChild ? Slot : 'div';
  return (
    <OTPContext.Provider
      value={{
        value: current,
        setValue: setValueClamped,
        maxLength,
        inputs: inputsRef.current,
        registerInput,
        getIndex,
        disabled,
        isLtr: direction === 'ltr',
        inputType,
      }}
    >
      <Comp ref={ref} dir={direction} data-disabled={disabled ? '' : undefined} {...rest} />
    </OTPContext.Provider>
  );
});

export interface OTPFieldInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'maxLength'> {
  asChild?: boolean;
}

const Input = forwardRef<HTMLInputElement, OTPFieldInputProps>(function OTPFieldInput(
  { asChild, onChange, onKeyDown, onPaste, onFocus, ...rest },
  forwardedRef,
) {
  const ctx = useCtx('OneTimePasswordField.Input');
  const internalRef = useRef<HTMLInputElement | null>(null);

  // register on mount; cleanup on unmount
  useEffect(() => {
    return ctx.registerInput(internalRef);
  }, [ctx]);

  const setRef = (node: HTMLInputElement | null) => {
    internalRef.current = node;
    if (typeof forwardedRef === 'function') forwardedRef(node);
    else if (forwardedRef) forwardedRef.current = node;
  };

  const focusInput = (idx: number) => {
    const inputs = ctx.inputs;
    const target = inputs[idx]?.current;
    if (target) {
      target.focus();
      target.select?.();
    }
  };

  const myIndex = ctx.getIndex(internalRef);
  const charAtMyIndex = ctx.value[myIndex] ?? '';

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange?.(e);
    if (e.defaultPrevented) return;
    const incoming = e.target.value;
    const allowed = ctx.inputType === 'numeric' ? ALLOWED_NUMERIC : ALLOWED_ALPHANUMERIC;
    if (!allowed.test(incoming)) {
      e.target.value = charAtMyIndex;
      return;
    }
    // we treat each input as a single character slot; take last char
    const ch = incoming.slice(-1);
    const idx = ctx.getIndex(internalRef);
    const next = (ctx.value.slice(0, idx) + ch + ctx.value.slice(idx + 1)).slice(0, ctx.maxLength);
    ctx.setValue(next);
    if (ch && idx < ctx.inputs.length - 1) focusInput(idx + 1);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented) return;
    const idx = ctx.getIndex(internalRef);
    const isEmpty = (ctx.value[idx] ?? '') === '';

    if (e.key === 'Backspace') {
      if (isEmpty && idx > 0) {
        e.preventDefault();
        // clear previous and focus it
        const next = ctx.value.slice(0, idx - 1) + ctx.value.slice(idx);
        ctx.setValue(next);
        focusInput(idx - 1);
      } else if (!isEmpty) {
        e.preventDefault();
        const next = ctx.value.slice(0, idx) + ctx.value.slice(idx + 1);
        ctx.setValue(next);
      }
      return;
    }

    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const target = ctx.isLtr ? idx - 1 : idx + 1;
      if (target >= 0 && target < ctx.inputs.length) focusInput(target);
      return;
    }
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const target = ctx.isLtr ? idx + 1 : idx - 1;
      if (target >= 0 && target < ctx.inputs.length) focusInput(target);
      return;
    }
    if (e.key === 'Home') {
      e.preventDefault();
      focusInput(0);
      return;
    }
    if (e.key === 'End') {
      e.preventDefault();
      focusInput(ctx.inputs.length - 1);
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    onPaste?.(e);
    if (e.defaultPrevented) return;
    e.preventDefault();
    const pasted = e.clipboardData.getData('text');
    const allowed = ctx.inputType === 'numeric' ? ALLOWED_NUMERIC : ALLOWED_ALPHANUMERIC;
    if (!allowed.test(pasted)) return;
    const idx = ctx.getIndex(internalRef);
    const head = ctx.value.slice(0, idx);
    const next = (head + pasted).slice(0, ctx.maxLength);
    ctx.setValue(next);
    const focusIdx = Math.min(next.length, ctx.inputs.length - 1);
    focusInput(focusIdx);
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    onFocus?.(e);
    e.target.select?.();
  };

  const Comp = asChild ? Slot : 'input';

  return (
    <Comp
      ref={setRef}
      type="text"
      inputMode={ctx.inputType === 'numeric' ? 'numeric' : 'text'}
      autoComplete="one-time-code"
      maxLength={1}
      value={charAtMyIndex}
      disabled={ctx.disabled}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      onFocus={handleFocus}
      {...rest}
    />
  );
});

export interface OTPFieldHiddenInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'value'> {}

const HiddenInput = forwardRef<HTMLInputElement, OTPFieldHiddenInputProps>(
  function OTPFieldHiddenInput(props, ref) {
    const ctx = useCtx('OneTimePasswordField.HiddenInput');
    return <input ref={ref} type="hidden" value={ctx.value} disabled={ctx.disabled} {...props} />;
  },
);

export const OneTimePasswordField = { Root, Input, HiddenInput };
