import { useMergedRefs } from '@gugbab-ui/hooks';
import {
  Children,
  cloneElement,
  type FC,
  Fragment,
  forwardRef,
  type HTMLAttributes,
  isValidElement,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';

type AnyProps = Record<string, unknown>;

export interface SlotProps extends HTMLAttributes<HTMLElement> {
  children?: ReactNode;
}

/**
 * Merges the passed props/ref onto its single child. Powers the `asChild`
 * pattern used across `@gugbab-ui/react`. Event handlers from the slot and
 * the child are chained; the child handler runs first and may call
 * `event.preventDefault()` to skip the slot handler.
 *
 * If a `<Slottable>` child is present among multiple children, the slot
 * targets the Slottable's child element instead — this lets compound
 * components forward asChild without losing surrounding markup.
 */
export const Slot = forwardRef<HTMLElement, SlotProps>(function Slot(props, forwardedRef) {
  const { children, ...slotProps } = props;
  const childrenArray = Children.toArray(children);
  const slottable = childrenArray.find(isSlottable);

  if (slottable) {
    // The element to render is the one passed as a child of <Slottable>
    const newElement = (slottable as ReactElement<{ children?: ReactNode }>).props.children;

    const newChildren = childrenArray.map((child) => {
      if (child === slottable) {
        // We grab the slottable's children to lift them out
        if (Children.count(newElement) > 1) return Children.only(null);
        return isValidElement<{ children?: ReactNode }>(newElement)
          ? newElement.props.children
          : null;
      }
      return child;
    });

    return (
      <SlotClone {...slotProps} ref={forwardedRef}>
        {isValidElement(newElement) ? cloneElement(newElement, undefined, newChildren) : null}
      </SlotClone>
    );
  }

  return (
    <SlotClone {...slotProps} ref={forwardedRef}>
      {children}
    </SlotClone>
  );
});

const SlotClone = forwardRef<HTMLElement, SlotProps>(function SlotClone(props, forwardedRef) {
  const { children, ...slotProps } = props;

  // Hooks must run unconditionally — compute element + merged ref first,
  // then decide which render path to take.
  const isPromise =
    children !== null &&
    children !== undefined &&
    !isValidElement(children) &&
    typeof children === 'object' &&
    'then' in (children as object);

  const element = isValidElement(children) ? (children as ReactElement<AnyProps>) : null;

  const REACT_LAZY = Symbol.for('react.lazy');
  const isLazy =
    element !== null &&
    typeof element.type === 'object' &&
    element.type !== null &&
    (element.type as { $$typeof?: symbol }).$$typeof === REACT_LAZY;

  const childRef = element ? getElementRef(element) : null;
  const mergedRef = useMergedRefs(forwardedRef, childRef);

  // React 19 use() — Promise child: render as-is so Suspense handles it.
  if (isPromise) return children as unknown as React.ReactElement;

  // Lazy child: cloneElement on lazy is unsafe; render directly.
  if (isLazy) return element;

  if (!element) {
    return Children.count(children) > 1 ? Children.only(null) : null;
  }

  const childProps = element.props as AnyProps;
  const merged = mergeProps(slotProps as AnyProps, childProps);

  // do not pass ref to React.Fragment for React 19 compatibility
  if (element.type !== Fragment) {
    (merged as AnyProps).ref = mergedRef;
  }
  return cloneElement(element, merged as AnyProps);
});

const SLOTTABLE_IDENTIFIER = Symbol('gugbab-ui.slottable');

interface SlottableProps {
  children: ReactNode;
}

interface SlottableComponent extends FC<SlottableProps> {
  __slottableId: symbol;
}

/**
 * Marker component that identifies which child a parent <Slot> should
 * target when multiple siblings are present. Useful for compound
 * components that wrap user content alongside fixed markup.
 */
export const Slottable: SlottableComponent = ({ children }) => {
  // children are returned via Fragment so they don't introduce a wrapper
  return <>{children}</>;
};
Slottable.displayName = 'Slottable';
Slottable.__slottableId = SLOTTABLE_IDENTIFIER;

function isSlottable(child: ReactNode): child is ReactElement<SlottableProps> {
  return (
    isValidElement(child) &&
    typeof child.type === 'function' &&
    '__slottableId' in child.type &&
    (child.type as { __slottableId?: symbol }).__slottableId === SLOTTABLE_IDENTIFIER
  );
}

function mergeProps(slotProps: AnyProps, childProps: AnyProps): AnyProps {
  const merged: AnyProps = { ...childProps };

  for (const prop in slotProps) {
    const slotValue = slotProps[prop];
    const childValue = childProps[prop];
    const isHandler = /^on[A-Z]/.test(prop);

    if (isHandler) {
      if (typeof slotValue === 'function' && typeof childValue === 'function') {
        merged[prop] = (...args: unknown[]) => {
          // biome-ignore lint/suspicious/noExplicitAny: variadic handler chain
          (childValue as (...a: any[]) => unknown)(...args);
          const first = args[0] as { defaultPrevented?: boolean } | undefined;
          if (first?.defaultPrevented) return;
          // biome-ignore lint/suspicious/noExplicitAny: variadic handler chain
          (slotValue as (...a: any[]) => unknown)(...args);
        };
      } else if (typeof slotValue === 'function') {
        merged[prop] = slotValue;
      }
    } else if (prop === 'style') {
      merged[prop] = {
        ...(slotValue as object),
        ...(childValue as object),
      };
    } else if (prop === 'className') {
      merged[prop] = [slotValue, childValue].filter(Boolean).join(' ');
    } else if (childValue === undefined) {
      merged[prop] = slotValue;
    }
  }

  return merged;
}

function getElementRef(element: ReactElement<AnyProps>): Ref<unknown> | null {
  // React 19: ref is a normal prop; React 18: ref is on element itself.
  const asRecord = element as unknown as { ref?: Ref<unknown> };
  const props = element.props as AnyProps & { ref?: Ref<unknown> };
  return (asRecord.ref ?? props.ref ?? null) as Ref<unknown> | null;
}
