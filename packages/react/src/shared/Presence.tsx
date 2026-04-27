import {
  Children,
  cloneElement,
  isValidElement,
  type ReactElement,
  type Ref,
  useCallback,
} from 'react';
import { usePresence } from './usePresence';

export interface PresenceProps {
  /** When true, the child is mounted. When false, mount continues until any
   * CSS animation/transition completes. */
  present: boolean;
  /**
   * Either a single React element (which receives a ref + remains controlled
   * by usePresence) or a render function that receives the live present
   * boolean. Useful for `data-state="open"|"closed"` driven CSS.
   */
  children: ReactElement | ((present: boolean) => ReactElement);
}

/**
 * Wraps a single element with mount/unmount-after-animation behavior. Mirrors
 * Radix's Presence primitive — adds a render-function form that exposes the
 * present boolean so children can drive `data-state` styling without losing
 * exit animations.
 */
export function Presence({ present, children }: PresenceProps): ReactElement | null {
  const { mounted, presenceRef } = usePresence<HTMLElement>(present);

  // Stable callback that merges our presenceRef onto a child's ref.
  const composeChildRef = useCallback(
    (childRef: Ref<HTMLElement> | null) => (node: HTMLElement | null) => {
      presenceRef.current = node;
      if (typeof childRef === 'function') {
        childRef(node);
      } else if (childRef) {
        (childRef as { current: HTMLElement | null }).current = node;
      }
    },
    [presenceRef],
  );

  if (!mounted) return null;

  const element =
    typeof children === 'function' ? children(present) : (Children.only(children) as ReactElement);

  if (!isValidElement(element)) return null;

  // React 19 keeps refs in props; React 18 stores them on the element. Read
  // props.ref first to avoid the deprecation warning in React 19.
  const childProps = element.props as { ref?: Ref<unknown> };
  const childAsRecord = element as ReactElement & { ref?: Ref<unknown> };
  const childRef = (childProps.ref ?? childAsRecord.ref ?? null) as Ref<HTMLElement> | null;

  return cloneElement(element, { ref: composeChildRef(childRef) } as unknown as Partial<
    typeof element.props
  >);
}
