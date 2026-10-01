---
name: npm v1 publishing — DONE (v1.0.1 + auto-merge)
description: @gugbab/* 9개 v1.0.0 (2026-05-09) + 5개 v1.0.1 (2026-05-11) publish 완료. 자동 publish 흐름은 feature PR 머지 1회로 끝나도록 진화.
type: project
originSessionId: d38b63bc-10e0-4db4-8ff1-14cf943313c2
modified: 2026-10-01T08:47:11.887Z
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

## 2026-08-14 auto-merge 폴백 (utils 1.3.0 release 중 발견)

**문제:** Version PR auto-merge 가 `GraphQL: Pull request Branch does not have required
protected branch rules (enablePullRequestAutoMerge)` 로 실패 — main 에 branch protection
rule 이 없으면 GitHub 이 auto-merge 자체를 거부한다 (05-11 당시엔 ruleset 이 있었으나 이후 부재).
Version PR #40 이 열린 채 방치 → 사용자 수동 머지로 publish 완료.

**해결 (release.yml):** auto-merge 실패 시 `gh pr merge --merge` 로 즉시 직접 머지 폴백.
핵심 함정 — **GITHUB_TOKEN 이 만든 push 는 on:push 워크플로우를 재트리거하지 않는다**
(GitHub 재귀 방지 정책, `workflow_dispatch`·`repository_dispatch` 만 예외 — 공식 문서 확인).
따라서 폴백 직후 `gh workflow run release -f mode=changeset` 으로 publish 를 명시 재트리거.
`changeset publish` 는 npm 에 이미 있는 버전을 건너뛰므로 중복 실행 안전.

## 2026-10-01 엄격 보호 복원 (05-11 결정 대체)

05-11에 필수 검사를 뺀 탓에 시각 회귀가 도는 중이거나 실패해도 머지 버튼이 열려 있었다(PR #50에서 사용자가 발견하고 "매우 큰 이슈"로 지적).

- **main ruleset (id 15765729):** 브랜치 삭제 금지, 강제 푸시 금지, **PR 필수(승인 0)**, **필수 검사 `ci`·`visual-regression`(GitHub Actions 15368, strict)**, **우회 없음**
- **`ci.yml` 신설:** frozen install, `biome ci`, typecheck, test, build
- **봇 PR 처리:** Version PR과 relay-types baseline PR은 `scripts/ci-verify-bot-pr.sh`로 처리한다. 허용 파일만 바뀌었는지 확인하고, 같은 전체 검사를 돌린 뒤 `ci`·`visual-regression` 성공 상태를 등록하고 머지한다. 봇 bypass(422) 없이 자동 배포를 유지하는 방법이다. release는 머지 후 `workflow_dispatch`로 publish를 재트리거한다
- **archive:** main 대신 `vrt-archive` 브랜치에 보관(삭제 금지 ruleset에 포함)
- **저장소 `allow_auto_merge`를 false로 되돌림:** 켜져 있으면 검사가 진행 중일 때 초록 "Enable auto-merge" 버튼이 떠서 머지가 열린 것처럼 보이고, 누르면 검사 통과 즉시 사람 확인 없이 머지된다. 세 앱과 동일하게 맞췄다. release는 auto-merge 대신 검증 후 직접 머지한다
- **accept-baseline 커밋의 ci 승계:** 봇 push라 ci가 돌지 않는다. 스크린샷만 바뀌었고 직전 커밋 ci가 성공했을 때만 `ci` 상태를 이어받는다(visual-regression.yml)
- **알아둘 점:** `visual-regression-baseline.yml`(봇 PR, 수동)은 검사가 돌지 않는다. 그 브랜치에 사용자가 한 번 푸시해야 검사가 돈다. voca·dream·health도 같은 기준으로 통일할 예정이다 — [[project_audit_2026_09_30]]

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
- **2026-10-01 만료로 publish 실패:** `NPM_TOKEN`을 06-16에 등록했고 09-14에 만료됐다. #50 머지 → Version PR #56 자동 머지까지는 정상이었지만, publish 단계에서 6개 패키지가 모두 `E404 Not Found - PUT`으로 실패했다(만료 토큰은 404로 보인다). 재발급하면 `gh workflow run release --ref main -f mode=changeset`으로 다시 게시한다. 첫 재발급 토큰은 "Bypass 2FA"가 꺼져 있어 EOTP로 또 실패했고, 세 번째 토큰(Secret 갱신 2026-10-01 07:22 UTC)으로 6개 게시에 성공했다. **이 토큰은 약 2026-12-30에 만료된다(90일). publish 전에 `gh secret list`로 NPM_TOKEN 날짜를 확인할 것**(날짜 + 90일)
- 갱신 주기: 만료 1주 전 알림 보고 새 토큰 발급 + GitHub Secret 갱신
- Token: 발급 직후 한 번만 노출 → 즉시 GitHub Secret 에 저장
- Provenance: GitHub Actions OIDC + sigstore 자동 서명 (`--provenance` 플래그)
