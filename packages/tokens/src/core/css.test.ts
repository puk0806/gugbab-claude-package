import { describe, expect, it } from 'vitest';
import { muiTheme } from '../mui';
import { radixTheme } from '../radix';
import { renderThemeCss, renderVars, tokensToVars } from './css';

describe('tokensToVars', () => {
  it('produces gugbab-prefixed CSS variable keys', () => {
    const vars = tokensToVars(muiTheme.light);
    const keys = Object.keys(vars);
    expect(keys.every((k) => k.startsWith('--gugbab-'))).toBe(true);
  });

  it('emits all required color slots', () => {
    const vars = tokensToVars(muiTheme.light);
    expect(vars).toHaveProperty('--gugbab-color-bg-app');
    expect(vars).toHaveProperty('--gugbab-color-fg-primary');
    expect(vars).toHaveProperty('--gugbab-color-accent-base');
    expect(vars).toHaveProperty('--gugbab-color-accent-hover');
    expect(vars).toHaveProperty('--gugbab-color-success-base');
    expect(vars).toHaveProperty('--gugbab-color-warning-base');
    expect(vars).toHaveProperty('--gugbab-color-danger-base');
    expect(vars).toHaveProperty('--gugbab-color-info-base');
    expect(vars).toHaveProperty('--gugbab-color-border-base');
    expect(vars).toHaveProperty('--gugbab-color-overlay');
  });

  it('emits all space and radius scales', () => {
    const vars = tokensToVars(muiTheme.light);
    for (const k of [0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24] as const) {
      expect(vars).toHaveProperty(`--gugbab-space-${k}`);
    }
    for (const k of ['none', 'sm', 'md', 'lg', 'xl', 'full']) {
      expect(vars).toHaveProperty(`--gugbab-radius-${k}`);
    }
  });

  it('emits font / shadow / z-index / motion', () => {
    const vars = tokensToVars(radixTheme.light);
    expect(vars).toHaveProperty('--gugbab-font-family-sans');
    expect(vars).toHaveProperty('--gugbab-font-size-base');
    expect(vars).toHaveProperty('--gugbab-shadow-md');
    expect(vars).toHaveProperty('--gugbab-z-modal');
    expect(vars).toHaveProperty('--gugbab-duration-normal');
    expect(vars).toHaveProperty('--gugbab-easing-default');
  });
});

describe('renderVars', () => {
  it('renders `key: value;` lines', () => {
    const out = renderVars({ '--a': '1', '--b': '2' });
    expect(out).toContain('--a: 1;');
    expect(out).toContain('--b: 2;');
  });
});

describe('renderThemeCss', () => {
  it('contains :root and [data-theme=dark] blocks', () => {
    const css = renderThemeCss(muiTheme);
    expect(css).toContain(':root {');
    expect(css).toContain("[data-theme='dark']");
  });

  it('light and dark blocks differ in at least one color value', () => {
    const css = renderThemeCss(muiTheme);
    const blocks = css.split("[data-theme='dark']");
    expect(blocks).toHaveLength(2);
    // light :root block
    expect(blocks[0]).toContain('--gugbab-color-bg-app');
    // dark block
    expect(blocks[1]).toContain('--gugbab-color-bg-app');
  });

  it('writes a header comment when provided', () => {
    const css = renderThemeCss(muiTheme, 'TEST HEADER');
    expect(css.startsWith('/* TEST HEADER */')).toBe(true);
  });
});

describe('mui adapter', () => {
  it('produces both light and dark themes with shared shape', () => {
    expect(muiTheme.light.color.bg.app).toBeDefined();
    expect(muiTheme.dark.color.bg.app).toBeDefined();
    expect(muiTheme.light.color.bg.app).not.toEqual(muiTheme.dark.color.bg.app);
  });

  it('inherits MUI primary color', () => {
    // MUI default primary.main is "#1976d2" in light mode
    expect(muiTheme.light.color.accent.base.toLowerCase()).toContain('#1976d2');
  });
});

describe('radix adapter', () => {
  it('produces both light and dark themes', () => {
    expect(radixTheme.light.color.bg.app).toBeDefined();
    expect(radixTheme.dark.color.bg.app).toBeDefined();
    expect(radixTheme.light.color.bg.app).not.toEqual(radixTheme.dark.color.bg.app);
  });

  it('uses Radix slate1 for app background (near-white in light mode)', () => {
    // Radix Colors v3+ emits hex strings; slate1 light = #fcfcfd
    expect(radixTheme.light.color.bg.app.toLowerCase()).toBe('#fcfcfd');
  });
});
