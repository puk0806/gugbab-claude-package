---
name: Claude hooks system
description: .claude/hooks/ 훅 시스템(실행 훅 21종 + _lib + statusline)의 역할 구분과 핵심 동작. 메모리 미러 동기화, Codex 리뷰, 품질·적대적 테스트 가드.
type: project
originSessionId: bfc7802b-aa36-406e-b08b-1c96c782b326
modified: 2026-09-04T00:09:11.642Z
---
2026-09-04 기준 훅 23종(실행 훅 21종 + `_lib.js` + `statusline.sh`) 운영 중. 상세 목록은 `docs/hooks/README.md`가 단일 소스.

**Why:** 메모리·세션 기록 동기화, Codex 코드 리뷰 강제, 품질 가드(README 동기화, TDD, 적대적 테스트 커버리지, 가짜 구현 차단 등)를 훅으로 자동화.

**How to apply:**
- memory·exports 파일은 반드시 Write/Edit 도구로만 수정 (Bash 금지 — memory-sync.js 감지 불가)
- **훅은 git commit을 절대 수행하지 않는다** (2026-07-10 개편 — 자동 커밋 폐지). 전역 `~/.claude/projects/<해시>/memory/`가 1차 저장소(실디렉토리), 레포 `memory/`는 미러. 커밋·푸시는 사용자 요청 시 배치로만
- 커밋·푸시 요청 시 선행 절차: 낡은 memory 갱신 → `session-export.js --refresh` → 미러 diff 확인 → `[memory]`/`[export]` 커밋을 같은 배치에 포함 (deliverable-guard가 push/PR 직전 memory·exports 미커밋을 차단)
- PostToolUse/PreToolUse 차단 훅(exit 2)의 메시지는 **stderr**로 출력해야 모델에 전달됨 (stdout은 유실 — tdd-guard·adversarial-test-guard·fake-impl-guard에서 수정 이력)
- Stop 시 `.claude/.codex-review-done` 없으면 codex-review-guard가 리뷰 강제 (codex CLI 미설치 머신은 조용히 통과)

## 카테고리별 핵심 훅

| 카테고리 | 파일 | 핵심 동작 |
|----------|------|-----------|
| 메모리 동기화 | memory-sync.js | PostToolUse Write/Edit → 전역↔레포 양방향 미러 복사 (git 조작 없음) |
| 메모리 동기화 | memory-pull.js | SessionStart → 전역 실디렉토리 보장(구 symlink 자동 마이그레이션) + 레포→전역 최신 반영 |
| 세션 기록 | session-export.js | Stop(매 턴)은 로컬 exports/에만 기록, 커밋 배치의 `--refresh` 시에만 레포 exports/ 생성 |
| Codex 리뷰 | codex-review-guard.js | Stop → .codex-review-done 없으면 adversarial-review 컴패니언 경로 안내·강제 |
| 품질 가드 | adversarial-test-guard.js | 테스트 2케이스↑인데 적대적 커버리지(에러/보안/경계) 2카테고리 미만이면 차단, waiver 주석 예외 |
| 품질 가드 | fake-impl-guard.js | 파라미터 무시하고 테스트 기대 리터럴 그대로 return하는 가짜 구현 차단 |
| 품질 가드 | deliverable-guard.js | README 동기화·PENDING_TEST 차단 + push/PR 직전 memory·exports 미커밋 차단 |

## 이력 (요약)

- 2026-06-15: Codex 3라운드 리뷰로 memory 훅 index isolation 버그 수정
- 2026-07-08: 훅 self-commit 전멸 버그 수정 (commitlint 거부 → `--no-verify`) — 이후 07-10 개편으로 self-commit 자체 폐지되어 과거 이력
- 2026-07-10~08-03: 메모리 구조 개편 — symlink·자동 커밋 폐지, 전역 1차 + 레포 미러. memory-stop-guard.js 제거. adversarial-test-guard·fake-impl-guard 신설(적대적 테스트·가짜 구현 차단, @.claude/rules/adversarial-testing.md). tdd-guard 교차 확장자·stderr 수정. codex 리뷰는 adversarial-review 컴패니언 경로로 전환
- 2026-09-03~04: 훅·rules 간소화 개편 — tdd-guard.js 제거(superpowers TDD 워크플로우로 대체, 테스트 "존재" 강제 훅 없음), typescript-quality `--changed-only`(베이스라인 대비 신규 에러만 차단), deliverable-guard 일부 이벤트 `--no-readme`. rules 4종 삭제(creation-workflow·verification-policy·readme-update·commands — 내용은 에이전트 MD·훅 메시지에 흡수). 개편 중 stderr→stdout 회귀 발생해 재수정(위 stderr 원칙 재확인)
