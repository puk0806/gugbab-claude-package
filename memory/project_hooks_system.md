---
name: Claude hooks system — 28개 운영 중
description: .claude/hooks/ 28개 훅의 역할 구분과 핵심 동작. 메모리 동기화·Codex 리뷰 자동화·품질 가드 포함.
type: project
originSessionId: bfc7802b-aa36-406e-b08b-1c96c782b326
---
2026-06-15 기준 28개 훅 운영 중 (PR #26). Codex 3라운드 적대적 리뷰로 안전성 버그 7건 수정 포함.

**Why:** 메모리 자동 동기화, Codex 코드 리뷰 강제, 품질 가드(README 동기화, TypeScript 타입 오류 사전 차단 등)를 훅으로 자동화.

**How to apply:**
- 훅 파일 수정 시 biome.json의 `.claude/**` 제외 설정 덕분에 lint 걱정 없음
- memory 파일은 반드시 Write/Edit 도구로만 수정 (Bash 금지 — memory-sync.js 감지 불가)
- Stop 시 `.claude/.codex-review-done` 없으면 codex-review-guard가 리뷰 강제 실행

## 카테고리별 핵심 훅

| 카테고리 | 파일 | 핵심 동작 |
|----------|------|-----------|
| 메모리 동기화 | memory-sync.js | PostToolUse Write/Edit → memory/ 변경 감지 → commit + push |
| 메모리 동기화 | memory-pull.js | SessionStart → main/master에서만 원격 pull + symlink 설정 |
| 메모리 동기화 | memory-stop-guard.js | Stop → 미sync memory 재시도 (upstream 없으면 push 스킵) |
| Codex 리뷰 | codex-review-guard.js | Stop → .codex-review-done 없으면 리뷰 강제 |
| 품질 가드 | readme-guard.js | CLAUDE_PROJECT_DIR 기준 루트 README만 감지 |
| 품질 가드 | typescript-quality.js | 로컬 node_modules/.bin/tsc 탐색 (npx 불사용) |
| 품질 가드 | pending-test-guard.js | PENDING_TEST 스킬 세션 종료 차단 |

## memory-sync.js 핵심 설계 (버그 수정 후)

- partial hunk staging 보존: `git diff --cached --binary` → unstage → memory commit → `git apply --cached`
- non-memory staged 파일은 unstage 후 memory commit, 다시 re-stage
- push 조건: upstream 추적 브랜치 있고 `[memory]` 커밋 1개만 앞선 경우만
