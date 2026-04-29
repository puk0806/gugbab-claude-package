/**
 * Abstract design token shape — concrete themes (`muiTheme`, `radixTheme`)
 * are static snapshots that satisfy this contract. No external library
 * runtime is involved.
 *
 * The token names below correspond 1:1 to the CSS custom properties we
 * publish (e.g. `color.bg.app` → `--gugbab-color-bg-app`). Both styled-mui
 * and styled-radix consume the same variables, so a single component can
 * render in either visual system by swapping the imported `.css` file.
 */
export interface DesignTokens {
  color: ColorTokens;
  space: SpaceTokens;
  radius: RadiusTokens;
  font: FontTokens;
  shadow: ShadowTokens;
  zIndex: ZIndexTokens;
  breakpoint: BreakpointTokens;
  motion: MotionTokens;
}

/* -------------------------------------------------------------------------- */
/* Color                                                                       */
/* -------------------------------------------------------------------------- */

export interface ColorTokens {
  /** Surfaces */
  bg: {
    app: string;
    surface: string;
    elevated: string;
    inset: string;
  };
  /** Text colors */
  fg: {
    primary: string;
    secondary: string;
    muted: string;
    disabled: string;
    onAccent: string;
  };
  /** Brand accent (interactive primary) */
  accent: {
    base: string;
    hover: string;
    active: string;
    subtle: string;
    fg: string;
  };
  /** Optional secondary brand */
  accent2?: {
    base: string;
    hover: string;
    active: string;
    subtle: string;
    fg: string;
  };
  /** Status semantics */
  success: { base: string; fg: string; subtle: string };
  warning: { base: string; fg: string; subtle: string };
  danger: { base: string; fg: string; subtle: string };
  info: { base: string; fg: string; subtle: string };
  /** Borders */
  border: {
    subtle: string;
    base: string;
    strong: string;
    focus: string;
  };
  /** Overlay (modal scrim) */
  overlay: string;
}

/* -------------------------------------------------------------------------- */
/* Space                                                                       */
/* -------------------------------------------------------------------------- */

export interface SpaceTokens {
  0: string;
  1: string;
  2: string;
  3: string;
  4: string;
  5: string;
  6: string;
  8: string;
  10: string;
  12: string;
  16: string;
  20: string;
  24: string;
}

/* -------------------------------------------------------------------------- */
/* Radius                                                                      */
/* -------------------------------------------------------------------------- */

export interface RadiusTokens {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  full: string;
}

/* -------------------------------------------------------------------------- */
/* Font                                                                        */
/* -------------------------------------------------------------------------- */

export interface FontTokens {
  family: {
    sans: string;
    mono: string;
  };
  size: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
  };
  weight: {
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
  };
  lineHeight: {
    tight: number;
    normal: number;
    relaxed: number;
  };
}

/* -------------------------------------------------------------------------- */
/* Shadow                                                                      */
/* -------------------------------------------------------------------------- */

export interface ShadowTokens {
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

/* -------------------------------------------------------------------------- */
/* Z-index                                                                     */
/* -------------------------------------------------------------------------- */

export interface ZIndexTokens {
  dropdown: number;
  overlay: number;
  modal: number;
  popover: number;
  tooltip: number;
  toast: number;
}

/* -------------------------------------------------------------------------- */
/* Breakpoint                                                                  */
/* -------------------------------------------------------------------------- */

export interface BreakpointTokens {
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
}

/* -------------------------------------------------------------------------- */
/* Motion                                                                      */
/* -------------------------------------------------------------------------- */

export interface MotionTokens {
  duration: {
    fast: string;
    normal: string;
    slow: string;
  };
  easing: {
    default: string;
    in: string;
    out: string;
    inOut: string;
  };
}

/* -------------------------------------------------------------------------- */
/* Theme (light + dark of the same shape)                                      */
/* -------------------------------------------------------------------------- */

export interface ThemeTokens {
  light: DesignTokens;
  dark: DesignTokens;
}
