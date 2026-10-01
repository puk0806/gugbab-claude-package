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
        const selectors = (m[1] ?? "").split(",").map((s) => s.trim().replace(/\s+/g, " "));
        if (selectors.includes(selector)) out.push(m[2] ?? "");
    }
    return out.join(";");
}

// A real indicator: a positive-width outline or a non-empty box-shadow, not transparent/none/0.
const VISIBLE_INDICATOR =
    /(outline:\s*(?!none|0\b|0px)[1-9][^;]*solid(?![^;]*transparent)[^;]*|box-shadow:\s*(?!none)[^;]*\b[1-9]\d*px[^;]*var\(--gugbab-color-[\w-]+\))/;

describe(`${P} CSS — 포커스 표시 (WCAG 2.4.7)`, () => {
    it("rgba(var(--hex)) 같은 무효 색 표기가 없다 — 토큰이 hex라 규칙 전체가 무시된다", () => {
        const offenders = files.filter((f) => /rgba\(\s*var\(/.test(sources[f] ?? ""));
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
        expect(sources["dropdown-menu.css"] ?? "").not.toMatch(/__item\[data-highlighted\]/);
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

describe(`${P} CSS — 사용자 환경 설정·타깃 크기`, () => {
    const a11y = sources["zz-a11y.css"] ?? "";

    it("접근성 규칙 파일이 번들에서 마지막에 로드된다 (이름순 정렬 — 앞 규칙을 덮어써야 함)", () => {
        expect(files.at(-1)).toBe("zz-a11y.css");
    });

    it("prefers-reduced-motion 에서 이 패키지의 애니메이션·전환을 끈다 (WCAG 2.3.3)", () => {
        const block = /@media \(prefers-reduced-motion: reduce\)\s*\{([\s\S]*?)\n\}/.exec(a11y)?.[1] ?? "";
        expect(block).toContain(`[class*="${P}-"]`);
        expect(block).toMatch(/animation-duration:\s*0\.01ms\s*!important/);
        expect(block).toMatch(/transition-duration:\s*0\.01ms\s*!important/);
    });

    it.each([
        `.${P}-switch`,
        `.${P}-checkbox`,
        `.${P}-radio-group__item`,
    ])("forced-colors 에서 %s 의 경계와 켜짐 상태가 시스템 색으로 보인다 (배경색 소거 대응)", (selector) => {
        const block = /@media \(forced-colors: active\)\s*\{([\s\S]*?)\n\}/.exec(a11y)?.[1] ?? "";
        expect(block).toContain(selector);
        expect(block).toMatch(/CanvasText|ButtonText/);
        expect(block).toMatch(/Highlight/);
    });

    it.each([
        `.${P}-checkbox`,
        `.${P}-radio-group__item`,
        `.${P}-switch`,
        `.${P}-toast__close button`,
    ])("%s 는 보이지 않는 히트 영역으로 최소 24px 타깃을 보장한다 (WCAG 2.5.8)", (selector) => {
        const hit = declarations(`${selector}::before`);
        expect(hit).toMatch(/content:\s*""/);
        expect(hit).toMatch(/min-width:\s*24px/);
        expect(hit).toMatch(/min-height:\s*24px/);
    });

    it("히트 영역용 position 은 :where() 로 감싸 소비자의 position 재정의를 이기지 않는다 (경계)", () => {
        const css = a11y.replace(/\/\*[\s\S]*?\*\//g, "");
        const rule = css.match(/([^{}]+)\{\s*position:\s*relative;?\s*\}/);
        expect(rule?.[1]?.trim()).toMatch(/^:where\(/);
        // 특이도 0 이 아닌 형태로 새 position 을 강제하지 않는다
        expect(css).not.toMatch(new RegExp(`(^|\\})\\s*\\.${P}-[a-z_-]+\\s*\\{[^}]*position:\\s*relative`));
    });
});
