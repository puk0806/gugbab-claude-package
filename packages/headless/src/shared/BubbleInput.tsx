import {
  forwardRef,
  type InputHTMLAttributes,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

/**
 * Hidden form-bubbling input — sits absolutely positioned over a button
 * control and forwards programmatic state changes through native DOM
 * events so that surrounding `<form>` elements observe the change.
 *
 * Used by Switch and Checkbox primitives to participate in native form
 * submission and validation.
 */
export interface BubbleInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'checked' | 'type'> {
  control: HTMLElement | null;
  bubbles: boolean;
  checked: boolean;
  /** When true, the underlying input has its `indeterminate` IDL property set. */
  indeterminate?: boolean;
  /** Form-input type. Switch and Checkbox use `"checkbox"`, RadioGroup uses `"radio"`. */
  type?: 'checkbox' | 'radio';
}

export const BubbleInput = forwardRef<HTMLInputElement, BubbleInputProps>(function BubbleInput(
  { control, checked, indeterminate, bubbles = true, type = 'checkbox', style, ...rest },
  forwardedRef,
) {
  const ref = useRef<HTMLInputElement | null>(null);
  const prevChecked = usePrevious(checked);
  const controlSize = useSize(control);

  useEffect(() => {
    const input = ref.current;
    if (!input) return;
    const proto = window.HTMLInputElement.prototype;
    const descriptor = Object.getOwnPropertyDescriptor(proto, 'checked');
    const setChecked = descriptor?.set;
    if (prevChecked !== checked && setChecked) {
      const event = new Event('click', { bubbles });
      input.indeterminate = !!indeterminate;
      setChecked.call(input, indeterminate ? false : checked);
      input.dispatchEvent(event);
    }
  }, [prevChecked, checked, indeterminate, bubbles]);

  return (
    <input
      type={type}
      aria-hidden
      defaultChecked={checked}
      tabIndex={-1}
      {...rest}
      ref={(node) => {
        ref.current = node;
        if (typeof forwardedRef === 'function') forwardedRef(node);
        else if (forwardedRef) forwardedRef.current = node;
      }}
      style={{
        ...style,
        ...controlSize,
        position: 'absolute',
        pointerEvents: 'none',
        opacity: 0,
        margin: 0,
        transform: 'translateX(-100%)',
      }}
    />
  );
});

function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<{ value: T; previous: T | undefined }>({ value, previous: undefined });
  // useMemo-ish: if value changed, shift current to previous.
  // We compare to handle controlled and uncontrolled flows.
  const stored = ref.current;
  if (stored.value !== value) {
    stored.previous = stored.value;
    stored.value = value;
  }
  return stored.previous;
}

interface Size {
  width: number;
  height: number;
}

function useSize(element: HTMLElement | null): Size | undefined {
  const [size, setSize] = useState<Size | undefined>(undefined);

  useLayoutEffect(() => {
    if (!element) {
      setSize(undefined);
      return;
    }
    setSize({ width: element.offsetWidth, height: element.offsetHeight });

    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      let width: number;
      let height: number;
      if (Array.isArray(entry.borderBoxSize)) {
        const [box] = entry.borderBoxSize;
        width = box?.inlineSize ?? element.offsetWidth;
        height = box?.blockSize ?? element.offsetHeight;
      } else {
        width = element.offsetWidth;
        height = element.offsetHeight;
      }
      setSize({ width, height });
    });
    observer.observe(element, { box: 'border-box' });
    return () => observer.disconnect();
  }, [element]);

  return size;
}
