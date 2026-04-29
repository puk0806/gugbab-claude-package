import {
  autoUpdate,
  flip,
  type Middleware,
  offset,
  type Placement,
  type Strategy,
  shift,
  type UseFloatingReturn,
  useFloating,
} from '@floating-ui/react';

export interface FloatingOptions {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  placement?: Placement;
  strategy?: Strategy;
  offset?: number;
  extraMiddleware?: Middleware[];
}

/**
 * Shared default floating setup — `offset(4) + flip() + shift()` with
 * `autoUpdate`. Used by Popover, Tooltip, HoverCard, DropdownMenu, etc.
 */
export function useFloatingBase(options: FloatingOptions): UseFloatingReturn {
  const {
    open,
    onOpenChange,
    placement = 'bottom',
    strategy = 'absolute',
    offset: offsetValue = 4,
    extraMiddleware = [],
  } = options;

  return useFloating({
    open,
    onOpenChange,
    placement,
    strategy,
    middleware: [offset(offsetValue), flip(), shift({ padding: 8 }), ...extraMiddleware],
    whileElementsMounted: autoUpdate,
  });
}
