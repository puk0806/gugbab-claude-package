import { forwardRef, type LabelHTMLAttributes } from 'react';

/**
 * Native `<label>` with one behavior tweak: prevents accidental text
 * selection when the user double-clicks the label to focus the associated
 * control. Matches Radix's Label primitive — interactive child clicks are
 * passed through unchanged (no preventDefault, no onMouseDown forwarding).
 *
 * Consumers are responsible for associating the label with a control via
 * `htmlFor` or nested structure.
 */
export const Label = forwardRef<HTMLLabelElement, LabelHTMLAttributes<HTMLLabelElement>>(
  function Label(props, ref) {
    return (
      <label
        {...props}
        ref={ref}
        onMouseDown={(event) => {
          // pass through clicks on interactive children; do not forward onMouseDown
          const target = event.target as HTMLElement;
          if (target.closest('button, input, select, textarea')) return;

          props.onMouseDown?.(event);
          // prevent text selection when double-clicking the label
          if (!event.defaultPrevented && event.detail > 1) event.preventDefault();
        }}
      />
    );
  },
);
Label.displayName = 'Label';
