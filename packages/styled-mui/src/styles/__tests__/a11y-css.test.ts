import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

// jsdom does not apply stylesheets, so these tests assert the CSS source itself.
// Visual output is covered by the Playwright visual-regression suite in CI.
const P = "gmui";
const stylesDir = resolve(__dirname, "..");
const files = readdirSync(stylesDir).filter((f) => f.endsWith(".css"));
const sources = Object.fromEntries(files.map((f) => [f, readFileSync(resolve(stylesDir, f), "utf8")]));
const allCss = Object.values(sources).join("\n");

/** Declarations of every rule whose selector list contains `selector` exactly. */
function declarations(selector: string): string {
    const css = allCss.replace(/\/\*[\s\S]*?\*\//g, "");
    const out: string[] = [];
    for (const m of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
        const selectors = m[1].split(",").map((s) => s.trim().replace(/\s+/g, " "));
        if (selectors.includes(selector)) out.push(m[2]);
    }
    return out.join(";");
}

// A real indicator: a positive-width outline or a non-empty box-shadow, not transparent/none/0.
const VISIBLE_INDICATOR =
    /(outline:\s*(?!none|0\b|0px)[1-9][^;]*solid(?![^;]*transparent)[^;]*|box-shadow:\s*(?!none)[^;]*\b[1-9]\d*px[^;]*var\(--gugbab-color-[\w-]+\))/;

describe(`${P} CSS — 포커스 표시 (WCAG 2.4.7)`, () => {
    it("rgba(var(--hex)) 같은 무효 색 표기가 없다 — 토큰이 hex라 규칙 전체가 무시된다", () => {
        const offenders = files.filter((f) => /rgba\(\s*var\(/.test(sources[f]));
        expect(offenders).toEqual([]);
    });

    it.each([
        [`.${P}-select__item:focus-visible`],
        [`.${P}-combobox__item[data-highlighted]`],
        [`.${P}-tabs__content:focus-visible`],
        [`.${P}-menu__item:focus-visible`],
    ])("%s 에 보이는 포커스 표시(outline/box-shadow)가 있다", (selector) => {
        expect(declarations(selector)).toMatch(VISIBLE_INDICATOR);
    });

    it.each([
        [`.${P}-form__control:focus`],
        [`.${P}-otp__input:focus`],
        [`.${P}-select__trigger:focus-visible`],
        [`.${P}-combobox__input:focus`],
    ])("%s 포커스 링이 거의 안 보이는 accent-subtle 만으로 그려지지 않는다", (selector) => {
        const decl = declarations(selector);
        expect(decl).toMatch(VISIBLE_INDICATOR);
        expect(decl).not.toMatch(/box-shadow:[^;]*accent-subtle/);
    });

    it("DropdownMenu 항목은 헤드리스가 설정하지 않는 [data-highlighted] 에 기대지 않는다 (죽은 선택자)", () => {
        expect(sources["dropdown-menu.css"]).not.toMatch(/__item\[data-highlighted\]/);
    });

    it.each([
        ["outline: 0"],
        ["outline: none"],
        ["outline: 2px solid transparent"],
        ["box-shadow: none"],
    ])("보이지 않는 표시 %s 는 포커스 표시로 인정하지 않는다 (판정 경계)", (decl) => {
        expect(decl).not.toMatch(VISIBLE_INDICATOR);
    });

    it("존재하지 않는 선택자는 빈 선언을 준다 (헬퍼 경계)", () => {
        expect(declarations(`.${P}-does-not-exist`)).toBe("");
    });
});

describe(`${P} CSS — 컨트롤 경계 비텍스트 대비 (WCAG 1.4.11)`, () => {
    it.each([
        [`.${P}-checkbox`],
        [`.${P}-radio-group__item`],
        [`.${P}-form__control`],
        [`.${P}-otp__input`],
        [`.${P}-select__trigger`],
        [`.${P}-combobox__input`],
    ])("%s 경계가 border-control 토큰(3:1 보장)을 쓴다", (selector) => {
        expect(declarations(selector)).toContain("var(--gugbab-color-border-control)");
    });

    it("Switch 트랙(꺼짐)에 border-control 경계가 있다", () => {
        expect(declarations(`.${P}-switch`)).toContain("var(--gugbab-color-border-control)");
    });

    it("Toast 닫기 아이콘이 대비가 낮은 fg-muted 를 쓰지 않는다", () => {
        const decl = declarations(`.${P}-toast__close button`);
        expect(decl).toMatch(/color:\s*var\(--gugbab-color-fg-/); // 선택자가 사라져 헛통과하지 않게
        expect(decl).not.toContain("--gugbab-color-fg-muted");
    });
});
