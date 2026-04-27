import {
  type ButtonHTMLAttributes,
  createContext,
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

export interface ToastItem {
  id: string;
  title?: ReactNode;
  description?: ReactNode;
  duration?: number;
  type?: 'foreground' | 'background';
}

type SwipeDirection = 'right' | 'left' | 'up' | 'down';

interface ToastProviderContextValue {
  toasts: ToastItem[];
  add: (toast: Omit<ToastItem, 'id'> & { id?: string }) => string;
  dismiss: (id: string) => void;
  duration: number;
  swipeDirection: SwipeDirection;
  swipeThreshold: number;
}

const ProviderCtx = createContext<ToastProviderContextValue | null>(null);

function useProvider(consumer: string) {
  const ctx = useContext(ProviderCtx);
  if (!ctx) throw new Error(`${consumer} must be used inside <Toast.Provider>`);
  return ctx;
}

export interface ToastProviderProps {
  duration?: number;
  swipeDirection?: SwipeDirection;
  /** Pixel distance beyond which the swipe triggers a dismiss. Default 50. */
  swipeThreshold?: number;
  children: ReactNode;
}

function Provider({
  duration = 5000,
  swipeDirection = 'right',
  swipeThreshold = 50,
  children,
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const counter = useRef(0);

  const add: ToastProviderContextValue['add'] = useCallback((toast) => {
    const id = toast.id ?? `toast-${counter.current++}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
    return id;
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ProviderCtx.Provider
      value={{ toasts, add, dismiss, duration, swipeDirection, swipeThreshold }}
    >
      {children}
    </ProviderCtx.Provider>
  );
}

const Viewport = forwardRef<HTMLOListElement, HTMLAttributes<HTMLOListElement>>(
  function ToastViewport({ children, ...rest }, ref) {
    const ctx = useProvider('Toast.Viewport');
    return (
      <ol ref={ref} tabIndex={-1} aria-label="Notifications" {...rest}>
        {ctx.toasts.map((t) => (
          <Root key={t.id} toast={t}>
            {t.title ? <Title>{t.title}</Title> : null}
            {t.description ? <Description>{t.description}</Description> : null}
          </Root>
        ))}
        {children}
      </ol>
    );
  },
);

interface ToastItemContextValue {
  toast: ToastItem;
}
const ItemCtx = createContext<ToastItemContextValue | null>(null);
function useItem(n: string) {
  const ctx = useContext(ItemCtx);
  if (!ctx) throw new Error(`${n} must be used inside <Toast.Root>`);
  return ctx;
}

export interface ToastRootProps extends HTMLAttributes<HTMLLIElement> {
  toast: ToastItem;
  children?: ReactNode;
}

const Root = forwardRef<HTMLLIElement, ToastRootProps>(function ToastRoot(
  {
    toast,
    children,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerEnter,
    onPointerLeave,
    ...rest
  },
  ref,
) {
  const provider = useProvider('Toast.Root');
  const duration = toast.duration ?? provider.duration;

  // Timer — pauseable via hover
  const [paused, setPaused] = useState(false);
  const remainingRef = useRef<number>(duration);
  const startedAtRef = useRef<number>(Date.now());

  useEffect(() => {
    if (duration === Number.POSITIVE_INFINITY) return;
    if (paused) return;
    const elapsedBefore = duration - remainingRef.current;
    startedAtRef.current = Date.now() - elapsedBefore * 0;
    const timer = setTimeout(() => {
      provider.dismiss(toast.id);
    }, remainingRef.current);
    startedAtRef.current = Date.now();
    return () => {
      clearTimeout(timer);
      const elapsed = Date.now() - startedAtRef.current;
      remainingRef.current = Math.max(0, remainingRef.current - elapsed);
    };
  }, [paused, duration, provider, toast.id]);

  // Swipe tracking
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const [dragDelta, setDragDelta] = useState<{ x: number; y: number } | null>(null);

  const handlePointerDown = (e: ReactPointerEvent<HTMLLIElement>) => {
    onPointerDown?.(e);
    if (e.defaultPrevented) return;
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const handlePointerMove = (e: ReactPointerEvent<HTMLLIElement>) => {
    onPointerMove?.(e);
    if (!dragStartRef.current) return;
    setDragDelta({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    });
  };
  const handlePointerUp = (e: ReactPointerEvent<HTMLLIElement>) => {
    onPointerUp?.(e);
    if (!dragStartRef.current || !dragDelta) {
      dragStartRef.current = null;
      setDragDelta(null);
      return;
    }
    const { x, y } = dragDelta;
    const dir = provider.swipeDirection;
    const axis = dir === 'left' || dir === 'right' ? x : y;
    const signed = dir === 'left' || dir === 'up' ? -axis : axis;

    if (signed >= provider.swipeThreshold) {
      provider.dismiss(toast.id);
    }
    dragStartRef.current = null;
    setDragDelta(null);
  };

  const handlePointerEnter = (e: ReactPointerEvent<HTMLLIElement>) => {
    onPointerEnter?.(e);
    setPaused(true);
  };
  const handlePointerLeave = (e: ReactPointerEvent<HTMLLIElement>) => {
    onPointerLeave?.(e);
    setPaused(false);
  };

  const swipe = dragDelta ? { x: dragDelta.x, y: dragDelta.y } : null;

  return (
    <ItemCtx.Provider value={{ toast }}>
      <li
        ref={ref}
        role="status"
        aria-live={toast.type === 'foreground' ? 'assertive' : 'polite'}
        aria-atomic="true"
        data-type={toast.type ?? 'background'}
        data-state="open"
        data-swipe={dragDelta ? 'move' : undefined}
        data-paused={paused ? '' : undefined}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        style={{
          ...(swipe
            ? { transform: `translate(${swipe.x}px, ${swipe.y}px)`, touchAction: 'none' }
            : null),
          ...rest.style,
        }}
        {...rest}
      >
        {children}
      </li>
    </ItemCtx.Provider>
  );
});

const Title = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function ToastTitle(props, ref) {
    return <div ref={ref} {...props} />;
  },
);

const Description = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function ToastDescription(props, ref) {
    return <div ref={ref} {...props} />;
  },
);

const Action = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(
  function ToastAction({ onClick, type = 'button', ...rest }, ref) {
    const provider = useProvider('Toast.Action');
    const item = useItem('Toast.Action');
    return (
      <button
        ref={ref}
        type={type}
        onClick={(e) => {
          onClick?.(e);
          if (!e.defaultPrevented) provider.dismiss(item.toast.id);
        }}
        {...rest}
      />
    );
  },
);

const Close = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(
  function ToastClose({ onClick, type = 'button', ...rest }, ref) {
    const provider = useProvider('Toast.Close');
    const item = useItem('Toast.Close');
    return (
      <button
        ref={ref}
        type={type}
        aria-label="Close"
        onClick={(e) => {
          onClick?.(e);
          if (!e.defaultPrevented) provider.dismiss(item.toast.id);
        }}
        {...rest}
      />
    );
  },
);

/**
 * Imperative toast API.
 * ```tsx
 * const { toast } = useToast();
 * toast({ title: 'Saved' });
 * ```
 */
export function useToast() {
  const ctx = useProvider('useToast');
  return {
    toast: ctx.add,
    dismiss: ctx.dismiss,
    toasts: ctx.toasts,
  };
}

export const Toast = { Provider, Viewport, Root, Title, Description, Action, Close };
