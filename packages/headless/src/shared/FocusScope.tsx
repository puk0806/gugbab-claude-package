import { useLatestRef, useMergedRefs } from '@gugbab/hooks';
import {
  forwardRef,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
  type Ref,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Slot } from '../primitives/Slot';

const AUTOFOCUS_ON_MOUNT = 'focusScope.autoFocusOnMount';
const AUTOFOCUS_ON_UNMOUNT = 'focusScope.autoFocusOnUnmount';
const EVENT_OPTIONS = { bubbles: false, cancelable: true } as const;

export interface FocusScopeProps extends HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
  /** When at the last/first tabbable, Tab/Shift+Tab wraps to the other end. */
  loop?: boolean;
  /** When true, focus cannot escape via keyboard, pointer, or programmatic focus. */
  trapped?: boolean;
  /** Cancellable. Called when the scope auto-focuses on mount. */
  onMountAutoFocus?: (event: Event) => void;
  /** Cancellable. Called when the scope releases focus on unmount. */
  onUnmountAutoFocus?: (event: Event) => void;
  children?: ReactNode;
}

interface FocusScopeAPI {
  paused: boolean;
  pause: () => void;
  resume: () => void;
}

const focusScopesStack = createFocusScopesStack();

export const FocusScope = forwardRef<HTMLDivElement, FocusScopeProps>(
  function FocusScope(props, forwardedRef) {
    const {
      asChild,
      loop = false,
      trapped = false,
      onMountAutoFocus,
      onUnmountAutoFocus,
      onKeyDown,
      children,
      ...scopeProps
    } = props;

    const [container, setContainer] = useState<HTMLDivElement | null>(null);
    const composedRef = useMergedRefs<HTMLDivElement>(
      forwardedRef as Ref<HTMLDivElement>,
      setContainer,
    );

    const onMountAutoFocusRef = useLatestRef(onMountAutoFocus);
    const onUnmountAutoFocusRef = useLatestRef(onUnmountAutoFocus);
    const lastFocusedRef = useRef<HTMLElement | null>(null);

    const focusScope = useRef<FocusScopeAPI>({
      paused: false,
      pause() {
        this.paused = true;
      },
      resume() {
        this.paused = false;
      },
    }).current;

    // Trapping — focusin / focusout listeners on document.
    useEffect(() => {
      if (!trapped || !container) return;

      function handleFocusIn(event: FocusEvent) {
        if (focusScope.paused) return;
        const target = event.target as HTMLElement | null;
        if (container && target && container.contains(target)) {
          lastFocusedRef.current = target;
        } else {
          focusElement(lastFocusedRef.current, { select: true });
        }
      }

      function handleFocusOut(event: FocusEvent) {
        if (focusScope.paused) return;
        const relatedTarget = event.relatedTarget as HTMLElement | null;
        if (relatedTarget === null) return;
        if (container && !container.contains(relatedTarget)) {
          focusElement(lastFocusedRef.current, { select: true });
        }
      }

      function handleMutations(mutations: MutationRecord[]) {
        const focused = document.activeElement as HTMLElement | null;
        if (focused !== document.body) return;
        for (const mutation of mutations) {
          if (mutation.removedNodes.length > 0) focusElement(container);
        }
      }

      document.addEventListener('focusin', handleFocusIn);
      document.addEventListener('focusout', handleFocusOut);
      const observer = new MutationObserver(handleMutations);
      observer.observe(container, { childList: true, subtree: true });

      return () => {
        document.removeEventListener('focusin', handleFocusIn);
        document.removeEventListener('focusout', handleFocusOut);
        observer.disconnect();
      };
    }, [trapped, container, focusScope]);

    // Auto-focus on mount + restore on unmount.
    useEffect(() => {
      if (!container) return;

      focusScopesStack.add(focusScope);
      const previouslyFocused = document.activeElement as HTMLElement | null;
      const hasFocusInside = container.contains(previouslyFocused);

      if (!hasFocusInside) {
        const mountEvent = new CustomEvent(AUTOFOCUS_ON_MOUNT, EVENT_OPTIONS);
        const handler = (event: Event) => onMountAutoFocusRef.current?.(event);
        container.addEventListener(AUTOFOCUS_ON_MOUNT, handler);
        container.dispatchEvent(mountEvent);
        container.removeEventListener(AUTOFOCUS_ON_MOUNT, handler);
        if (!mountEvent.defaultPrevented) {
          const candidates = removeLinks(getTabbableCandidates(container));
          focusFirst(candidates, { select: true });
          if (document.activeElement === previouslyFocused) {
            focusElement(container);
          }
        }
      }

      return () => {
        // Defer unmount focus restore — React mid-unmount focus sometimes fights
        // the browser. setTimeout(0) avoids the race.
        const node = container;
        window.setTimeout(() => {
          const unmountEvent = new CustomEvent(AUTOFOCUS_ON_UNMOUNT, EVENT_OPTIONS);
          const handler = (event: Event) => onUnmountAutoFocusRef.current?.(event);
          node.addEventListener(AUTOFOCUS_ON_UNMOUNT, handler);
          node.dispatchEvent(unmountEvent);
          node.removeEventListener(AUTOFOCUS_ON_UNMOUNT, handler);
          if (!unmountEvent.defaultPrevented) {
            focusElement(previouslyFocused ?? document.body, { select: true });
          }
          focusScopesStack.remove(focusScope);
        }, 0);
      };
    }, [container, focusScope, onMountAutoFocusRef, onUnmountAutoFocusRef]);

    const handleKeyDown = useCallback(
      (event: ReactKeyboardEvent<HTMLDivElement>) => {
        onKeyDown?.(event);
        if (event.defaultPrevented) return;
        if (!loop && !trapped) return;
        if (focusScope.paused) return;

        const isTab = event.key === 'Tab' && !event.altKey && !event.ctrlKey && !event.metaKey;
        const focused = document.activeElement as HTMLElement | null;
        if (!isTab || !focused) return;

        const containerEl = event.currentTarget as HTMLElement;
        const [first, last] = getTabbableEdges(containerEl);
        if (!first || !last) {
          if (focused === containerEl) event.preventDefault();
          return;
        }

        if (!event.shiftKey && focused === last) {
          event.preventDefault();
          if (loop) focusElement(first, { select: true });
        } else if (event.shiftKey && focused === first) {
          event.preventDefault();
          if (loop) focusElement(last, { select: true });
        }
      },
      [loop, trapped, focusScope, onKeyDown],
    );

    const Comp: React.ElementType = asChild ? Slot : 'div';

    return (
      <Comp tabIndex={-1} {...scopeProps} ref={composedRef} onKeyDown={handleKeyDown}>
        {children}
      </Comp>
    );
  },
);

/* -------------------------------------------------------------------------- */
/* utils                                                                       */
/* -------------------------------------------------------------------------- */

function focusFirst(candidates: HTMLElement[], { select = false } = {}) {
  const previously = document.activeElement;
  for (const candidate of candidates) {
    focusElement(candidate, { select });
    if (document.activeElement !== previously) return;
  }
}

function getTabbableEdges(
  container: HTMLElement,
): readonly [HTMLElement | undefined, HTMLElement | undefined] {
  const candidates = getTabbableCandidates(container);
  const first = findVisible(candidates, container);
  const last = findVisible([...candidates].reverse(), container);
  return [first, last] as const;
}

function getTabbableCandidates(container: HTMLElement): HTMLElement[] {
  const nodes: HTMLElement[] = [];
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_ELEMENT, {
    acceptNode: (node) => {
      const el = node as HTMLElement & { disabled?: boolean; type?: string };
      const isHiddenInput = el.tagName === 'INPUT' && el.type === 'hidden';
      if (el.disabled || el.hidden || isHiddenInput) return NodeFilter.FILTER_SKIP;
      return el.tabIndex >= 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
    },
  });
  while (walker.nextNode()) nodes.push(walker.currentNode as HTMLElement);
  return nodes;
}

function findVisible(elements: HTMLElement[], container: HTMLElement): HTMLElement | undefined {
  for (const element of elements) {
    if (!isHidden(element, { upTo: container })) return element;
  }
  return undefined;
}

function isHidden(node: HTMLElement, { upTo }: { upTo?: HTMLElement }): boolean {
  if (getComputedStyle(node).visibility === 'hidden') return true;
  let current: HTMLElement | null = node;
  while (current) {
    if (upTo && current === upTo) return false;
    if (getComputedStyle(current).display === 'none') return true;
    current = current.parentElement;
  }
  return false;
}

function isSelectableInput(element: unknown): element is HTMLInputElement {
  return element instanceof HTMLInputElement && 'select' in element;
}

function focusElement(element?: HTMLElement | null, { select = false } = {}) {
  if (element && typeof element.focus === 'function') {
    const previously = document.activeElement;
    element.focus({ preventScroll: true });
    if (element !== previously && isSelectableInput(element) && select) {
      element.select();
    }
  }
}

function removeLinks(items: HTMLElement[]): HTMLElement[] {
  return items.filter((item) => item.tagName !== 'A');
}

/* -------------------------------------------------------------------------- */
/* focus scope stack                                                           */
/* -------------------------------------------------------------------------- */

function createFocusScopesStack() {
  let stack: FocusScopeAPI[] = [];
  return {
    add(scope: FocusScopeAPI) {
      const active = stack[0];
      if (scope !== active) active?.pause();
      stack = stack.filter((s) => s !== scope);
      stack.unshift(scope);
    },
    remove(scope: FocusScopeAPI) {
      stack = stack.filter((s) => s !== scope);
      stack[0]?.resume();
    },
  };
}
