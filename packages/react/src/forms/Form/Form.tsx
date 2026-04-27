import {
  type ButtonHTMLAttributes,
  createContext,
  type FormHTMLAttributes,
  forwardRef,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type LabelHTMLAttributes,
  type ReactNode,
  useCallback,
  useContext,
  useId,
  useState,
} from 'react';
import { Slot } from '../../primitives/Slot/Slot';

/**
 * Headless equivalent of Radix Form. Built on the native HTML5 validity API:
 * the <input> reports its own ValidityState via the `invalid` and `change`
 * events; Form.Message conditionally renders based on the matching key.
 *
 * This package does not bundle a validation runtime — match against the
 * native `ValidityState` keys (e.g. `"valueMissing"`, `"typeMismatch"`,
 * `"tooShort"`) or pass a custom predicate via `match={(value, validity) => boolean}`.
 */

type ValidityKey =
  | 'badInput'
  | 'customError'
  | 'patternMismatch'
  | 'rangeOverflow'
  | 'rangeUnderflow'
  | 'stepMismatch'
  | 'tooLong'
  | 'tooShort'
  | 'typeMismatch'
  | 'valid'
  | 'valueMissing';

interface FieldContextValue {
  name: string;
  controlId: string;
  validity: ValidityState | null;
  value: string;
  serverInvalid: boolean;
  setValidity: (validity: ValidityState | null) => void;
  setValue: (value: string) => void;
}
const FieldContext = createContext<FieldContextValue | null>(null);
function useFieldContext(consumer: string) {
  const ctx = useContext(FieldContext);
  if (!ctx) throw new Error(`${consumer} must be used inside <Form.Field>`);
  return ctx;
}

export interface FormRootProps extends FormHTMLAttributes<HTMLFormElement> {
  asChild?: boolean;
}

const Root = forwardRef<HTMLFormElement, FormRootProps>(function FormRoot(
  { asChild, ...rest },
  ref,
) {
  const Comp = asChild ? Slot : 'form';
  return <Comp ref={ref} noValidate {...rest} />;
});

export interface FormFieldProps extends HTMLAttributes<HTMLDivElement> {
  name: string;
  asChild?: boolean;
  /**
   * When true, forces the field into an invalid state regardless of the
   * native ValidityState — useful for surfacing server-side errors.
   */
  serverInvalid?: boolean;
  children: ReactNode;
}

const Field = forwardRef<HTMLDivElement, FormFieldProps>(function FormField(
  { name, asChild, serverInvalid = false, children, ...rest },
  ref,
) {
  const controlId = useId();
  const [validity, setValidity] = useState<ValidityState | null>(null);
  const [value, setValue] = useState('');
  const Comp = asChild ? Slot : 'div';
  const clientInvalid = validity !== null && !validity.valid;
  const isInvalid = serverInvalid || clientInvalid;

  return (
    <FieldContext.Provider
      value={{ name, controlId, validity, value, serverInvalid, setValidity, setValue }}
    >
      <Comp
        ref={ref}
        data-valid={!isInvalid ? '' : undefined}
        data-invalid={isInvalid ? '' : undefined}
        aria-invalid={isInvalid ? true : undefined}
        {...rest}
      >
        {children}
      </Comp>
    </FieldContext.Provider>
  );
});

export interface FormLabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  asChild?: boolean;
}

const Label = forwardRef<HTMLLabelElement, FormLabelProps>(function FormLabel(
  { asChild, htmlFor, ...rest },
  ref,
) {
  const field = useFieldContext('Form.Label');
  const Comp = asChild ? Slot : 'label';
  return <Comp ref={ref} htmlFor={htmlFor ?? field.controlId} {...rest} />;
});

export interface FormControlProps extends InputHTMLAttributes<HTMLInputElement> {
  asChild?: boolean;
}

const Control = forwardRef<HTMLInputElement, FormControlProps>(function FormControl(
  { asChild, onInvalid, onChange, id, name, ...rest },
  ref,
) {
  const field = useFieldContext('Form.Control');
  const Comp = asChild ? Slot : 'input';
  const handleInvalid = useCallback(
    (e: React.FormEvent<HTMLInputElement>) => {
      onInvalid?.(e);
      field.setValidity(e.currentTarget.validity);
    },
    [onInvalid, field],
  );
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e);
      field.setValue(e.currentTarget.value);
      field.setValidity(e.currentTarget.validity);
    },
    [onChange, field],
  );
  return (
    <Comp
      ref={ref}
      id={id ?? field.controlId}
      name={name ?? field.name}
      onInvalid={handleInvalid}
      onChange={handleChange}
      {...rest}
    />
  );
});

export type FormMessageMatch =
  | ValidityKey
  | ((value: string, validity: ValidityState | null) => boolean);

export interface FormMessageProps extends HTMLAttributes<HTMLSpanElement> {
  match: FormMessageMatch;
  asChild?: boolean;
  forceMatch?: boolean;
}

const Message = forwardRef<HTMLSpanElement, FormMessageProps>(function FormMessage(
  { match, asChild, forceMatch, children, ...rest },
  ref,
) {
  const field = useFieldContext('Form.Message');
  const matches = forceMatch
    ? true
    : typeof match === 'function'
      ? match(field.value, field.validity)
      : (field.validity?.[match] ?? false) === true;
  if (!matches) return null;
  const Comp = asChild ? Slot : 'span';
  return (
    <Comp ref={ref} {...rest}>
      {children}
    </Comp>
  );
});

export interface FormSubmitProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

const Submit = forwardRef<HTMLButtonElement, FormSubmitProps>(function FormSubmit(
  { asChild, type = 'submit', ...rest },
  ref,
) {
  const Comp = asChild ? Slot : 'button';
  return <Comp ref={ref} type={asChild ? undefined : type} {...rest} />;
});

export const Form = { Root, Field, Label, Control, Message, Submit };
