import { createContext, type ReactNode, useContext } from 'react';

export type Direction = 'ltr' | 'rtl';

const DirectionContext = createContext<Direction>('ltr');

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
  return localDir ?? ctx;
}
