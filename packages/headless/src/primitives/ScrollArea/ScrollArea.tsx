import { useIsomorphicLayoutEffect } from '@gugbab/hooks';
import {
  createContext,
  forwardRef,
  type HTMLAttributes,
  type PointerEvent,
  type UIEvent,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { type Direction, useDirection } from '../../shared/DirectionProvider';
import { Slot } from '../Slot/Slot';

/**
 * Headless ScrollArea — equivalent to Radix Scroll Area.
 *
 * Native scrollbars are hidden via the consumer's CSS (the Viewport applies
 * `overflow: scroll` and the consumer hides the native scrollbars). The
 * `Scrollbar` and `Thumb` parts compute their size and position from the
 * Viewport's scroll metrics.
 *
 * Composition:
 *   <ScrollArea.Root>
 *     <ScrollArea.Viewport>{...content...}</ScrollArea.Viewport>
 *     <ScrollArea.Scrollbar orientation="vertical">
 *       <ScrollArea.Thumb />
 *     </ScrollArea.Scrollbar>
 *     <ScrollArea.Scrollbar orientation="horizontal">
 *       <ScrollArea.Thumb />
 *     </ScrollArea.Scrollbar>
 *     <ScrollArea.Corner />
 *   </ScrollArea.Root>
 */

type Orientation = 'vertical' | 'horizontal';
type ScrollbarVisibility = 'auto' | 'always' | 'scroll' | 'hover';

interface Metrics {
  scrollTop: number;
  scrollLeft: number;
  scrollHeight: number;
  scrollWidth: number;
  clientHeight: number;
  clientWidth: number;
}

interface ScrollAreaContextValue {
  type: ScrollbarVisibility;
  scrollHideDelay: number;
  dir: Direction;
  viewport: HTMLDivElement | null;
  setViewport: (node: HTMLDivElement | null) => void;
  metrics: Metrics;
  /** Re-read scroll metrics from the viewport. */
  recompute: () => void;
  /** Track which scrollbars are currently registered. */
  registerScrollbar: (orientation: Orientation) => () => void;
  hasScrollbar: { vertical: boolean; horizontal: boolean };
  /** Hover/scrolling state for `type="hover"|"scroll"`. */
  isVisible: boolean;
  setHovering: (hovering: boolean) => void;
  setScrolling: (scrolling: boolean) => void;
}

const ScrollAreaContext = createContext<ScrollAreaContextValue | null>(null);
function useCtx(consumer: string) {
  const ctx = useContext(ScrollAreaContext);
  if (!ctx) throw new Error(`${consumer} must be used inside <ScrollArea.Root>`);
  return ctx;
}

const INITIAL_METRICS: Metrics = {
  scrollTop: 0,
  scrollLeft: 0,
  scrollHeight: 0,
  scrollWidth: 0,
  clientHeight: 0,
  clientWidth: 0,
};

export interface ScrollAreaRootProps extends HTMLAttributes<HTMLDivElement> {
  /** auto: visible only when content overflows; always: always visible; scroll: visible during scroll; hover: visible on hover. */
  type?: ScrollbarVisibility;
  /** Delay before hiding scrollbars when type is "scroll" or "hover". */
  scrollHideDelay?: number;
  dir?: Direction;
  asChild?: boolean;
}

const Root = forwardRef<HTMLDivElement, ScrollAreaRootProps>(function ScrollAreaRoot(
  { type = 'hover', scrollHideDelay = 600, dir, asChild, onPointerEnter, onPointerLeave, ...rest },
  ref,
) {
  const direction = useDirection(dir);
  const [viewport, setViewport] = useState<HTMLDivElement | null>(null);
  const [metrics, setMetrics] = useState<Metrics>(INITIAL_METRICS);
  const [hasScrollbarVertical, setHasScrollbarVertical] = useState(false);
  const [hasScrollbarHorizontal, setHasScrollbarHorizontal] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [scrolling, setScrolling] = useState(false);

  const recompute = useCallback(() => {
    if (!viewport) return;
    setMetrics({
      scrollTop: viewport.scrollTop,
      scrollLeft: viewport.scrollLeft,
      scrollHeight: viewport.scrollHeight,
      scrollWidth: viewport.scrollWidth,
      clientHeight: viewport.clientHeight,
      clientWidth: viewport.clientWidth,
    });
  }, [viewport]);

  // initial + ResizeObserver
  useIsomorphicLayoutEffect(() => {
    if (!viewport) return;
    recompute();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => recompute());
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [viewport, recompute]);

  const registerScrollbar = useCallback((orientation: Orientation) => {
    if (orientation === 'vertical') setHasScrollbarVertical(true);
    else setHasScrollbarHorizontal(true);
    return () => {
      if (orientation === 'vertical') setHasScrollbarVertical(false);
      else setHasScrollbarHorizontal(false);
    };
  }, []);

  const isVisible =
    type === 'always' ||
    type === 'auto' ||
    (type === 'hover' && hovering) ||
    (type === 'scroll' && scrolling);

  const Comp = asChild ? Slot : 'div';
  return (
    <ScrollAreaContext.Provider
      value={{
        type,
        scrollHideDelay,
        dir: direction,
        viewport,
        setViewport,
        metrics,
        recompute,
        registerScrollbar,
        hasScrollbar: { vertical: hasScrollbarVertical, horizontal: hasScrollbarHorizontal },
        isVisible,
        setHovering,
        setScrolling,
      }}
    >
      <Comp
        ref={ref}
        dir={direction}
        data-orientation="both"
        onPointerEnter={(e: PointerEvent<HTMLDivElement>) => {
          onPointerEnter?.(e);
          if (type === 'hover' || type === 'scroll') setHovering(true);
        }}
        onPointerLeave={(e: PointerEvent<HTMLDivElement>) => {
          onPointerLeave?.(e);
          if (type === 'hover' || type === 'scroll') setHovering(false);
        }}
        style={{ position: 'relative', ...rest.style }}
        {...rest}
      />
    </ScrollAreaContext.Provider>
  );
});

export interface ScrollAreaViewportProps extends HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

const Viewport = forwardRef<HTMLDivElement, ScrollAreaViewportProps>(function ScrollAreaViewport(
  { asChild, onScroll, style, ...rest },
  ref,
) {
  const ctx = useCtx('ScrollArea.Viewport');
  const Comp = asChild ? Slot : 'div';
  const scrollTimerRef = useRef<number | null>(null);

  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    onScroll?.(e);
    ctx.recompute();
    if (ctx.type === 'scroll') {
      ctx.setScrolling(true);
      if (scrollTimerRef.current) window.clearTimeout(scrollTimerRef.current);
      scrollTimerRef.current = window.setTimeout(
        () => ctx.setScrolling(false),
        ctx.scrollHideDelay,
      );
    }
  };

  useEffect(() => {
    return () => {
      if (scrollTimerRef.current) window.clearTimeout(scrollTimerRef.current);
    };
  }, []);

  return (
    <Comp
      ref={(node: HTMLDivElement | null) => {
        ctx.setViewport(node);
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      }}
      data-scroll-area-viewport=""
      style={{ overflow: 'scroll', ...style }}
      onScroll={handleScroll}
      {...rest}
    />
  );
});

interface ScrollbarContextValue {
  orientation: Orientation;
  thumbSize: number;
  thumbPosition: number;
  trackSize: number;
  scrollFromPointer: (clientPx: number, trackOffset: number) => void;
}
const ScrollbarContext = createContext<ScrollbarContextValue | null>(null);
function useScrollbarCtx(consumer: string) {
  const ctx = useContext(ScrollbarContext);
  if (!ctx) throw new Error(`${consumer} must be used inside <ScrollArea.Scrollbar>`);
  return ctx;
}

export interface ScrollAreaScrollbarProps extends HTMLAttributes<HTMLDivElement> {
  orientation?: Orientation;
  /** Override Root's `type` for this scrollbar. */
  forceMount?: boolean;
  asChild?: boolean;
}

const Scrollbar = forwardRef<HTMLDivElement, ScrollAreaScrollbarProps>(function ScrollAreaScrollbar(
  { orientation = 'vertical', forceMount, asChild, style, ...rest },
  ref,
) {
  const ctx = useCtx('ScrollArea.Scrollbar');
  const Comp = asChild ? Slot : 'div';

  // register so Root knows both axes are mounted (for Corner)
  useEffect(() => {
    return ctx.registerScrollbar(orientation);
  }, [ctx, orientation]);

  // axis metrics
  const { scrollTop, scrollLeft, scrollHeight, scrollWidth, clientHeight, clientWidth } =
    ctx.metrics;
  const isVertical = orientation === 'vertical';
  const scrollSize = isVertical ? scrollHeight : scrollWidth;
  const clientSize = isVertical ? clientHeight : clientWidth;
  const scrollOffset = isVertical ? scrollTop : scrollLeft;
  const overflow = scrollSize > clientSize;

  // thumb size: clientSize / scrollSize ratio (min 16px)
  const trackSize = clientSize;
  const thumbSize = overflow ? Math.max(16, (clientSize / scrollSize) * trackSize) : 0;
  const maxThumbPosition = trackSize - thumbSize;
  const maxScroll = scrollSize - clientSize;
  const thumbPosition = maxScroll > 0 ? (scrollOffset / maxScroll) * maxThumbPosition : 0;

  // determine visibility
  const visibleByType =
    ctx.type === 'always' ||
    forceMount ||
    (ctx.type === 'auto' && overflow) ||
    ((ctx.type === 'hover' || ctx.type === 'scroll') && ctx.isVisible && overflow);

  const scrollFromPointer = (clientPx: number, trackOffset: number) => {
    const node = ctx.viewport;
    if (!node) return;
    const localPx = clientPx - trackOffset;
    const ratio = Math.max(0, Math.min(1, (localPx - thumbSize / 2) / maxThumbPosition));
    const target = ratio * maxScroll;
    if (isVertical) node.scrollTop = target;
    else node.scrollLeft = target;
  };

  if (!visibleByType) return null;

  return (
    <ScrollbarContext.Provider
      value={{ orientation, thumbSize, thumbPosition, trackSize, scrollFromPointer }}
    >
      <Comp
        ref={ref}
        role="scrollbar"
        aria-orientation={orientation}
        data-orientation={orientation}
        data-state={overflow ? 'visible' : 'hidden'}
        style={{
          position: 'absolute',
          ...(isVertical
            ? { top: 0, [ctx.dir === 'rtl' ? 'left' : 'right']: 0, height: '100%' }
            : { bottom: 0, left: 0, width: '100%' }),
          ...style,
        }}
        {...rest}
      />
    </ScrollbarContext.Provider>
  );
});

export interface ScrollAreaThumbProps extends HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

const Thumb = forwardRef<HTMLDivElement, ScrollAreaThumbProps>(function ScrollAreaThumb(
  { asChild, style, onPointerDown, ...rest },
  ref,
) {
  const ctx = useCtx('ScrollArea.Thumb');
  const sb = useScrollbarCtx('ScrollArea.Thumb');
  const Comp = asChild ? Slot : 'div';
  const dragRef = useRef<{ startPointer: number; startScroll: number } | null>(null);

  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    onPointerDown?.(e);
    if (e.defaultPrevented) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    const startPointer = sb.orientation === 'vertical' ? e.clientY : e.clientX;
    const startScroll =
      sb.orientation === 'vertical'
        ? (ctx.viewport?.scrollTop ?? 0)
        : (ctx.viewport?.scrollLeft ?? 0);
    dragRef.current = { startPointer, startScroll };
  };

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current || !ctx.viewport) return;
    const current = sb.orientation === 'vertical' ? e.clientY : e.clientX;
    const delta = current - dragRef.current.startPointer;
    const trackPx = sb.trackSize - sb.thumbSize;
    const isVertical = sb.orientation === 'vertical';
    const maxScroll = isVertical
      ? ctx.metrics.scrollHeight - ctx.metrics.clientHeight
      : ctx.metrics.scrollWidth - ctx.metrics.clientWidth;
    const scrollDelta = trackPx > 0 ? (delta / trackPx) * maxScroll : 0;
    const target = Math.max(0, Math.min(maxScroll, dragRef.current.startScroll + scrollDelta));
    if (isVertical) ctx.viewport.scrollTop = target;
    else ctx.viewport.scrollLeft = target;
  };

  const handlePointerUp = (e: PointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    dragRef.current = null;
  };

  const isVertical = sb.orientation === 'vertical';
  return (
    <Comp
      ref={ref}
      data-state={sb.thumbSize > 0 ? 'visible' : 'hidden'}
      data-orientation={sb.orientation}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{
        ...(isVertical
          ? { height: `${sb.thumbSize}px`, transform: `translateY(${sb.thumbPosition}px)` }
          : { width: `${sb.thumbSize}px`, transform: `translateX(${sb.thumbPosition}px)` }),
        ...style,
      }}
      {...rest}
    />
  );
});

export interface ScrollAreaCornerProps extends HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

const Corner = forwardRef<HTMLDivElement, ScrollAreaCornerProps>(function ScrollAreaCorner(
  { asChild, style, ...rest },
  ref,
) {
  const ctx = useCtx('ScrollArea.Corner');
  const Comp = asChild ? Slot : 'div';
  if (!(ctx.hasScrollbar.vertical && ctx.hasScrollbar.horizontal)) return null;
  return (
    <Comp
      ref={ref}
      data-scroll-area-corner=""
      style={{
        position: 'absolute',
        bottom: 0,
        [ctx.dir === 'rtl' ? 'left' : 'right']: 0,
        ...style,
      }}
      {...rest}
    />
  );
});

export const ScrollArea = {
  Root,
  Viewport,
  Scrollbar,
  Thumb,
  Corner,
};
