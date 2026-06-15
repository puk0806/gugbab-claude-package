---
name: npm v1 publishing — DONE (v1.0.1 + auto-merge)
description: @gugbab/* 9개 v1.0.0 (2026-05-09) + 5개 v1.0.1 (2026-05-11) publish 완료. 자동 publish 흐름은 feature PR 머지 1회로 끝나도록 진화.
type: project
originSessionId: d38b63bc-10e0-4db4-8ff1-14cf943313c2
---
`@gugbab/*` 패키지 npm public 게시 자동화 운영 중. v1.0.0 (9 패키지) 첫 publish 2026-05-09, v1.0.1 (5 publishable patch) 2026-05-11. 2026-05-11 자동화 한 단계 진화 — *사용자 머지 1회로 publish까지 자동*.

**Why:** 다른 프로젝트에서 `npm install @gugbab/*` 가 가능해야 했고, CI 자동화로 운영 부담 없이 minor/patch 게시까지 자동화하기 위함.

**How to apply (다음 publish):**

1. 코드 작업 + `pnpm changeset add` 로 changeset 작성
2. feature PR 만들고 visual-regression 결과 확인 후 머지 ← *사용자 클릭 1회로 끝*
3. 이후 자동: Version PR 생성 → auto-merge → release.yml 재실행 → `pnpm changeset publish` → npm 게시 + git tag

---

## 게시 이력

### v1.0.0 (2026-05-09) — 9 패키지

1. `@gugbab/tsconfig@1.0.0`
2. `@gugbab/biome-config@1.0.0`
3. `@gugbab/commitlint-config@1.0.0`
4. `@gugbab/utils@1.0.0`
5. `@gugbab/hooks@1.0.0`
6. `@gugbab/headless@1.0.0`
7. `@gugbab/tokens@1.0.0`
8. `@gugbab/styled-mui@1.0.0`
9. `@gugbab/styled-radix@1.0.0`

### v1.0.1 (2026-05-11) — 5 publishable patch (RSC + SSR + 캡슐화 + 최적화)

1. `@gugbab/utils@1.0.1`
2. `@gugbab/hooks@1.0.1`
3. `@gugbab/headless@1.0.1`
4. `@gugbab/styled-mui@1.0.1`
5. `@gugbab/styled-radix@1.0.1`

확인: https://www.npmjs.com/org/gugbab/packages

---

## 2026-05-11 자동화 진화 (PR #25)

**문제:** v1.0.1 release 시 사용자가 feature PR + Version PR 2번 머지 필요. Version PR 은 봇 PR 이라 main ruleset 의 `required_status_checks: visual-regression` 통과 불가 → 머지 BLOCKED.

**해결 (옵션 a — 사용자 결정):**

1. **Repo `allow_auto_merge: true`** 활성화
2. **main ruleset 의 `required_status_checks` rule 제거**
   - `deletion` + `non_fast_forward` rule 은 유지 (main 보호)
   - 봇 bypass actor 추가는 *personal repo 에서 422 Validation Failed* — Integration bypass 는 Org repo 만 가능
   - 시각화 안전망은 *feature PR 단계*에서 그대로 자동 실행 + 사용자 검토. Version PR 은 코드 변경 0줄이라 검증할 게 없음
3. **release.yml `Enable auto-merge on Version PR` step 추가**
   - `changesets/action` 직후 `gh pr merge --auto --squash` 호출
   - `pullRequestNumber` output 이 있을 때만 실행 (publish 모드면 skip)

**효과:** 사용자 머지 1회 (feature PR) → Version PR 자동 머지 → publish 자동.

---

## 첫 publish 가 막혔던 5-layer 장애 (참고용)

| # | 장애 | 해결 |
|---|------|------|
| 1 | npm Org `gugbab` 미존재 | npm.com 에서 Free Org 생성 |
| 2 | NPM_TOKEN 권한/시점 misalignment | Granular Token 재발급 (scope=@gugbab, R/W) |
| 3 | release.yml `NODE_AUTH_TOKEN` env 누락 | 두 publish step 모두에 env 추가 |
| 4 | 사용자 2FA 모드 `auth-and-writes` | Settings → "Require 2FA for write actions" 해제 → `auth-only` |
| 5 | **Granular Token "Bypass 2FA" 옵션 OFF** | 토큰 재발급 시 체크박스 ON ← 숨겨진 핵심 |

**가장 비싸게 배운 교훈:** npm Granular Token 은 "Bypass 2FA" 체크박스가 별도이고 default OFF. 이걸 안 켜면 사용자 모드를 auth-only 로 바꿔도 token 자체에 박힌 정책이 우선해서 publish 시 EOTP 가 발생함. 신규 token 발급 시 반드시 체크해야 한다.

## v1.0.1 release 에서 추가로 배운 것

- **`pnpm install --frozen-lockfile` 을 푸시 전 재검증 1단계에 포함**해야 한다. v1.0.1 push 직후 CI 가 `ERR_PNPM_OUTDATED_LOCKFILE` 로 즉시 실패한 사건. `packages/utils/package.json` 의 type-fest devDep 제거가 `pnpm-lock.yaml` 동기화 누락. (별도 메모리: `feedback_prepush_verification.md`)
- **personal repo 의 ruleset 은 GitHub Actions 봇 bypass 가 안 된다** (`Integration` actor 422). Org owned repo 만 가능. 자동화를 위해 `required_status_checks` rule 자체를 제거하는 게 현실적.

## 운영 메모

- 토큰 만료: 90일 (npm 신규 정책 max)
- 갱신 주기: 만료 1주 전 알림 보고 새 토큰 발급 + GitHub Secret 갱신
- Token: 발급 직후 한 번만 노출 → 즉시 GitHub Secret 에 저장
- Provenance: GitHub Actions OIDC + sigstore 자동 서명 (`--provenance` 플래그)
