---
name: Claude hooks system
description: .claude/hooks/ 훅 시스템(실행 훅 21종 + _lib + statusline)의 역할 구분과 핵심 동작. 메모리·세션 export 동기화, Codex 리뷰, 품질 가드.
type: project
originSessionId: bfc7802b-aa36-406e-b08b-1c96c782b326
---
2026-07-08 기준 훅 23종(실행 훅 21종 + `_lib.js` + `statusline.sh`) 운영 중. 상세 목록은 `docs/hooks/README.md`가 단일 소스.

**Why:** 메모리·세션 기록 자동 동기화, Codex 코드 리뷰 강제, 품질 가드(README 동기화, TS 타입 오류 사전 차단 등)를 훅으로 자동화.

**How to apply:**
- memory·exports 파일은 반드시 Write/Edit 도구로만 수정 (Bash 금지 — memory-sync.js 감지 불가)
- 훅 self-commit과 Claude의 git 명령이 index.lock 경합 → **git 커밋·add는 재시도 루프 필수**
- 훅 자동 커밋에는 `--no-verify` 필수 — commitlint(gugbab-header-format)가 `[memory] sync:` 등 훅 메시지 형식을 거부함. 새 훅에 self-commit 추가할 때 잊지 말 것
- Stop 시 `.claude/.codex-review-done` 없으면 codex-review-guard가 리뷰 강제 실행

## 카테고리별 핵심 훅

| 카테고리 | 파일 | 핵심 동작 |
|----------|------|-----------|
| 메모리 동기화 | memory-sync.js | PostToolUse Write/Edit → memory/ 변경 감지 → `[memory] sync` 커밋 (push는 사용자) |
| 메모리 동기화 | memory-pull.js | SessionStart → main에서만 원격 pull + symlink 설정 |
| 메모리 동기화 | memory-stop-guard.js | Stop → 미커밋 memory 커밋 |
| 세션 기록 | session-export.js | Stop → 세션 요약을 exports/에 저장 + `[export] sync` 커밋 |
| Codex 리뷰 | codex-review-guard.js | Stop → .codex-review-done 없으면 리뷰 강제 |
| 품질 가드 | readme-guard.js / typescript-quality.js / pending-test-guard.js / tdd-guard.js / deliverable-guard.js 등 | README 동기화·tsc 오류·PENDING_TEST·TDD·산출물 검증 |

## 이력 (요약)

- 2026-06-15: Codex 3라운드 리뷰로 memory 훅 index isolation 버그 수정 — pathspec 한정 커밋, partial staging 보존(`git diff --cached --binary` → unstage → memory commit → `git apply --cached`), agent-md-guard 전체 파일 검증
- 2026-07-08: **훅 self-commit 전멸 버그 발견·수정** — commitlint 강화(6/17경) 이후 훅 자동 커밋이 전부 조용히 실패(stdio:pipe), memory/exports가 staged로만 쌓임. 4개 훅(memory-sync·memory-stop-guard·memory-pull·session-export)에 `--no-verify` 적용. session-export.js 신규 추가. 가드 훅 4종 판정 조정(branch-protection 멀티라인 오탐, codex rename 판정, deliverable 단순화, bash-guard workflows 완화)
