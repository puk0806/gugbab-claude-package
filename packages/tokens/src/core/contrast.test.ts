import { describe, expect, it } from "vitest";
import { muiTheme } from "../mui";
import { radixTheme } from "../radix";
import { tokensToVars } from "./css";
import type { DesignTokens } from "./types";

// WCAG 2.x contrast — translucent colors are composited over the background first.
type Rgba = { r: number; g: number; b: number; a: number };

function parseColor(value: string): Rgba {
    const v = value.trim().toLowerCase();
    if (v === "white") return { r: 255, g: 255, b: 255, a: 1 };
    if (v === "black") return { r: 0, g: 0, b: 0, a: 1 };
    const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/.exec(v);
    const hexDigits = hex?.[1];
    if (hexDigits) {
        const digits = hexDigits.length === 3 ? [...hexDigits].map((c) => c + c).join("") : hexDigits;
        const n = Number.parseInt(digits, 16);
        return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255, a: 1 };
    }
    const fn = /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)$/.exec(v);
    if (fn) {
        const [, r = "", g = "", b = "", a] = fn;
        return { r: Number(r), g: Number(g), b: Number(b), a: a === undefined ? 1 : Number(a) };
    }
    throw new Error(`unsupported color: ${value}`);
}

function composite(fg: Rgba, bg: Rgba): Rgba {
    const mix = (f: number, b: number) => f * fg.a + b * (1 - fg.a);
    return { r: mix(fg.r, bg.r), g: mix(fg.g, bg.g), b: mix(fg.b, bg.b), a: 1 };
}

function luminance({ r, g, b }: Rgba): number {
    const lin = (c: number) => {
        const s = c / 255;
        return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function contrast(fgValue: string, bgValue: string): number {
    const bg = parseColor(bgValue);
    const fg = composite(parseColor(fgValue), bg);
    const a = luminance(fg);
    const b = luminance(bg);
    return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

describe("contrast helper (경계·오류)", () => {
    it("검정/흰색은 21:1, 같은 색은 1:1", () => {
        expect(contrast("#000000", "#ffffff")).toBeCloseTo(21, 5);
        expect(contrast("#777777", "#777777")).toBeCloseTo(1, 5);
    });

    it("3자리 hex도 6자리와 같게 해석한다", () => {
        expect(contrast("#000", "#fff")).toBeCloseTo(21, 5);
    });

    it("완전 투명 전경은 배경과 같아 1:1", () => {
        expect(contrast("rgba(0, 0, 0, 0)", "#ffffff")).toBeCloseTo(1, 5);
    });

    it("지원하지 않는 색 표기는 조용히 통과시키지 않고 throw", () => {
        expect(() => contrast("var(--x)", "#ffffff")).toThrow("unsupported color");
    });
});

const themes: Array<[string, DesignTokens]> = [
    ["mui light", muiTheme.light],
    ["mui dark", muiTheme.dark],
    ["radix light", radixTheme.light],
    ["radix dark", radixTheme.dark],
];

describe("border.control — 컨트롤 경계 비텍스트 대비 (WCAG 1.4.11, 3:1)", () => {
    it.each(themes)("%s: bg.app·bg.surface 대비 3:1 이상", (_, t) => {
        const control = t.color.border.control;
        expect(control).toBeTypeOf("string");
        expect(contrast(control ?? "", t.color.bg.app)).toBeGreaterThanOrEqual(3);
        expect(contrast(control ?? "", t.color.bg.surface)).toBeGreaterThanOrEqual(3);
    });

    it("CSS 변수 --gugbab-color-border-control 이 생성된다", () => {
        expect(tokensToVars(muiTheme.light)).toHaveProperty("--gugbab-color-border-control");
        expect(tokensToVars(radixTheme.dark)).toHaveProperty("--gugbab-color-border-control");
    });
});

describe("border.control 하위 호환 — 기존 커스텀 테마 (누락 경계)", () => {
    it("control 이 없는 테마도 타입상 허용되고 CSS 변수는 border.strong 으로 채워진다 (테두리 소실 방지)", () => {
        const { control: _omit, ...legacyBorder } = muiTheme.light.color.border;
        const legacy: DesignTokens = { ...muiTheme.light, color: { ...muiTheme.light.color, border: legacyBorder } };
        const vars = tokensToVars(legacy);
        expect(vars["--gugbab-color-border-control"]).toBe(legacyBorder.strong);
        expect(Object.values(vars)).not.toContain(undefined);
    });
});
