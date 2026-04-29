import { useControllableState } from '@gugbab-ui/hooks';
import {
  type ButtonHTMLAttributes,
  createContext,
  forwardRef,
  type HTMLAttributes,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Slot } from '../../primitives/Slot/Slot';
import { BubbleInput } from '../../shared/BubbleInput';

interface SwitchContextValue {
  checked: boolean;
  disabled: boolean;
}
const Ctx = createContext<SwitchContextValue | null>(null);
const useCtx = (n: string) => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error(`${n} must be used inside <Switch.Root>`);
  return ctx;
};

export interface SwitchRootProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'defaultChecked'> {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  required?: boolean;
  name?: string;
  value?: string;
  asChild?: boolean;
  form?: string;
}

const Root = forwardRef<HTMLButtonElement, SwitchRootProps>(function SwitchRoot(
  {
    checked,
    defaultChecked,
    onCheckedChange,
    onClick,
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

  const [isChecked, setChecked] = useControllableState<boolean>({
    value: checked,
    defaultValue: defaultChecked ?? false,
    onChange: onCheckedChange,
  });

  // form reset → restore initial state
  const initialCheckedRef = useRef(isChecked);
  useEffect(() => {
    const formEl = button?.form;
    if (!formEl) return;
    const reset = () => setChecked(initialCheckedRef.current);
    formEl.addEventListener('reset', reset);
    return () => formEl.removeEventListener('reset', reset);
  }, [button, setChecked]);

  const Comp = asChild ? Slot : 'button';

  return (
    <Ctx.Provider value={{ checked: isChecked, disabled: !!disabled }}>
      <Comp
        ref={(node: HTMLButtonElement | null) => {
          setButton(node);
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        type={asChild ? undefined : type}
        role="switch"
        aria-checked={isChecked}
        aria-required={required}
        data-state={isChecked ? 'checked' : 'unchecked'}
        data-disabled={disabled ? '' : undefined}
        disabled={disabled}
        value={value}
        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
          onClick?.(e);
          if (e.defaultPrevented || disabled) return;
          setChecked(!isChecked);
          if (isFormControl) {
            hasConsumerStoppedPropagationRef.current = e.isPropagationStopped();
            // single click event reaches the form via the bubble input
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
          required={required}
          disabled={disabled}
          form={form}
        />
      ) : null}
    </Ctx.Provider>
  );
});

const Thumb = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(
  function SwitchThumb(props, ref) {
    const ctx = useCtx('Switch.Thumb');
    return (
      <span
        ref={ref}
        data-state={ctx.checked ? 'checked' : 'unchecked'}
        data-disabled={ctx.disabled ? '' : undefined}
        {...props}
      />
    );
  },
);

export const Switch = { Root, Thumb };
