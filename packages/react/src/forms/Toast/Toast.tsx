import {
  type ButtonHTMLAttributes,
  createContext,
  forwardRef,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { VisuallyHidden } from '../../primitives/VisuallyHidden/VisuallyHidden';

/* -------------------------------------------------------------------------------------------------
 * Types
 * -----------------------------------------------------------------------------------------------*/

type SwipeDirection = 'up' | 'down' | 'left' | 'right';

/* -------------------------------------------------------------------------------------------------
 * ToastProvider context
 * -----------------------------------------------------------------------------------------------*/

interface ToastProviderContextValue {
  label: string;
  duration: number;
  swipeDirection: SwipeDirection;
  swipeThreshold: number;
  viewport: HTMLOListElement | null;
  onViewportChange: (el: HTMLOListElement | null) => void;
  onToastAdd: () => void;
  onToastRemove: () => void;
  toastCount: number;
  isFocusedToastEscapeKeyDownRef: React.MutableRefObject<boolean>;
  isClosePausedRef: React.MutableRefObject<boolean>;
}

const ProviderCtx = createContext<ToastProviderContextValue | null>(null);

function useProviderCtx(consumer: string): ToastProviderContextValue {
  const ctx = useContext(ProviderCtx);
  if (!ctx) throw new Error(`<${consumer}> must be used inside <Toast.Provider>`);
  return ctx;
}

/* -------------------------------------------------------------------------------------------------
 * ToastInteractive context (per-toast close handler)
 * -----------------------------------------------------------------------------------------------*/

interface ToastInteractiveContextValue {
  onClose: () => void;
}

const InteractiveCtx = createContext<ToastInteractiveContextValue | null>(null);

function useInteractiveCtx(consumer: string): ToastInteractiveContextValue {
  const ctx = useContext(InteractiveCtx);
  if (!ctx) throw new Error(`<${consumer}> must be used inside <Toast.Root>`);
  return ctx;
}

/* -------------------------------------------------------------------------------------------------
 * Viewport pause/resume events (custom DOM events)
 * -----------------------------------------------------------------------------------------------*/

const VIEWPORT_PAUSE = 'toast.viewportPause';
const VIEWPORT_RESUME = 'toast.viewportResume';

const TOAST_SWIPE_START = 'toast.swipeStart';
const TOAST_SWIPE_MOVE = 'toast.swipeMove';
const TOAST_SWIPE_CANCEL = 'toast.swipeCancel';
const TOAST_SWIPE_END = 'toast.swipeEnd';

const VIEWPORT_DEFAULT_HOTKEY = ['F8'];

/* -------------------------------------------------------------------------------------------------
 * ToastProvider
 * -----------------------------------------------------------------------------------------------*/

export interface ToastProviderProps {
  children: ReactNode;
  /**
   * Author-localized label for each toast — used in the SR announcer prefix.
   * @defaultValue 'Notification'
   */
  label?: string;
  /**
   * Default duration (ms) each toast remains visible.
   * @defaultValue 5000
   */
  duration?: number;
  /**
   * Swipe direction that triggers dismissal.
   * @defaultValue 'right'
   */
  swipeDirection?: SwipeDirection;
  /**
   * Pixel distance a swipe must travel before it triggers dismissal.
   * @defaultValue 50
   */
  swipeThreshold?: number;
}

function Provider({
  children,
  label = 'Notification',
  duration = 5000,
  swipeDirection = 'right',
  swipeThreshold = 50,
}: ToastProviderProps) {
  const [viewport, setViewport] = useState<HTMLOListElement | null>(null);
  const [toastCount, setToastCount] = useState(0);
  const isFocusedToastEscapeKeyDownRef = useRef(false);
  const isClosePausedRef = useRef(false);

  const onToastAdd = useCallback(() => setToastCount((c) => c + 1), []);
  const onToastRemove = useCallback(() => setToastCount((c) => c - 1), []);

  return (
    <ProviderCtx.Provider
      value={{
        label,
        duration,
        swipeDirection,
        swipeThreshold,
        viewport,
        onViewportChange: setViewport,
        onToastAdd,
        onToastRemove,
        toastCount,
        isFocusedToastEscapeKeyDownRef,
        isClosePausedRef,
      }}
    >
      {children}
    </ProviderCtx.Provider>
  );
}

/* -------------------------------------------------------------------------------------------------
 * ToastViewport
 * -----------------------------------------------------------------------------------------------*/

export interface ToastViewportProps extends HTMLAttributes<HTMLOListElement> {
  /**
   * Keys that move focus into the viewport (hotkey navigation).
   * @defaultValue ['F8']
   */
  hotkey?: string[];
  /**
   * SR label — `{hotkey}` placeholder is replaced automatically.
   * @defaultValue 'Notifications ({hotkey})'
   */
  label?: string;
}

const Viewport = forwardRef<HTMLOListElement, ToastViewportProps>(function ToastViewport(
  { hotkey = VIEWPORT_DEFAULT_HOTKEY, label = 'Notifications ({hotkey})', style, ...rest },
  forwardedRef,
) {
  const ctx = useProviderCtx('Toast.Viewport');
  const internalRef = useRef<HTMLOListElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const headProxyRef = useRef<HTMLSpanElement>(null);
  const tailProxyRef = useRef<HTMLSpanElement>(null);
  const hasToasts = ctx.toastCount > 0;
  const hotkeyLabel = hotkey.join('+').replace(/Key/g, '').replace(/Digit/g, '');

  // Merge forwarded ref + internal ref + notify Provider
  // biome-ignore lint/correctness/useExhaustiveDependencies: forwardedRef is a ref object/callback — adding it would cause infinite re-renders with inline ref callbacks
  const setRef = useCallback(
    (el: HTMLOListElement | null) => {
      (internalRef as React.MutableRefObject<HTMLOListElement | null>).current = el;
      ctx.onViewportChange(el);
      if (typeof forwardedRef === 'function') forwardedRef(el);
      else if (forwardedRef) forwardedRef.current = el;
    },
    [ctx.onViewportChange],
  );

  // Hotkey: focus viewport when key combo is pressed
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const pressed =
        hotkey.length > 0 &&
        hotkey.every(
          (key) => (e as unknown as Record<string, unknown>)[key] === true || e.code === key,
        );
      if (pressed) internalRef.current?.focus();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [hotkey]);

  // Pause/resume on hover/focus within the wrapper region
  useEffect(() => {
    const wrapper = wrapperRef.current;
    const viewport = internalRef.current;
    if (!hasToasts || !wrapper || !viewport) return;

    const pause = () => {
      if (!ctx.isClosePausedRef.current) {
        viewport.dispatchEvent(new CustomEvent(VIEWPORT_PAUSE));
        ctx.isClosePausedRef.current = true;
      }
    };
    const resume = () => {
      if (ctx.isClosePausedRef.current) {
        viewport.dispatchEvent(new CustomEvent(VIEWPORT_RESUME));
        ctx.isClosePausedRef.current = false;
      }
    };
    const handleFocusOut = (e: FocusEvent) => {
      if (!wrapper.contains(e.relatedTarget as HTMLElement)) resume();
    };
    const handlePointerLeave = () => {
      if (!wrapper.contains(document.activeElement)) resume();
    };

    wrapper.addEventListener('focusin', pause);
    wrapper.addEventListener('focusout', handleFocusOut);
    wrapper.addEventListener('pointermove', pause);
    wrapper.addEventListener('pointerleave', handlePointerLeave);
    window.addEventListener('blur', pause);
    window.addEventListener('focus', resume);
    return () => {
      wrapper.removeEventListener('focusin', pause);
      wrapper.removeEventListener('focusout', handleFocusOut);
      wrapper.removeEventListener('pointermove', pause);
      wrapper.removeEventListener('pointerleave', handlePointerLeave);
      window.removeEventListener('blur', pause);
      window.removeEventListener('focus', resume);
    };
  }, [hasToasts, ctx.isClosePausedRef]);

  // Programmatic tab management (most recent toast first)
  useEffect(() => {
    const viewport = internalRef.current;
    if (!viewport) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const isMetaKey = e.altKey || e.ctrlKey || e.metaKey;
      if (e.key !== 'Tab' || isMetaKey) return;
      const focused = document.activeElement;
      const backwards = e.shiftKey;
      if (e.target === viewport && backwards) {
        headProxyRef.current?.focus();
        return;
      }
      const candidates = getTabbableCandidates(viewport, backwards);
      const idx = candidates.indexOf(focused as HTMLElement);
      if (focusFirst(candidates.slice(idx + 1))) {
        e.preventDefault();
      } else {
        backwards ? headProxyRef.current?.focus() : tailProxyRef.current?.focus();
      }
    };
    viewport.addEventListener('keydown', handleKeyDown);
    return () => viewport.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div ref={wrapperRef} style={{ pointerEvents: hasToasts ? undefined : 'none' }}>
      {hasToasts && <FocusProxy ref={headProxyRef} viewport={internalRef} direction="forwards" />}
      <ol
        tabIndex={-1}
        role="region"
        aria-label={label.replace('{hotkey}', hotkeyLabel)}
        {...rest}
        ref={setRef}
        style={style}
      />
      {hasToasts && <FocusProxy ref={tailProxyRef} viewport={internalRef} direction="backwards" />}
    </div>
  );
});

/* -------------------------------------------------------------------------------------------------
 * FocusProxy (internal)
 * -----------------------------------------------------------------------------------------------*/

interface FocusProxyProps {
  viewport: React.RefObject<HTMLOListElement | null>;
  direction: 'forwards' | 'backwards';
}

const FocusProxy = forwardRef<HTMLSpanElement, FocusProxyProps>(function FocusProxy(
  { viewport, direction },
  ref,
) {
  return (
    <VisuallyHidden
      tabIndex={0}
      ref={ref}
      style={{ position: 'fixed' }}
      onFocus={(e) => {
        const vp = viewport.current;
        if (!vp) return;
        const prev = e.relatedTarget as HTMLElement | null;
        const fromOutside = !vp.contains(prev);
        if (!fromOutside) return;
        const candidates = getTabbableCandidates(vp, direction === 'backwards');
        focusFirst(candidates);
      }}
    />
  );
});

/* -------------------------------------------------------------------------------------------------
 * ToastRoot
 * -----------------------------------------------------------------------------------------------*/

type SwipeEvent = CustomEvent<{ originalEvent: PointerEvent; delta: { x: number; y: number } }>;

export interface ToastRootProps extends HTMLAttributes<HTMLLIElement> {
  /** Controls visibility. */
  open?: boolean;
  /** Initial open state (uncontrolled). @defaultValue true */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /**
   * Toast urgency type.
   * - `'foreground'` → role="status" aria-live="assertive"
   * - `'background'` → role="status" aria-live="polite"
   * @defaultValue 'foreground'
   */
  type?: 'foreground' | 'background';
  /** Per-toast duration override (ms). Inherits from Provider when omitted. */
  duration?: number;
  onPause?: () => void;
  onResume?: () => void;
  onSwipeStart?: (e: SwipeEvent) => void;
  onSwipeMove?: (e: SwipeEvent) => void;
  onSwipeCancel?: (e: SwipeEvent) => void;
  onSwipeEnd?: (e: SwipeEvent) => void;
  onEscapeKeyDown?: (e: KeyboardEvent) => void;
  /** Force mount (useful for animation libraries). */
  forceMount?: true;
}

const Root = forwardRef<HTMLLIElement, ToastRootProps>(function ToastRoot(props, forwardedRef) {
  const {
    open: openProp,
    defaultOpen,
    onOpenChange,
    forceMount,
    type = 'foreground',
    duration: durationProp,
    onPause,
    onResume,
    onSwipeStart,
    onSwipeMove,
    onSwipeCancel,
    onSwipeEnd,
    onEscapeKeyDown,
    style,
    children,
    ...rest
  } = props;

  // Controlled / uncontrolled open state
  const [openState, setOpenState] = useState(defaultOpen ?? true);
  const open = openProp !== undefined ? openProp : openState;
  const setOpen = useCallback(
    (next: boolean) => {
      if (openProp === undefined) setOpenState(next);
      onOpenChange?.(next);
    },
    [openProp, onOpenChange],
  );

  const ctx = useProviderCtx('Toast.Root');
  const [node, setNode] = useState<HTMLLIElement | null>(null);
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
  const swipeDeltaRef = useRef<{ x: number; y: number } | null>(null);
  const duration = durationProp ?? ctx.duration;
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimerStartRef = useRef(0);
  const closeTimerRemainingRef = useRef(duration);
  const { onToastAdd, onToastRemove } = ctx;

  const composedRef = useCallback(
    (el: HTMLLIElement | null) => {
      setNode(el);
      if (typeof forwardedRef === 'function') forwardedRef(el);
      else if (forwardedRef) forwardedRef.current = el;
    },
    [forwardedRef],
  );

  const handleClose = useCallback(() => {
    const focusInToast = node?.contains(document.activeElement);
    if (focusInToast) ctx.viewport?.focus();
    setOpen(false);
  }, [node, ctx.viewport, setOpen]);

  const startTimer = useCallback(
    (ms: number) => {
      if (!ms || ms === Infinity) return;
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
      closeTimerStartRef.current = Date.now();
      closeTimerRef.current = setTimeout(handleClose, ms);
    },
    [handleClose],
  );

  // Viewport-level pause / resume events
  useEffect(() => {
    const viewport = ctx.viewport;
    if (!viewport) return;
    const handlePause = () => {
      const elapsed = Date.now() - closeTimerStartRef.current;
      closeTimerRemainingRef.current = Math.max(0, closeTimerRemainingRef.current - elapsed);
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
      onPause?.();
    };
    const handleResume = () => {
      startTimer(closeTimerRemainingRef.current);
      onResume?.();
    };
    viewport.addEventListener(VIEWPORT_PAUSE, handlePause);
    viewport.addEventListener(VIEWPORT_RESUME, handleResume);
    return () => {
      viewport.removeEventListener(VIEWPORT_PAUSE, handlePause);
      viewport.removeEventListener(VIEWPORT_RESUME, handleResume);
    };
  }, [ctx.viewport, onPause, onResume, startTimer]);

  // Start timer when open/duration changes
  useEffect(() => {
    if (open && !ctx.isClosePausedRef.current) {
      closeTimerRemainingRef.current = duration;
      startTimer(duration);
    }
  }, [open, duration, ctx.isClosePausedRef, startTimer]);

  // Track toast count for Viewport
  useEffect(() => {
    onToastAdd();
    return () => onToastRemove();
  }, [onToastAdd, onToastRemove]);

  // Announcer text (derived from rendered node)
  const announceText = useMemo(() => (node ? getAnnounceTextContent(node) : null), [node]);

  if (!ctx.viewport) return null;
  if (!open && !forceMount) return null;

  const swipeHandlers = {
    onPointerDown: (e: ReactPointerEvent<HTMLLIElement>) => {
      rest.onPointerDown?.(e);
      // Only track primary button for mouse; allow all for touch/pen
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      pointerStartRef.current = { x: e.clientX, y: e.clientY };
    },
    onPointerMove: (e: ReactPointerEvent<HTMLLIElement>) => {
      rest.onPointerMove?.(e);
      if (!pointerStartRef.current) return;
      const x = e.clientX - pointerStartRef.current.x;
      const y = e.clientY - pointerStartRef.current.y;
      const isHoriz = ctx.swipeDirection === 'left' || ctx.swipeDirection === 'right';
      const clamp =
        ctx.swipeDirection === 'left' || ctx.swipeDirection === 'up' ? Math.min : Math.max;
      const dx = isHoriz ? clamp(0, x) : 0;
      const dy = !isHoriz ? clamp(0, y) : 0;
      const delta = { x: dx, y: dy };
      const buf = e.pointerType === 'touch' ? 10 : 2;

      if (swipeDeltaRef.current) {
        swipeDeltaRef.current = delta;
        if (node)
          dispatchSwipeEvent(TOAST_SWIPE_MOVE, onSwipeMove, node, e.nativeEvent, delta, false);
      } else if (isDeltaInDirection(delta, ctx.swipeDirection, buf)) {
        swipeDeltaRef.current = delta;
        if (node)
          dispatchSwipeEvent(TOAST_SWIPE_START, onSwipeStart, node, e.nativeEvent, delta, false);
        (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
      } else if (Math.abs(x) > buf || Math.abs(y) > buf) {
        pointerStartRef.current = null;
      }
    },
    onPointerUp: (e: ReactPointerEvent<HTMLLIElement>) => {
      rest.onPointerUp?.(e);
      const delta = swipeDeltaRef.current;
      const target = e.target as HTMLElement;
      if (target.hasPointerCapture?.(e.pointerId)) target.releasePointerCapture(e.pointerId);
      swipeDeltaRef.current = null;
      pointerStartRef.current = null;
      if (!delta) return;
      if (isDeltaInDirection(delta, ctx.swipeDirection, ctx.swipeThreshold)) {
        if (node) dispatchSwipeEvent(TOAST_SWIPE_END, onSwipeEnd, node, e.nativeEvent, delta, true);
        setOpen(false);
      } else {
        if (node)
          dispatchSwipeEvent(TOAST_SWIPE_CANCEL, onSwipeCancel, node, e.nativeEvent, delta, true);
      }
      e.currentTarget.addEventListener('click', (ev) => ev.preventDefault(), { once: true });
    },
  };

  const li = (
    <InteractiveCtx.Provider value={{ onClose: handleClose }}>
      <li
        tabIndex={0}
        role="status"
        aria-live={type === 'foreground' ? 'assertive' : 'polite'}
        aria-atomic="true"
        data-state={open ? 'open' : 'closed'}
        data-type={type}
        data-swipe-direction={ctx.swipeDirection}
        {...rest}
        ref={composedRef}
        style={{ userSelect: 'none', touchAction: 'none', ...style }}
        onKeyDown={(e: ReactKeyboardEvent<HTMLLIElement>) => {
          rest.onKeyDown?.(e);
          if (e.key !== 'Escape') return;
          onEscapeKeyDown?.(e.nativeEvent);
          if (!e.nativeEvent.defaultPrevented) {
            ctx.isFocusedToastEscapeKeyDownRef.current = true;
            handleClose();
          }
        }}
        {...swipeHandlers}
      >
        {children}
      </li>
    </InteractiveCtx.Provider>
  );

  return (
    <>
      {announceText && announceText.length > 0 && (
        <Announcer label={ctx.label} type={type} texts={announceText} />
      )}
      {createPortal(li, ctx.viewport)}
    </>
  );
});

/* -------------------------------------------------------------------------------------------------
 * Announcer — SR live region (rendered outside viewport via portal to document.body)
 * -----------------------------------------------------------------------------------------------*/

interface AnnouncerProps {
  label: string;
  type: 'foreground' | 'background';
  texts: string[];
}

function Announcer({ label, type, texts }: AnnouncerProps) {
  const [renderText, setRenderText] = useState(false);
  const [done, setDone] = useState(false);

  // Render text in next animation frame so NVDA picks it up
  useLayoutEffect(() => {
    let raf1 = 0;
    let raf2 = 0;
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setRenderText(true));
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDone(true), 1000);
    return () => clearTimeout(t);
  }, []);

  if (done) return null;

  return createPortal(
    <VisuallyHidden
      role="status"
      aria-live={type === 'foreground' ? 'assertive' : 'polite'}
      aria-atomic="true"
    >
      {renderText ? `${label} ${texts.join(' ')}` : null}
    </VisuallyHidden>,
    document.body,
  );
}

/* -------------------------------------------------------------------------------------------------
 * ToastTitle
 * -----------------------------------------------------------------------------------------------*/

export interface ToastTitleProps extends HTMLAttributes<HTMLDivElement> {}

const Title = forwardRef<HTMLDivElement, ToastTitleProps>(function ToastTitle(props, ref) {
  return <div {...props} ref={ref} />;
});
Title.displayName = 'ToastTitle';

/* -------------------------------------------------------------------------------------------------
 * ToastDescription
 * -----------------------------------------------------------------------------------------------*/

export interface ToastDescriptionProps extends HTMLAttributes<HTMLDivElement> {}

const Description = forwardRef<HTMLDivElement, ToastDescriptionProps>(
  function ToastDescription(props, ref) {
    return <div {...props} ref={ref} />;
  },
);
Description.displayName = 'ToastDescription';

/* -------------------------------------------------------------------------------------------------
 * ToastAction
 * -----------------------------------------------------------------------------------------------*/

export interface ToastActionProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Short SR-only description of the action for screen reader users who cannot
   * easily reach the button. Required and must be non-empty.
   * @example altText="Undo (Alt+Z)"
   */
  altText: string;
}

const Action = forwardRef<HTMLButtonElement, ToastActionProps>(function ToastAction(
  { altText, onClick, type = 'button', children, ...rest },
  ref,
) {
  const { onClose } = useInteractiveCtx('Toast.Action');
  return (
    <div data-gugbab-toast-announce-exclude="" data-gugbab-toast-announce-alt={altText}>
      <button
        ref={ref}
        type={type}
        {...rest}
        onClick={(e) => {
          onClick?.(e);
          if (!e.defaultPrevented) onClose();
        }}
      >
        {children}
      </button>
    </div>
  );
});
Action.displayName = 'ToastAction';

/* -------------------------------------------------------------------------------------------------
 * ToastClose
 * -----------------------------------------------------------------------------------------------*/

export interface ToastCloseProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

const Close = forwardRef<HTMLButtonElement, ToastCloseProps>(function ToastClose(
  { onClick, type = 'button', children, ...rest },
  ref,
) {
  const { onClose } = useInteractiveCtx('Toast.Close');
  return (
    <div data-gugbab-toast-announce-exclude="">
      <button
        ref={ref}
        type={type}
        aria-label={children ? undefined : 'Close'}
        {...rest}
        onClick={(e) => {
          onClick?.(e);
          if (!e.defaultPrevented) onClose();
        }}
      >
        {children}
      </button>
    </div>
  );
});
Close.displayName = 'ToastClose';

/* -------------------------------------------------------------------------------------------------
 * useToast — imperative API (kept for backward compat, optional)
 * To use: manage open state outside and render <Toast.Root open={open} onOpenChange={setOpen}>
 * -----------------------------------------------------------------------------------------------*/

// No-op — imperative queue is intentionally removed in favor of controlled open prop.
// Consumers manage their own toast state and render <Toast.Root> directly.

/* -------------------------------------------------------------------------------------------------
 * Utilities
 * -----------------------------------------------------------------------------------------------*/

function isDeltaInDirection(
  delta: { x: number; y: number },
  direction: SwipeDirection,
  threshold = 0,
): boolean {
  const ax = Math.abs(delta.x);
  const ay = Math.abs(delta.y);
  const isX = ax > ay;
  if (direction === 'left' || direction === 'right') return isX && ax > threshold;
  return !isX && ay > threshold;
}

function dispatchSwipeEvent(
  name: string,
  handler: ((e: SwipeEvent) => void) | undefined,
  targetEl: HTMLElement,
  originalEvent: PointerEvent,
  delta: { x: number; y: number },
  discrete: boolean,
) {
  const detail = { originalEvent, delta };
  const event = new CustomEvent(name, { bubbles: true, cancelable: true, detail }) as SwipeEvent;
  if (handler) targetEl.addEventListener(name, handler as EventListener, { once: true });
  if (discrete) {
    // schedule in a microtask so it fires after pointer capture release
    Promise.resolve().then(() => targetEl.dispatchEvent(event));
  } else {
    targetEl.dispatchEvent(event);
  }
}

function getAnnounceTextContent(container: HTMLElement): string[] {
  const texts: string[] = [];
  for (const node of Array.from(container.childNodes)) {
    if (node.nodeType === Node.TEXT_NODE && node.textContent) {
      texts.push(node.textContent);
    } else if (isHTMLElement(node)) {
      const hidden = node.ariaHidden || node.hidden || node.style.display === 'none';
      if (hidden) continue;
      if (node.dataset.gugbabToastAnnounceExclude !== undefined) {
        const alt = node.dataset.gugbabToastAnnounceAlt;
        if (alt) texts.push(alt);
      } else {
        texts.push(...getAnnounceTextContent(node));
      }
    }
  }
  return texts;
}

function isHTMLElement(node: Node): node is HTMLElement {
  return node.nodeType === Node.ELEMENT_NODE;
}

function getTabbableCandidates(container: HTMLElement, reverse: boolean): HTMLElement[] {
  const nodes: HTMLElement[] = [];
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_ELEMENT, {
    acceptNode: (node) => {
      const el = node as HTMLElement;
      if (el.tagName === 'INPUT' && (el as HTMLInputElement).type === 'hidden')
        return NodeFilter.FILTER_SKIP;
      if (el.hidden) return NodeFilter.FILTER_SKIP;
      return el.tabIndex >= 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
    },
  });
  while (walker.nextNode()) nodes.push(walker.currentNode as HTMLElement);
  if (reverse) nodes.reverse();
  return nodes;
}

function focusFirst(candidates: HTMLElement[]): boolean {
  const prev = document.activeElement;
  return candidates.some((c) => {
    if (c === prev) return true;
    c.focus();
    return document.activeElement !== prev;
  });
}

/* -------------------------------------------------------------------------------------------------
 * Compound export
 * -----------------------------------------------------------------------------------------------*/

export const Toast = { Provider, Viewport, Root, Title, Description, Action, Close };
export type { SwipeDirection, SwipeEvent };
