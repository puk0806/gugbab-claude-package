import type { DesignTokens, ThemeTokens } from './types';

/**
 * Flattens a design-token object into a `Record<varName, value>` map ready
 * to emit as CSS custom properties under `--gugbab-*`.
 */
export function tokensToVars(tokens: DesignTokens): Record<string, string> {
  const vars: Record<string, string> = {};
  // color
  setVar(vars, 'color-bg-app', tokens.color.bg.app);
  setVar(vars, 'color-bg-surface', tokens.color.bg.surface);
  setVar(vars, 'color-bg-elevated', tokens.color.bg.elevated);
  setVar(vars, 'color-bg-inset', tokens.color.bg.inset);
  setVar(vars, 'color-fg-primary', tokens.color.fg.primary);
  setVar(vars, 'color-fg-secondary', tokens.color.fg.secondary);
  setVar(vars, 'color-fg-muted', tokens.color.fg.muted);
  setVar(vars, 'color-fg-disabled', tokens.color.fg.disabled);
  setVar(vars, 'color-fg-on-accent', tokens.color.fg.onAccent);
  setVar(vars, 'color-accent-base', tokens.color.accent.base);
  setVar(vars, 'color-accent-hover', tokens.color.accent.hover);
  setVar(vars, 'color-accent-active', tokens.color.accent.active);
  setVar(vars, 'color-accent-subtle', tokens.color.accent.subtle);
  setVar(vars, 'color-accent-fg', tokens.color.accent.fg);
  if (tokens.color.accent2) {
    setVar(vars, 'color-accent2-base', tokens.color.accent2.base);
    setVar(vars, 'color-accent2-hover', tokens.color.accent2.hover);
    setVar(vars, 'color-accent2-active', tokens.color.accent2.active);
    setVar(vars, 'color-accent2-subtle', tokens.color.accent2.subtle);
    setVar(vars, 'color-accent2-fg', tokens.color.accent2.fg);
  }
  for (const status of ['success', 'warning', 'danger', 'info'] as const) {
    setVar(vars, `color-${status}-base`, tokens.color[status].base);
    setVar(vars, `color-${status}-fg`, tokens.color[status].fg);
    setVar(vars, `color-${status}-subtle`, tokens.color[status].subtle);
  }
  setVar(vars, 'color-border-subtle', tokens.color.border.subtle);
  setVar(vars, 'color-border-base', tokens.color.border.base);
  setVar(vars, 'color-border-strong', tokens.color.border.strong);
  setVar(vars, 'color-border-focus', tokens.color.border.focus);
  setVar(vars, 'color-overlay', tokens.color.overlay);

  // space
  for (const [k, v] of Object.entries(tokens.space)) {
    setVar(vars, `space-${k}`, v);
  }

  // radius
  for (const [k, v] of Object.entries(tokens.radius)) {
    setVar(vars, `radius-${k}`, v);
  }

  // font
  setVar(vars, 'font-family-sans', tokens.font.family.sans);
  setVar(vars, 'font-family-mono', tokens.font.family.mono);
  for (const [k, v] of Object.entries(tokens.font.size)) {
    setVar(vars, `font-size-${k}`, v);
  }
  for (const [k, v] of Object.entries(tokens.font.weight)) {
    setVar(vars, `font-weight-${k}`, String(v));
  }
  for (const [k, v] of Object.entries(tokens.font.lineHeight)) {
    setVar(vars, `line-height-${k}`, String(v));
  }

  // shadow
  for (const [k, v] of Object.entries(tokens.shadow)) {
    setVar(vars, `shadow-${k}`, v);
  }

  // z-index
  for (const [k, v] of Object.entries(tokens.zIndex)) {
    setVar(vars, `z-${k}`, String(v));
  }

  // breakpoint (informational only — emit as CSS vars too for runtime queries)
  for (const [k, v] of Object.entries(tokens.breakpoint)) {
    setVar(vars, `breakpoint-${k}`, v);
  }

  // motion
  for (const [k, v] of Object.entries(tokens.motion.duration)) {
    setVar(vars, `duration-${k}`, v);
  }
  for (const [k, v] of Object.entries(tokens.motion.easing)) {
    setVar(vars, `easing-${k}`, v);
  }

  return vars;
}

function setVar(map: Record<string, string>, key: string, value: string) {
  map[`--gugbab-${key}`] = value;
}

/**
 * Renders a `Record<varName, value>` as a CSS block (no surrounding selector).
 */
export function renderVars(vars: Record<string, string>, indent = '  '): string {
  return Object.entries(vars)
    .map(([k, v]) => `${indent}${k}: ${v};`)
    .join('\n');
}

/**
 * Renders a complete CSS file with `:root` (light) + `[data-theme='dark']`
 * blocks. Suitable for `dist/{system}.css`.
 */
export function renderThemeCss(theme: ThemeTokens, header?: string): string {
  const lightVars = tokensToVars(theme.light);
  const darkVars = tokensToVars(theme.dark);

  const lines: string[] = [];
  if (header) lines.push(`/* ${header} */`, '');
  lines.push(':root {');
  lines.push(renderVars(lightVars));
  lines.push('}');
  lines.push('');
  lines.push("[data-theme='dark'] {");
  lines.push(renderVars(darkVars));
  lines.push('}');
  lines.push('');
  return lines.join('\n');
}
