---
name: feedback_no_git_stash
description: 이 레포에서는 git stash push/pop으로 임시 비교를 하지 않는다 — 기존 stash 항목이 있어 pop이 엉뚱한 변경을 적용한다
metadata:
  node_type: memory
  type: feedback
  originSessionId: f35db723-e646-4a91-90c9-1860c939e8df
  modified: 2026-09-30T06:56:46.975Z
---

"원래 구현으로 RED 재현" 같은 임시 비교에 `git stash push -- <path>` / `git stash pop`을 쓰지 않는다. 대신 파일 사본을 scratchpad에 저장하고, 비교할 부분만 바꿔서 테스트한 뒤 사본으로 복원한다(`cmp`로 복원 확인). 원래 파일이 필요하면 `git show HEAD:<path>`를 쓴다. (브랜치를 전환하기 전에는 memory 미러 파일이 untracked로 남아 checkout을 막을 수 있다. 전역과 `cmp`한 뒤 치운다.)

**Why:** 2026-09-30 stash push가 조용히 실패(패키지 하위 디렉토리에서 실행, `-q`로 에러가 숨음)한 상태에서 `stash pop`이 사용자의 기존 항목 `stash@{0}: On main: session unstaged work`를 꺼냈다. 그 결과 `.claude/hooks` 5개 파일에 충돌이 나고 untracked 파일이 섞였다. 파일별로 stash 사본과 `cmp`해 확인한 뒤 HEAD로 복구해서 손실은 없었다. 사용자의 stash 항목은 보존했다.

**How to apply:** 작업 트리를 되돌려 비교해야 할 때는 사본으로 교체한 뒤 복원한다. 사용자의 stash 항목은 절대 pop·drop하지 않는다. 관련: [[feedback_report_before_commit]]
