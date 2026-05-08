/**
 * @gugbab/tokens — Radix Themes lookalike theme.
 *
 * Static token snapshot inspired by Radix Themes (slate gray + blue accent,
 * Inter font). Values are baked in here so this package has no runtime *or*
 * devDep on `@radix-ui/colors` — our design system is independent of
 * upstream Radix changes.
 *
 * If Radix ever ships a palette update worth adopting, regenerate this file
 * manually and bump the tokens package.
 */
import type { ThemeTokens } from '../core/types';

export const radixTheme: ThemeTokens = {
  light: {
    color: {
      bg: { app: '#fcfcfd', surface: '#f9f9fb', elevated: '#fcfcfd', inset: '#f0f0f3' },
      fg: {
        primary: '#1c2024',
        secondary: '#60646c',
        muted: '#80838d',
        disabled: '#b9bbc6',
        onAccent: 'white',
      },
      accent: {
        base: '#0090ff',
        hover: '#0588f0',
        active: '#0d74ce',
        subtle: '#e6f4fe',
        fg: 'white',
      },
      success: { base: '#30a46c', fg: 'white', subtle: '#e6f6eb' },
      warning: { base: '#ffc53d', fg: 'black', subtle: '#fff7c2' },
      danger: { base: '#e5484d', fg: 'white', subtle: '#feebec' },
      info: { base: '#0090ff', fg: 'white', subtle: '#e6f4fe' },
      border: { subtle: '#d9d9e0', base: '#cdced6', strong: '#b9bbc6', focus: '#5eb1ef' },
      overlay: 'rgba(0, 0, 0, 0.6)',
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
    radius: { none: '0', sm: '3px', md: '4px', lg: '6px', xl: '8px', full: '9999px' },
    font: {
      family: {
        sans: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        mono: '"JetBrains Mono", ui-monospace, SFMono-Regular, monospace',
      },
      size: {
        xs: '12px',
        sm: '14px',
        base: '16px',
        lg: '18px',
        xl: '20px',
        '2xl': '24px',
        '3xl': '28px',
        '4xl': '35px',
      },
      weight: { normal: 400, medium: 500, semibold: 600, bold: 700 },
      lineHeight: { tight: 1.2, normal: 1.5, relaxed: 1.75 },
    },
    shadow: {
      sm: '0 1px 2px rgba(0,0,0,0.06)',
      md: '0 2px 6px rgba(0,0,0,0.08)',
      lg: '0 8px 24px rgba(0,0,0,0.12)',
      xl: '0 16px 48px rgba(0,0,0,0.16)',
    },
    zIndex: {
      dropdown: 100,
      overlay: 1000,
      modal: 1010,
      popover: 1020,
      tooltip: 1030,
      toast: 1040,
    },
    breakpoint: { sm: '520px', md: '768px', lg: '1024px', xl: '1280px', '2xl': '1640px' },
    motion: {
      duration: { fast: '120ms', normal: '200ms', slow: '320ms' },
      easing: {
        default: 'cubic-bezier(0.4, 0, 0.2, 1)',
        in: 'cubic-bezier(0.4, 0, 1, 1)',
        out: 'cubic-bezier(0, 0, 0.2, 1)',
        inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  dark: {
    color: {
      bg: { app: '#111113', surface: '#18191b', elevated: '#111113', inset: '#212225' },
      fg: {
        primary: '#edeef0',
        secondary: '#b0b4ba',
        muted: '#777b84',
        disabled: '#5a6169',
        onAccent: 'white',
      },
      accent: {
        base: '#0090ff',
        hover: '#3b9eff',
        active: '#70b8ff',
        subtle: '#0d2847',
        fg: 'white',
      },
      success: { base: '#30a46c', fg: 'white', subtle: '#132d21' },
      warning: { base: '#ffc53d', fg: 'black', subtle: '#302008' },
      danger: { base: '#e5484d', fg: 'white', subtle: '#3b1219' },
      info: { base: '#0090ff', fg: 'white', subtle: '#0d2847' },
      border: { subtle: '#363a3f', base: '#43484e', strong: '#5a6169', focus: '#2870bd' },
      overlay: 'rgba(255, 255, 255, 0.2)',
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
    radius: { none: '0', sm: '3px', md: '4px', lg: '6px', xl: '8px', full: '9999px' },
    font: {
      family: {
        sans: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        mono: '"JetBrains Mono", ui-monospace, SFMono-Regular, monospace',
      },
      size: {
        xs: '12px',
        sm: '14px',
        base: '16px',
        lg: '18px',
        xl: '20px',
        '2xl': '24px',
        '3xl': '28px',
        '4xl': '35px',
      },
      weight: { normal: 400, medium: 500, semibold: 600, bold: 700 },
      lineHeight: { tight: 1.2, normal: 1.5, relaxed: 1.75 },
    },
    shadow: {
      sm: '0 1px 2px rgba(0,0,0,0.4)',
      md: '0 2px 6px rgba(0,0,0,0.45)',
      lg: '0 8px 24px rgba(0,0,0,0.5)',
      xl: '0 16px 48px rgba(0,0,0,0.6)',
    },
    zIndex: {
      dropdown: 100,
      overlay: 1000,
      modal: 1010,
      popover: 1020,
      tooltip: 1030,
      toast: 1040,
    },
    breakpoint: { sm: '520px', md: '768px', lg: '1024px', xl: '1280px', '2xl': '1640px' },
    motion: {
      duration: { fast: '120ms', normal: '200ms', slow: '320ms' },
      easing: {
        default: 'cubic-bezier(0.4, 0, 0.2, 1)',
        in: 'cubic-bezier(0.4, 0, 1, 1)',
        out: 'cubic-bezier(0, 0, 0.2, 1)',
        inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
};
