import { useMergedRefs } from '@gugbab/hooks';
import React, {
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  createContext,
  forwardRef,
  type HTMLAttributes,
  type KeyboardEvent,
  useContext,
  useMemo,
} from 'react';
import { Separator, type SeparatorProps } from '../../primitives/Separator/Separator';
import { Slot } from '../../primitives/Slot/Slot';
import { type Direction, useDirection } from '../../shared/DirectionProvider';
import { RovingFocusGroup, useRovingFocusGroupItem } from '../../shared/RovingFocusGroup';
import {
  ToggleGroup,
  type ToggleGroupItemProps,
  type ToggleGroupRootProps,
} from '../../stateful/ToggleGroup';

type Orientation = 'horizontal' | 'vertical';

interface ToolbarContextValue {
  orientation: Orientation;
  dir: Direction;
}
const ToolbarContext = createContext<ToolbarContextValue | null>(null);
function useToolbarContext(consumer: string) {
  const ctx = useContext(ToolbarContext);
  if (!ctx) throw new Error(`${consumer} must be used inside <Toolbar.Root>`);
  return ctx;
}

export interface ToolbarRootProps extends HTMLAttributes<HTMLDivElement> {
  orientation?: Orientation;
  dir?: Direction;
  loop?: boolean;
  asChild?: boolean;
}

const Root = forwardRef<HTMLDivElement, ToolbarRootProps>(function ToolbarRoot(
  { orientation = 'horizontal', dir, loop = true, asChild, children, ...rest },
  ref,
) {
  const direction = useDirection(dir);
  const Comp = asChild ? Slot : 'div';
  const ctxValue = useMemo(() => ({ orientation, dir: direction }), [orientation, direction]);

  return (
    <ToolbarContext.Provider value={ctxValue}>
      <RovingFocusGroup asChild orientation={orientation} dir={direction} loop={loop}>
        <Comp
          ref={ref}
          role="toolbar"
          aria-orientation={orientation}
          dir={direction}
          data-orientation={orientation}
          {...rest}
        >
          {children}
        </Comp>
      </RovingFocusGroup>
    </ToolbarContext.Provider>
  );
});

export interface ToolbarSeparatorProps extends SeparatorProps {}

const ToolbarSeparator = forwardRef<HTMLDivElement, ToolbarSeparatorProps>(
  function ToolbarSeparator(props, ref) {
    const ctx = useToolbarContext('Toolbar.Separator');
    // Toolbar horizontal → separator vertical (perpendicular)
    return (
      <Separator
        ref={ref}
        orientation={ctx.orientation === 'horizontal' ? 'vertical' : 'horizontal'}
        {...props}
      />
    );
  },
);

export interface ToolbarButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

const ToolbarButton = forwardRef<HTMLButtonElement, ToolbarButtonProps>(function ToolbarButton(
  { asChild, type = 'button', onFocus, onMouseDown, onKeyDown, disabled, ...rest },
  forwardedRef,
) {
  const rovingProps = useRovingFocusGroupItem({ focusable: !disabled });
  const composedRef = useMergedRefs<HTMLButtonElement>(
    forwardedRef,
    rovingProps.ref as React.Ref<HTMLButtonElement>,
  );

  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      ref={composedRef}
      type={asChild ? undefined : type}
      disabled={disabled}
      tabIndex={rovingProps.tabIndex}
      onFocus={(e: React.FocusEvent<HTMLButtonElement>) => {
        onFocus?.(e);
        if (!e.defaultPrevented) rovingProps.onFocus(e);
      }}
      onMouseDown={(e: React.MouseEvent<HTMLButtonElement>) => {
        onMouseDown?.(e);
        if (!e.defaultPrevented) rovingProps.onMouseDown(e);
      }}
      onKeyDown={(e: React.KeyboardEvent<HTMLButtonElement>) => {
        onKeyDown?.(e);
        if (!e.defaultPrevented) rovingProps.onKeyDown(e);
      }}
      {...rest}
    />
  );
});

export interface ToolbarLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  asChild?: boolean;
}

const ToolbarLink = forwardRef<HTMLAnchorElement, ToolbarLinkProps>(function ToolbarLink(
  { asChild, onFocus, onMouseDown, onKeyDown, ...rest },
  forwardedRef,
) {
  const rovingProps = useRovingFocusGroupItem({ focusable: true });
  const composedRef = useMergedRefs<HTMLAnchorElement>(
    forwardedRef,
    rovingProps.ref as React.Ref<HTMLAnchorElement>,
  );

  const Comp = asChild ? Slot : 'a';

  const handleKeyDown = (e: KeyboardEvent<HTMLAnchorElement>) => {
    onKeyDown?.(e);
    // Space activates anchor (matching Radix behavior)
    if (!e.defaultPrevented && e.key === ' ') e.currentTarget.click();
    if (!e.defaultPrevented) rovingProps.onKeyDown(e);
  };

  return (
    <Comp
      ref={composedRef}
      tabIndex={rovingProps.tabIndex}
      onFocus={(e: React.FocusEvent<HTMLAnchorElement>) => {
        onFocus?.(e);
        if (!e.defaultPrevented) rovingProps.onFocus(e);
      }}
      onMouseDown={(e: React.MouseEvent<HTMLAnchorElement>) => {
        onMouseDown?.(e);
        if (!e.defaultPrevented) rovingProps.onMouseDown(e);
      }}
      onKeyDown={handleKeyDown}
      {...rest}
    />
  );
});

export type ToolbarToggleGroupProps = ToggleGroupRootProps;

const ToolbarToggleGroup = forwardRef<HTMLDivElement, ToolbarToggleGroupProps>(
  function ToolbarToggleGroup(props, ref) {
    const ctx = useToolbarContext('Toolbar.ToggleGroup');
    // ToolbarRoot owns the keyboard navigation via RovingFocusGroup; the group must defer.
    // ToggleGroupRootProps is a discriminated union on `type`. We branch on the
    // discriminator so TypeScript can narrow each leg and spread without `any`.
    if (props.type === 'single') {
      return (
        <ToggleGroup.Root
          ref={ref}
          rovingFocus={false}
          orientation={ctx.orientation}
          dir={ctx.dir}
          {...props}
        />
      );
    }
    return (
      <ToggleGroup.Root
        ref={ref}
        rovingFocus={false}
        orientation={ctx.orientation}
        dir={ctx.dir}
        {...props}
      />
    );
  },
);

export interface ToolbarToggleItemProps extends ToggleGroupItemProps {
  active?: boolean;
}

const ToolbarToggleItem = forwardRef<HTMLButtonElement, ToolbarToggleItemProps>(
  function ToolbarToggleItem({ active, onFocus, onMouseDown, onKeyDown, ...rest }, forwardedRef) {
    const rovingProps = useRovingFocusGroupItem({ focusable: true, active });
    const composedRef = useMergedRefs<HTMLButtonElement>(
      forwardedRef,
      rovingProps.ref as React.Ref<HTMLButtonElement>,
    );

    return (
      <ToggleGroup.Item
        ref={composedRef}
        tabIndex={rovingProps.tabIndex}
        onFocus={(e: React.FocusEvent<HTMLButtonElement>) => {
          onFocus?.(e);
          if (!e.defaultPrevented) rovingProps.onFocus(e);
        }}
        onMouseDown={(e: React.MouseEvent<HTMLButtonElement>) => {
          onMouseDown?.(e);
          if (!e.defaultPrevented) rovingProps.onMouseDown(e);
        }}
        onKeyDown={(e: React.KeyboardEvent<HTMLButtonElement>) => {
          onKeyDown?.(e);
          if (!e.defaultPrevented) rovingProps.onKeyDown(e);
        }}
        {...rest}
      />
    );
  },
);

export const Toolbar = {
  Root,
  Separator: ToolbarSeparator,
  Button: ToolbarButton,
  Link: ToolbarLink,
  ToggleGroup: ToolbarToggleGroup,
  ToggleItem: ToolbarToggleItem,
};
