---
name: No worktrees - use feature branches + PR
description: 워크트리 사용 금지, 모든 작업은 feature/* 브랜치 + PR 흐름. 머지는 사용자가 직접 수행.
type: feedback
originSessionId: 268f6259-e0c4-4307-95bb-1011a203d11c
---
워크트리(`git worktree add`, `EnterWorktree`, `superpowers:using-git-worktrees`) 사용 금지. 모든 코드 변경·시각화 테스트·실험 작업은 `feature/{설명}` 피처 브랜치를 main에서 분기해 진행하고 PR로 머지한다.

**Why:** 사용자가 워크트리보다 표준 GitHub 흐름(브랜치 → PR → 머지)을 선호함. 시각화 테스트(`feature/vr-test-*`)도 동일하게 적용. 워크트리는 삭제·재생성 비용이 크고 PR 가시성이 떨어짐. 2026-05-07 결정.

**How to apply:**
- 작업 시작 시 `git checkout main && git pull && git checkout -b feature/{설명}`
- 브랜치 prefix는 `feature/`로 통일 (기능·버그·문서·설정·VR 테스트 모두)
- Claude는 구현 → 커밋 → `git push -u origin feature/...` → `gh pr create`까지 자동 수행
- **`gh pr merge`는 호출 금지** — 사용자가 GitHub UI에서 직접 머지
- 자세한 규칙은 `.claude/rules/git-workflow.md` 참조 (CLAUDE.md에서 로드됨)
- 봇이 만드는 `vrt-snapshots/*` 같은 자동화 브랜치는 예외 (Claude가 직접 만들지 않음)
