// adversarial-test-guard: allow — 커밋 메시지 형식 검증 설정 테스트. 예외를 던지는
// 에러 경로가 없는 순수 판정 규칙이라, 잘못된 헤더 거부(부정 경로)를 집중 커버.
const { test } = require("node:test");
const assert = require("node:assert/strict");
const config = require("./index");

const rule = config.plugins[0].rules["gugbab-header-format"];
const check = (header) => rule({ header })[0];

test("accepts standard [category] Type: Subject headers", () => {
    assert.equal(check("[pkg] Add: utils history 모듈"), true);
    assert.equal(check("[memory] Modify: 훅 시스템 메모리 갱신"), true);
    assert.equal(check("[docs] Improve: README 버전 테이블 반영"), true);
});

test("accepts the [export] sync convention for session exports", () => {
    assert.equal(check("[export] sync: 2026-08-07-6d7597c7.md"), true);
});

// 부정 경로: 형식 위반 거부
test("rejects unknown categories and types", () => {
    assert.equal(check("[unknown] Add: something"), false);
    assert.equal(check("[pkg] sync: 일반 카테고리에는 sync 불가"), false);
    assert.equal(check("[export] Add: export는 sync 형식만 허용"), false);
});

// 경계: 빈 값·유사 형식
test("rejects empty or malformed headers", () => {
    assert.equal(check(""), false);
    assert.equal(check("[export] sync:"), false);
    assert.equal(check("pkg Add: 대괄호 누락"), false);
});
