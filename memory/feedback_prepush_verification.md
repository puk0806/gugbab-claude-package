---
name: Pre-push verification must include frozen-lockfile install
description: 푸시 전 재검증 시 CI가 강제하는 첫 단계인 `pnpm install --frozen-lockfile`을 반드시 포함한다. 일반 install로 통과한 상태는 CI에서 깨질 수 있다.
type: feedback
originSessionId: current
---
푸시 전 로컬 재검증에는 **CI가 가장 먼저 강제하는 단계**를 *반드시* 포함한다. 특히 `pnpm install --frozen-lockfile` — 일반 `pnpm install` 은 lockfile 을 silently 업데이트하므로 mismatch 를 감지하지 못한다.

**Why:** 2026-05-11 v1.0.1 push 후 PR #23 의 두 워크플로우(`publish-dry-run`, `visual-regression`)가 15초 내 즉시 실패함. 원인은 `packages/utils/package.json` 의 `type-fest` devDep 제거가 `pnpm-lock.yaml` 에 동기화되지 않은 상태로 푸시된 것. 로컬에서 typecheck/test/biome/build 를 다 돌렸음에도 일반 install 로는 lockfile 이 자동 보정되어 통과했고, CI 의 `--frozen-lockfile` 단계에서야 드러남. 사용자: "커밋 푸쉬전에 저런거 확인도 안한거야???".

**How to apply:**

- 푸시 전 재검증 표준 체크리스트(이 순서로 수행):
  1. `pnpm install --frozen-lockfile` — lockfile 무결성. **이 단계가 첫 번째**
  2. `pnpm typecheck` (또는 `turbo run typecheck`)
  3. `pnpm test`
  4. `pnpm run ci` (biome ci)
  5. `pnpm build`
- 1단계 실패 시 → `pnpm install` 로 lockfile 동기화 후 그 변경을 별도 fixup 커밋으로 포함시켜 다시 푸시 검증
- `package.json` 변경(dep add/remove/version bump)이 단 1건이라도 포함되면 1단계는 *생략 불가*
- `git status` 가 clean 이라고 안심하지 말 것 — lockfile 이 stage 됐어도 *내용이 stale* 할 수 있다
- 본 규칙은 `feedback_report_before_commit` + `feedback_commit_at_end` 와 짝을 이룬다. 보고 단계의 "검증 결과" 항목에 frozen-lockfile install 결과도 명시
