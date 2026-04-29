import { useControllableState } from '@gugbab-ui/hooks';
import {
  type ButtonHTMLAttributes,
  createContext,
  forwardRef,
  type HTMLAttributes,
  type KeyboardEvent,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Slot } from '../../primitives/Slot/Slot';
import { BubbleInput } from '../../shared/BubbleInput';

export type CheckedState = boolean | 'indeterminate';

interface CheckboxContextValue {
  state: CheckedState;
  disabled: boolean;
}
const Ctx = createContext<CheckboxContextValue | null>(null);
const useCtx = (n: string) => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error(`${n} must be used inside <Checkbox.Root>`);
  return ctx;
};

export interface CheckboxRootProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'defaultChecked' | 'value'> {
  checked?: CheckedState;
  defaultChecked?: CheckedState;
  onCheckedChange?: (state: CheckedState) => void;
  required?: boolean;
  name?: string;
  value?: string;
  asChild?: boolean;
  form?: string;
}

const Root = forwardRef<HTMLButtonElement, CheckboxRootProps>(function CheckboxRoot(
  {
    checked,
    defaultChecked,
    onCheckedChange,
    onClick,
    onKeyDown,
    type = 'button',
    disabled,
    required,
    name,
    value = 'on',
    asChild,
    form,
    ...rest
  },
  ref,
) {
  const [button, setButton] = useState<HTMLButtonElement | null>(null);
  const hasConsumerStoppedPropagationRef = useRef(false);
  const isFormControl = button ? Boolean(form) || !!button.closest('form') : true;

  const [state, setState] = useControllableState<CheckedState>({
    value: checked,
    defaultValue: defaultChecked ?? false,
    onChange: onCheckedChange,
  });
  const isChecked = state === true;
  const isIndeterminate = state === 'indeterminate';
  const ariaChecked = isIndeterminate ? 'mixed' : isChecked;

  // form reset → restore initial state
  const initialStateRef = useRef<CheckedState>(state);
  useEffect(() => {
    const formEl = button?.form;
    if (!formEl) return;
    const reset = () => setState(initialStateRef.current);
    formEl.addEventListener('reset', reset);
    return () => formEl.removeEventListener('reset', reset);
  }, [button, setState]);

  const Comp = asChild ? Slot : 'button';

  return (
    <Ctx.Provider value={{ state, disabled: !!disabled }}>
      <Comp
        ref={(node: HTMLButtonElement | null) => {
          setButton(node);
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        type={asChild ? undefined : type}
        role="checkbox"
        aria-checked={ariaChecked}
        aria-required={required}
        data-state={isIndeterminate ? 'indeterminate' : isChecked ? 'checked' : 'unchecked'}
        data-disabled={disabled ? '' : undefined}
        disabled={disabled}
        value={value}
        onKeyDown={(e: KeyboardEvent<HTMLButtonElement>) => {
          onKeyDown?.(e);
          // WAI-ARIA: checkboxes do not toggle on Enter
          if (e.key === 'Enter') e.preventDefault();
        }}
        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
          onClick?.(e);
          if (e.defaultPrevented || disabled) return;
          setState((prev) => (prev === 'indeterminate' ? true : !prev));
          if (isFormControl) {
            hasConsumerStoppedPropagationRef.current = e.isPropagationStopped();
            if (!hasConsumerStoppedPropagationRef.current) e.stopPropagation();
          }
        }}
        {...rest}
      />
      {isFormControl ? (
        <BubbleInput
          control={button}
          bubbles={!hasConsumerStoppedPropagationRef.current}
          name={name}
          value={value}
          checked={isChecked}
          indeterminate={isIndeterminate}
          required={required}
          disabled={disabled}
          form={form}
        />
      ) : null}
    </Ctx.Provider>
  );
});

const Indicator = forwardRef<
  HTMLSpanElement,
  HTMLAttributes<HTMLSpanElement> & { forceMount?: boolean }
>(function CheckboxIndicator({ forceMount, style, ...rest }, ref) {
  const ctx = useCtx('Checkbox.Indicator');
  const show = ctx.state !== false;
  if (!show && !forceMount) return null;
  return (
    <span
      ref={ref}
      data-state={
        ctx.state === 'indeterminate'
          ? 'indeterminate'
          : ctx.state === true
            ? 'checked'
            : 'unchecked'
      }
      data-disabled={ctx.disabled ? '' : undefined}
      style={{ pointerEvents: 'none', ...style }}
      {...rest}
    />
  );
});

export const Checkbox = { Root, Indicator };
