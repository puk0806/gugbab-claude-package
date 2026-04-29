/**
 * @gugbab-ui/tokens — MUI lookalike theme.
 *
 * Static token snapshot derived from MUI v6 default theme (Roboto + indigo
 * primary, Material Design 3 inspired palette). Values are baked in here so
 * this package has no runtime *or* devDep on `@mui/material` — our design
 * system is independent of upstream MUI changes.
 *
 * If MUI ever ships a palette refresh worth adopting, regenerate this file
 * manually and bump the tokens package.
 */
import type { ThemeTokens } from '../core/types';

export const muiTheme: ThemeTokens = {
  light: {
    color: {
      bg: {
        app: '#fff',
        surface: '#fff',
        elevated: '#fff',
        inset: 'rgba(0, 0, 0, 0.04)',
      },
      fg: {
        primary: 'rgba(0, 0, 0, 0.87)',
        secondary: 'rgba(0, 0, 0, 0.6)',
        muted: 'rgba(0, 0, 0, 0.38)',
        disabled: 'rgba(0, 0, 0, 0.26)',
        onAccent: '#fff',
      },
      accent: {
        base: '#1976d2',
        hover: 'rgb(22, 106, 189)',
        active: 'rgb(20, 94, 168)',
        subtle: 'rgba(25, 118, 210, 0.08)',
        fg: '#fff',
      },
      accent2: {
        base: '#9c27b0',
        hover: 'rgb(140, 35, 158)',
        active: 'rgb(124, 31, 140)',
        subtle: 'rgba(156, 39, 176, 0.08)',
        fg: '#fff',
      },
      success: { base: '#2e7d32', fg: '#fff', subtle: 'rgba(46, 125, 50, 0.12)' },
      warning: { base: '#ed6c02', fg: '#fff', subtle: 'rgba(237, 108, 2, 0.12)' },
      danger: { base: '#d32f2f', fg: '#fff', subtle: 'rgba(211, 47, 47, 0.12)' },
      info: { base: '#0288d1', fg: '#fff', subtle: 'rgba(2, 136, 209, 0.12)' },
      border: {
        subtle: 'rgba(0, 0, 0, 0.5)',
        base: 'rgba(0, 0, 0, 0.12)',
        strong: 'rgba(0, 0, 0, 0.23)',
        focus: '#1976d2',
      },
      overlay: 'rgba(0, 0, 0, 0.5)',
    },
    space: {
      0: '0px',
      1: '4px',
      2: '8px',
      3: '12px',
      4: '16px',
      5: '20px',
      6: '24px',
      8: '32px',
      10: '40px',
      12: '48px',
      16: '64px',
      20: '80px',
      24: '96px',
    },
    radius: { none: '0', sm: '2px', md: '4px', lg: '8px', xl: '12px', full: '9999px' },
    font: {
      family: {
        sans: '"Roboto", "Helvetica", "Arial", sans-serif',
        mono: '"Roboto Mono", ui-monospace, SFMono-Regular, monospace',
      },
      size: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        '4xl': '3rem',
      },
      weight: { normal: 400, medium: 500, semibold: 600, bold: 700 },
      lineHeight: { tight: 1.25, normal: 1.5, relaxed: 1.75 },
    },
    shadow: {
      sm: '0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)',
      md: '0px 2px 4px -1px rgba(0,0,0,0.2),0px 4px 5px 0px rgba(0,0,0,0.14),0px 1px 10px 0px rgba(0,0,0,0.12)',
      lg: '0px 5px 5px -3px rgba(0,0,0,0.2),0px 8px 10px 1px rgba(0,0,0,0.14),0px 3px 14px 2px rgba(0,0,0,0.12)',
      xl: '0px 8px 10px -5px rgba(0,0,0,0.2),0px 16px 24px 2px rgba(0,0,0,0.14),0px 6px 30px 5px rgba(0,0,0,0.12)',
    },
    zIndex: {
      dropdown: 1000,
      overlay: 1300,
      modal: 1300,
      popover: 1100,
      tooltip: 1500,
      toast: 1400,
    },
    breakpoint: { sm: '600px', md: '900px', lg: '1200px', xl: '1536px', '2xl': '1536px' },
    motion: {
      duration: { fast: '150ms', normal: '300ms', slow: '375ms' },
      easing: {
        default: 'cubic-bezier(0.4, 0, 0.2, 1)',
        in: 'cubic-bezier(0.4, 0, 1, 1)',
        out: 'cubic-bezier(0.0, 0, 0.2, 1)',
        inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  dark: {
    color: {
      bg: {
        app: '#121212',
        surface: '#121212',
        elevated: '#121212',
        inset: 'rgba(255, 255, 255, 0.08)',
      },
      fg: {
        primary: '#fff',
        secondary: 'rgba(255, 255, 255, 0.7)',
        muted: 'rgba(255, 255, 255, 0.5)',
        disabled: 'rgba(255, 255, 255, 0.3)',
        onAccent: 'rgba(0, 0, 0, 0.87)',
      },
      accent: {
        base: '#90caf9',
        hover: 'rgb(155, 207, 249)',
        active: 'rgb(166, 212, 250)',
        subtle: 'rgba(144, 202, 249, 0.16)',
        fg: 'rgba(0, 0, 0, 0.87)',
      },
      accent2: {
        base: '#ce93d8',
        hover: 'rgb(210, 157, 219)',
        active: 'rgb(215, 168, 223)',
        subtle: 'rgba(206, 147, 216, 0.16)',
        fg: 'rgba(0, 0, 0, 0.87)',
      },
      success: { base: '#66bb6a', fg: 'rgba(0, 0, 0, 0.87)', subtle: 'rgba(102, 187, 106, 0.2)' },
      warning: { base: '#ffa726', fg: 'rgba(0, 0, 0, 0.87)', subtle: 'rgba(255, 167, 38, 0.2)' },
      danger: { base: '#f44336', fg: '#fff', subtle: 'rgba(244, 67, 54, 0.2)' },
      info: { base: '#29b6f6', fg: 'rgba(0, 0, 0, 0.87)', subtle: 'rgba(41, 182, 246, 0.2)' },
      border: {
        subtle: 'rgba(255, 255, 255, 0.5)',
        base: 'rgba(255, 255, 255, 0.12)',
        strong: 'rgba(255, 255, 255, 0.23)',
        focus: '#90caf9',
      },
      overlay: 'rgba(0, 0, 0, 0.5)',
    },
    space: {
      0: '0px',
      1: '4px',
      2: '8px',
      3: '12px',
      4: '16px',
      5: '20px',
      6: '24px',
      8: '32px',
      10: '40px',
      12: '48px',
      16: '64px',
      20: '80px',
      24: '96px',
    },
    radius: { none: '0', sm: '2px', md: '4px', lg: '8px', xl: '12px', full: '9999px' },
    font: {
      family: {
        sans: '"Roboto", "Helvetica", "Arial", sans-serif',
        mono: '"Roboto Mono", ui-monospace, SFMono-Regular, monospace',
      },
      size: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        '4xl': '3rem',
      },
      weight: { normal: 400, medium: 500, semibold: 600, bold: 700 },
      lineHeight: { tight: 1.25, normal: 1.5, relaxed: 1.75 },
    },
    shadow: {
      sm: '0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)',
      md: '0px 2px 4px -1px rgba(0,0,0,0.2),0px 4px 5px 0px rgba(0,0,0,0.14),0px 1px 10px 0px rgba(0,0,0,0.12)',
      lg: '0px 5px 5px -3px rgba(0,0,0,0.2),0px 8px 10px 1px rgba(0,0,0,0.14),0px 3px 14px 2px rgba(0,0,0,0.12)',
      xl: '0px 8px 10px -5px rgba(0,0,0,0.2),0px 16px 24px 2px rgba(0,0,0,0.14),0px 6px 30px 5px rgba(0,0,0,0.12)',
    },
    zIndex: {
      dropdown: 1000,
      overlay: 1300,
      modal: 1300,
      popover: 1100,
      tooltip: 1500,
      toast: 1400,
    },
    breakpoint: { sm: '600px', md: '900px', lg: '1200px', xl: '1536px', '2xl': '1536px' },
    motion: {
      duration: { fast: '150ms', normal: '300ms', slow: '375ms' },
      easing: {
        default: 'cubic-bezier(0.4, 0, 0.2, 1)',
        in: 'cubic-bezier(0.4, 0, 1, 1)',
        out: 'cubic-bezier(0.0, 0, 0.2, 1)',
        inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
};
