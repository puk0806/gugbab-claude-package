import type { DesignTokens, ThemeTokens } from "./types";

/**
 * Flattens a design-token object into a `Record<varName, value>` map ready
 * to emit as CSS custom properties under `--gugbab-*`.
 */
export function tokensToVars(tokens: DesignTokens): Record<string, string> {
    const vars: Record<string, string> = {};
    // color
    setVar(vars, "color-bg-app", tokens.color.bg.app);
    setVar(vars, "color-bg-surface", tokens.color.bg.surface);
    setVar(vars, "color-bg-elevated", tokens.color.bg.elevated);
    setVar(vars, "color-bg-inset", tokens.color.bg.inset);
    setVar(vars, "color-fg-primary", tokens.color.fg.primary);
    setVar(vars, "color-fg-secondary", tokens.color.fg.secondary);
    setVar(vars, "color-fg-muted", tokens.color.fg.muted);
    setVar(vars, "color-fg-disabled", tokens.color.fg.disabled);
    setVar(vars, "color-fg-on-accent", tokens.color.fg.onAccent);
    setVar(vars, "color-accent-base", tokens.color.accent.base);
    setVar(vars, "color-accent-hover", tokens.color.accent.hover);
    setVar(vars, "color-accent-active", tokens.color.accent.active);
    setVar(vars, "color-accent-subtle", tokens.color.accent.subtle);
    setVar(vars, "color-accent-fg", tokens.color.accent.fg);
    if (tokens.color.accent2) {
        setVar(vars, "color-accent2-base", tokens.color.accent2.base);
        setVar(vars, "color-accent2-hover", tokens.color.accent2.hover);
        setVar(vars, "color-accent2-active", tokens.color.accent2.active);
        setVar(vars, "color-accent2-subtle", tokens.color.accent2.subtle);
        setVar(vars, "color-accent2-fg", tokens.color.accent2.fg);
    }
    for (const status of ["success", "warning", "danger", "info"] as const) {
        setVar(vars, `color-${status}-base`, tokens.color[status].base);
        setVar(vars, `color-${status}-fg`, tokens.color[status].fg);
        setVar(vars, `color-${status}-subtle`, tokens.color[status].subtle);
    }
    setVar(vars, "color-border-subtle", tokens.color.border.subtle);
    setVar(vars, "color-border-base", tokens.color.border.base);
    setVar(vars, "color-border-strong", tokens.color.border.strong);
    setVar(vars, "color-border-focus", tokens.color.border.focus);
    // Optional token (added later) — fall back so custom themes never emit an empty var.
    setVar(vars, "color-border-control", tokens.color.border.control ?? tokens.color.border.strong);
    setVar(vars, "color-overlay", tokens.color.overlay);

    // space
    for (const [k, v] of Object.entries(tokens.space)) {
        setVar(vars, `space-${k}`, v);
    }

    // radius
    for (const [k, v] of Object.entries(tokens.radius)) {
        setVar(vars, `radius-${k}`, v);
    }

    // font
    setVar(vars, "font-family-sans", tokens.font.family.sans);
    setVar(vars, "font-family-mono", tokens.font.family.mono);
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

const SAFE_KEY = /^[a-z0-9._-]+$/i;
const CLOSERS: Record<string, string> = { "(": ")", "[": "]", "{": "}" };

/**
 * Token values are emitted verbatim, so a custom theme must not be able to end
 * the declaration or block (e.g. `red; } body { display: none`) or the
 * surrounding `<style>` element. `;`/`{`/`}` are fine inside quotes or brackets
 * (data URIs), as long as quotes close and brackets nest. Line breaks outside
 * quotes are collapsed to a space. Returns the value to emit, or null if unsafe.
 */
function sanitizeValue(value: string): string | null {
    if (value.includes("</")) return null;
    const stack: string[] = [];
    let quote = "";
    let out = "";
    for (let i = 0; i < value.length; i++) {
        const ch = value.charAt(i);
        if (ch === "\\") {
            const next = value.charAt(i + 1);
            if (next === "" || next === "\n" || next === "\r") return null;
            out += ch + next;
            i++;
            continue;
        }
        if (quote) {
            if (ch === "\n" || ch === "\r") return null;
            if (ch === quote) quote = "";
        } else if (ch === '"' || ch === "'") {
            quote = ch;
        } else if (ch === "(" || ch === "[" || ch === "{") {
            if (ch === "{" && stack.length === 0) return null;
            stack.push(CLOSERS[ch] ?? "");
        } else if (ch === ")" || ch === "]" || ch === "}") {
            if (stack.pop() !== ch) return null;
        } else if (ch === ";" && stack.length === 0) {
            return null;
        } else if (ch === "\n" || ch === "\r") {
            // Collapse the break and its surrounding indentation into one space.
            out = `${out.trimEnd()} `;
            while (/[ \t\n\r]/.test(value.charAt(i + 1))) i++;
            continue;
        }
        out += ch;
    }
    if (quote || stack.length > 0) return null;
    const trimmed = out.trim();
    return trimmed === "" ? null : trimmed;
}

function setVar(map: Record<string, string>, key: string, value: string) {
    if (!SAFE_KEY.test(key)) {
        throw new TypeError(`Invalid token name "${key}" — use letters, digits, ".", "_" and "-" only`);
    }
    const safe = typeof value === "string" ? sanitizeValue(value) : null;
    if (safe === null) {
        throw new TypeError(`Invalid value for --gugbab-${key}: ${JSON.stringify(value)}`);
    }
    // `.` is not an identifier character — escape it so `space-0.5` stays one name.
    map[`--gugbab-${key.replace(/\./g, "\\.")}`] = safe;
}

/**
 * Renders a `Record<varName, value>` as a CSS block (no surrounding selector).
 */
export function renderVars(vars: Record<string, string>, indent = "  "): string {
    return Object.entries(vars)
        .map(([k, v]) => `${indent}${k}: ${v};`)
        .join("\n");
}

/**
 * Renders a complete CSS file with `:root` (light) + `[data-theme='dark']`
 * blocks. Suitable for `dist/{system}.css`.
 */
export function renderThemeCss(theme: ThemeTokens, header?: string): string {
    const lightVars = tokensToVars(theme.light);
    const darkVars = tokensToVars(theme.dark);

    const lines: string[] = [];
    // `*/` would close the comment early and expose the rest as CSS; `</` would end
    // a surrounding <style> element if the output is inlined (HTML ignores comments).
    if (header) lines.push(`/* ${header.replace(/\*\//g, "*\\/").replace(/<\//g, "<\\/")} */`, "");
    lines.push(":root {");
    lines.push(renderVars(lightVars));
    lines.push("}");
    lines.push("");
    lines.push("[data-theme='dark'] {");
    lines.push(renderVars(darkVars));
    lines.push("}");
    lines.push("");
    return lines.join("\n");
}
