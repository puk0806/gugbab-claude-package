import { describe, expect, it } from "vitest";
import { muiTheme } from "../mui";
import { renderThemeCss, tokensToVars } from "./css";
import type { DesignTokens, ThemeTokens } from "./types";

function withAccent(value: string): ThemeTokens {
    const light: DesignTokens = {
        ...muiTheme.light,
        color: { ...muiTheme.light.color, accent: { ...muiTheme.light.color.accent, base: value } },
    };
    return { light, dark: muiTheme.dark };
}

describe("tokens CSS 생성 — 악성·비정상 값 (CSS 인젝션 방어)", () => {
    it.each([
        ["red; } body { display: none"],
        ["red}</style><script>alert(1)</script>"],
        ["red { x"],
    ])("구조를 깨는 값 %j 은 거부한다", (value) => {
        expect(() => renderThemeCss(withAccent(value))).toThrow(TypeError);
    });

    it("개행으로 새 선언을 끼워 넣을 수 없다 (한 값 안에 머문다)", () => {
        const css = renderThemeCss(withAccent("red\n--gugbab-injected: 1"));
        expect(css).toContain("--gugbab-color-accent-base: red --gugbab-injected: 1;");
        expect(css).not.toMatch(/^\s*--gugbab-injected/m);
    });

    it("커스텀 easing 키에 CSS 구문 문자가 있으면 거부한다", () => {
        const light: DesignTokens = {
            ...muiTheme.light,
            // Untrusted JS input: an extra key the type does not allow.
            motion: {
                ...muiTheme.light.motion,
                easing: Object.assign({}, muiTheme.light.motion.easing, { "x: 1; y": "ease" }),
            },
        };
        expect(() => tokensToVars(light)).toThrow(TypeError);
    });

    it("헤더의 주석 종료 기호(*/)가 주석을 일찍 닫지 않는다", () => {
        const css = renderThemeCss(muiTheme, "v1 */ body { display: none } /*");
        const firstClose = css.indexOf("*/");
        expect(css.slice(0, firstClose)).toContain("v1");
        expect(css.slice(0, firstClose)).toContain("display: none"); // 주석 안에 머문다
        expect(css.indexOf(":root {")).toBeGreaterThan(firstClose);
    });

    it("헤더의 </ 는 <style> 에 인라인돼도 요소를 닫지 않게 이스케이프한다", () => {
        const css = renderThemeCss(muiTheme, "x </style><script>alert(1)</script>");
        expect(css).not.toContain("</");
    });

    it("정상적인 rgba·var·공백·쉼표 값은 그대로 통과한다 (회귀 방지)", () => {
        const css = renderThemeCss(withAccent("color-mix(in srgb, rgba(0, 0, 0, 0.5) 50%, transparent)"));
        expect(css).toContain("--gugbab-color-accent-base: color-mix(in srgb, rgba(0, 0, 0, 0.5) 50%, transparent);");
    });

    it("빈 문자열 값은 거부한다 (빈 변수는 계산 시 무효가 되어 속성이 사라진다)", () => {
        expect(() => renderThemeCss(withAccent(""))).toThrow(TypeError);
    });

    it.each([
        ['url("a.svg'], // 닫히지 않은 따옴표 — 뒤 선언을 삼킨다
        ["calc(1px + 2px"], // 닫히지 않은 괄호
        ["1px)"], // 짝 없는 닫는 괄호
        ['"a\nb"'], // 따옴표 안 개행 — bad-string
    ])("짝이 맞지 않거나 깨진 값 %j 은 거부한다 (경계)", (value) => {
        expect(() => renderThemeCss(withAccent(value))).toThrow(TypeError);
    });
});

describe("tokens CSS 생성 — 정상이지만 까다로운 값 (오탐 방지)", () => {
    it("따옴표·괄호 안의 ; } 는 허용한다 (data URI 등)", () => {
        const uri = `url("data:image/svg+xml;charset=utf-8,<svg>{}</svg>")`.replace("</", "<\\/");
        const css = renderThemeCss(withAccent(uri));
        expect(css).toContain(`--gugbab-color-accent-base: ${uri};`);
        const unquoted = "url(data:image/png;base64,AAAA)";
        expect(renderThemeCss(withAccent(unquoted))).toContain(`: ${unquoted};`);
    });

    it("여러 줄 값(템플릿 리터럴 shadow 등)은 한 줄로 정규화한다", () => {
        const css = renderThemeCss(withAccent("0 1px 2px red,\n    0 2px 4px blue"));
        expect(css).toContain("--gugbab-color-accent-base: 0 1px 2px red, 0 2px 4px blue;");
    });

    it("Tailwind식 0.5·밑줄 키는 유효한 CSS 이름으로 이스케이프한다", () => {
        const light: DesignTokens = {
            ...muiTheme.light,
            space: Object.assign({}, muiTheme.light.space, { "0.5": "2px", "2xs_x": "1px" }),
        };
        const vars = tokensToVars(light);
        expect(vars["--gugbab-space-0\\.5"]).toBe("2px");
        expect(vars["--gugbab-space-2xs_x"]).toBe("1px");
    });
});
