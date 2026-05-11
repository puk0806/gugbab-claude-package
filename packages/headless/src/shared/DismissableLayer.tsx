import { useLatestRef, useMergedRefs } from '@gugbab/hooks';
import {
  createContext,
  forwardRef,
  type HTMLAttributes,
  type FocusEvent as ReactFocusEvent,
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
  type Ref,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Slot } from '../primitives/Slot';

export type PointerDownOutsideEvent = CustomEvent<{ originalEvent: PointerEvent }>;
export type FocusOutsideEvent = CustomEvent<{ originalEvent: FocusEvent }>;
export type EscapeKeyDownEvent = KeyboardEvent;

export interface DismissableLayerProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * When true, renders the merged props onto the single child element instead
   * of an extra `<div>` wrapper.
   */
  asChild?: boolean;
  /**
   * Disables hover/focus/click interactions outside the layer by setting
   * `pointer-events: none` on the document body.
   */
  disableOutsidePointerEvents?: boolean;
  /** Called when Escape is pressed and this layer is top-most. Cancellable. */
  onEscapeKeyDown?: (event: EscapeKeyDownEvent) => void;
  /** Called when `pointerdown` happens outside the layer. Cancellable. */
  onPointerDownOutside?: (event: PointerDownOutsideEvent) => void;
  /** Called when focus moves outside the layer. Cancellable. */
  onFocusOutside?: (event: FocusOutsideEvent) => void;
  /**
   * Called when ANY interaction (pointerdown OR focus) happens outside.
   * Fires together with `onPointerDownOutside` / `onFocusOutside`. Cancellable.
   */
  onInteractOutside?: (event: PointerDownOutsideEvent | FocusOutsideEvent) => void;
  /** Called once an unprevented dismissal pathway fires. */
  onDismiss?: () => void;
  children?: ReactNode;
}

interface DismissableLayerContextValue {
  layers: Set<HTMLElement>;
  layersWithOutsidePointerEventsDisabled: Set<HTMLElement>;
  branches: Set<HTMLElement>;
  /** Notify all layers when membership changes so the highest-layer logic re-runs. */
  subscribe: (listener: () => void) => () => void;
  notify: () => void;
}

function createContextValue(): DismissableLayerContextValue {
  const listeners = new Set<() => void>();
  return {
    layers: new Set(),
    layersWithOutsidePointerEventsDisabled: new Set(),
    branches: new Set(),
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    notify() {
      for (const listener of listeners) listener();
    },
  };
}

const DismissableLayerContext = createContext<DismissableLayerContextValue | null>(null);

function useDismissableLayerContext(): DismissableLayerContextValue {
  const ctx = useContext(DismissableLayerContext);
  if (ctx) return ctx;
  // Fall back to a module-level singleton so layers in independent React
  // subtrees still share a stack (e.g. portaled siblings without a Provider
  // higher up). This matches Radix behavior.
  return moduleLayerContext;
}

const moduleLayerContext: DismissableLayerContextValue = createContextValue();

// 원래 body.pointerEvents 값을 *Document 단위* 로 보존한다. 이전엔 모듈-레벨
// `let` 변수였는데, SSR 환경에서 같은 Node 프로세스가 여러 request 를 동시
// 처리할 때 cross-request leak 가능성이 있었다 (DismissableLayer 자체는
// "use client" 라 effect 는 안 돌지만 모듈 평가는 공유). WeakMap<Document>
// 으로 격리하면 document 가 GC 되면 자동 정리되고 multi-tenant 안전.
const originalBodyPointerEventsByDoc = new WeakMap<Document, string | null>();

export const DismissableLayer = forwardRef<HTMLDivElement, DismissableLayerProps>(
  function DismissableLayer(props, forwardedRef) {
    const {
      asChild,
      disableOutsidePointerEvents = false,
      onEscapeKeyDown,
      onPointerDownOutside,
      onFocusOutside,
      onInteractOutside,
      onDismiss,
      onPointerDownCapture,
      onFocusCapture,
      onBlurCapture,
      style,
      children,
      ...layerProps
    } = props;

    const context = useDismissableLayerContext();
    const [node, setNode] = useState<HTMLDivElement | null>(null);
    const composedRef = useMergedRefs<HTMLDivElement>(forwardedRef as Ref<HTMLDivElement>, setNode);

    // Re-render when layer membership changes — used to recompute top-most.
    const [, force] = useState(0);
    useEffect(() => context.subscribe(() => force((n) => n + 1)), [context]);

    // Refs to keep the latest user handlers without re-binding document listeners.
    const onPointerDownOutsideRef = useLatestRef(onPointerDownOutside);
    const onFocusOutsideRef = useLatestRef(onFocusOutside);
    const onInteractOutsideRef = useLatestRef(onInteractOutside);
    const onEscapeKeyDownRef = useLatestRef(onEscapeKeyDown);
    const onDismissRef = useLatestRef(onDismiss);

    // Track inside-tree interactions via React capture handlers on the wrapper.
    const isPointerInsideRef = useRef(false);
    const isFocusInsideRef = useRef(false);

    const handlePointerDownCapture = useCallback(
      (event: ReactPointerEvent<HTMLDivElement>) => {
        isPointerInsideRef.current = true;
        onPointerDownCapture?.(event);
      },
      [onPointerDownCapture],
    );

    const handleFocusCapture = useCallback(
      (event: ReactFocusEvent<HTMLDivElement>) => {
        isFocusInsideRef.current = true;
        onFocusCapture?.(event);
      },
      [onFocusCapture],
    );

    const handleBlurCapture = useCallback(
      (event: ReactFocusEvent<HTMLDivElement>) => {
        isFocusInsideRef.current = false;
        onBlurCapture?.(event);
      },
      [onBlurCapture],
    );

    // Document `pointerdown` listener — deferred to next tick so the very
    // pointerdown that mounts the layer cannot also dismiss it.
    useEffect(() => {
      if (!node) return;
      const ownerDocument = node.ownerDocument;

      const handlePointerDown = (event: PointerEvent) => {
        const target = event.target as HTMLElement | null;
        const wasInside = isPointerInsideRef.current;
        isPointerInsideRef.current = false;

        if (wasInside || !target) return;

        // Branches count as inside.
        for (const branch of context.branches) {
          if (branch.contains(target)) return;
        }

        // Stack: skip if a layer above us has disabled outside pointer events
        // and this layer is below it.
        if (!isPointerEventsEnabled(node, context)) return;

        const customEvent = new CustomEvent('dismissableLayer.pointerDownOutside', {
          bubbles: false,
          cancelable: true,
          detail: { originalEvent: event },
        }) as PointerDownOutsideEvent;

        onPointerDownOutsideRef.current?.(customEvent);
        onInteractOutsideRef.current?.(customEvent);
        if (!customEvent.defaultPrevented) {
          onDismissRef.current?.();
        }
      };

      const timerId = window.setTimeout(() => {
        ownerDocument.addEventListener('pointerdown', handlePointerDown);
      }, 0);
      return () => {
        window.clearTimeout(timerId);
        ownerDocument.removeEventListener('pointerdown', handlePointerDown);
      };
    }, [node, context, onPointerDownOutsideRef, onInteractOutsideRef, onDismissRef]);

    // Document `focusin` listener.
    useEffect(() => {
      if (!node) return;
      const ownerDocument = node.ownerDocument;

      const handleFocus = (event: FocusEvent) => {
        const target = event.target as HTMLElement | null;
        if (!target) return;
        if (isFocusInsideRef.current) return;
        if (node.contains(target)) return;
        for (const branch of context.branches) {
          if (branch.contains(target)) return;
        }

        const customEvent = new CustomEvent('dismissableLayer.focusOutside', {
          bubbles: false,
          cancelable: true,
          detail: { originalEvent: event },
        }) as FocusOutsideEvent;

        onFocusOutsideRef.current?.(customEvent);
        onInteractOutsideRef.current?.(customEvent);
        if (!customEvent.defaultPrevented) {
          onDismissRef.current?.();
        }
      };

      ownerDocument.addEventListener('focusin', handleFocus);
      return () => ownerDocument.removeEventListener('focusin', handleFocus);
    }, [node, context, onFocusOutsideRef, onInteractOutsideRef, onDismissRef]);

    // Document `keydown` listener — only the top-most layer responds to Escape.
    useEffect(() => {
      if (!node) return;
      const ownerDocument = node.ownerDocument;

      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key !== 'Escape') return;
        if (!isTopMostLayer(node, context)) return;

        onEscapeKeyDownRef.current?.(event);
        if (!event.defaultPrevented) {
          onDismissRef.current?.();
        }
      };

      ownerDocument.addEventListener('keydown', handleKeyDown);
      return () => ownerDocument.removeEventListener('keydown', handleKeyDown);
    }, [node, context, onEscapeKeyDownRef, onDismissRef]);

    // Register / unregister this layer's node in the shared stack.
    useEffect(() => {
      if (!node) return;
      context.layers.add(node);
      if (disableOutsidePointerEvents) {
        if (context.layersWithOutsidePointerEventsDisabled.size === 0) {
          const doc = node.ownerDocument;
          originalBodyPointerEventsByDoc.set(doc, doc.body.style.pointerEvents);
          doc.body.style.pointerEvents = 'none';
        }
        context.layersWithOutsidePointerEventsDisabled.add(node);
      }
      context.notify();
      return () => {
        context.layers.delete(node);
        if (context.layersWithOutsidePointerEventsDisabled.has(node)) {
          context.layersWithOutsidePointerEventsDisabled.delete(node);
          if (context.layersWithOutsidePointerEventsDisabled.size === 0) {
            const doc = node.ownerDocument;
            doc.body.style.pointerEvents = originalBodyPointerEventsByDoc.get(doc) ?? '';
            originalBodyPointerEventsByDoc.delete(doc);
          }
        }
        context.notify();
      };
    }, [node, context, disableOutsidePointerEvents]);

    const layerStyle = useMemo(() => {
      const isAnyDisabled = context.layersWithOutsidePointerEventsDisabled.size > 0;
      if (!isAnyDisabled) return style;
      const isEnabled = node ? isPointerEventsEnabled(node, context) : true;
      return {
        pointerEvents: isEnabled ? 'auto' : 'none',
        ...style,
      } as HTMLAttributes<HTMLDivElement>['style'];
    }, [context, node, style]);

    const Comp: React.ElementType = asChild ? Slot : 'div';

    return (
      <Comp
        {...layerProps}
        ref={composedRef}
        style={layerStyle}
        onPointerDownCapture={handlePointerDownCapture}
        onFocusCapture={handleFocusCapture}
        onBlurCapture={handleBlurCapture}
      >
        {children}
      </Comp>
    );
  },
);

/**
 * Top-most = the layer with no descendant layer in the DOM. If multiple
 * top-most candidates exist (sibling layer trees), the most recently inserted
 * wins. This is robust to React's child-first effect order during initial
 * mount of nested layers.
 */
function isTopMostLayer(node: HTMLElement, context: DismissableLayerContextValue): boolean {
  const all = Array.from(context.layers);
  const noDescendant = all.filter(
    (layer) => !all.some((other) => other !== layer && layer.contains(other)),
  );
  return noDescendant[noDescendant.length - 1] === node;
}

function isPointerEventsEnabled(node: HTMLElement, context: DismissableLayerContextValue): boolean {
  const layers = Array.from(context.layers);
  const disabled = Array.from(context.layersWithOutsidePointerEventsDisabled);
  const highestDisabled = disabled[disabled.length - 1];
  if (!highestDisabled) return true;
  const highestDisabledIndex = layers.indexOf(highestDisabled);
  const ownIndex = layers.indexOf(node);
  return ownIndex >= highestDisabledIndex;
}

export interface DismissableLayerBranchProps extends HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
  children?: ReactNode;
}

/**
 * Marks a subtree as "still part of" a sibling DismissableLayer — pointerdown
 * or focus inside a Branch will not be treated as outside. Useful for portaled
 * submenus or elements that visually belong to an open layer but live in a
 * separate DOM subtree.
 */
export const DismissableLayerBranch = forwardRef<HTMLDivElement, DismissableLayerBranchProps>(
  function DismissableLayerBranch(props, forwardedRef) {
    const { asChild, children, ...rest } = props;
    const context = useDismissableLayerContext();
    const [node, setNode] = useState<HTMLDivElement | null>(null);
    const composedRef = useMergedRefs<HTMLDivElement>(forwardedRef as Ref<HTMLDivElement>, setNode);

    useEffect(() => {
      if (!node) return;
      context.branches.add(node);
      return () => {
        context.branches.delete(node);
      };
    }, [node, context]);

    const Comp: React.ElementType = asChild ? Slot : 'div';
    return (
      <Comp {...rest} ref={composedRef}>
        {children}
      </Comp>
    );
  },
);
