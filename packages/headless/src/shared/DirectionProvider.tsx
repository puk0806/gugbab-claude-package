import { createContext, type ReactNode, useContext } from 'react';

export type Direction = 'ltr' | 'rtl';

// undefined = no provider; resolved to 'ltr' by useDirection.
const DirectionContext = createContext<Direction | undefined>(undefined);

export interface DirectionProviderProps {
  dir: Direction;
  children: ReactNode;
}

export function DirectionProvider({ dir, children }: DirectionProviderProps) {
  return <DirectionContext.Provider value={dir}>{children}</DirectionContext.Provider>;
}

/**
 * Resolves the effective text direction. Pass an explicit local `dir` to
 * override the nearest DirectionProvider (matches Radix behavior).
 */
export function useDirection(localDir?: Direction): Direction {
  const ctx = useContext(DirectionContext);
  return localDir ?? ctx ?? 'ltr';
}

/**
 * The direction only if set explicitly (prop or provider) — for rendering a
 * `dir` attribute without overriding an inherited `<html dir="rtl">`. Internal.
 */
export function useExplicitDirection(localDir?: Direction): Direction | undefined {
  const ctx = useContext(DirectionContext);
  return localDir ?? ctx;
}
