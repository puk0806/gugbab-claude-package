---
name: Report work before commit/push
description: 사용자는 커밋·푸시 전에 어떤 작업을 했는지 명세 보고를 받고 싶어함. 보고 후 명시 승인 받은 뒤에만 커밋·푸시 진행.
type: feedback
originSessionId: d5ff9d8b-0c2d-4d01-a471-63ec14d7d4bb
---
작업 완료 후 곧장 `git commit` / `git push` / `gh pr create` 시도하지 말 것. 먼저 사용자에게 **변경 내역 명세**(파일 단위 + 변경 요약)를 보고하고, 사용자의 명시 승인을 받은 뒤에 커밋·푸시 단계로 넘어간다.

**Why:** 2026-05-08, 사용자가 PR 1(LICENSE/README/메타) 작업 후 내가 검증만 끝내고 곧장 `git commit` 시도하자 도구 사용을 거부함 — "지금 어떤 작업 했는데 커밋 푸쉬하려는거야?? 나한테 보고하고 그다음에 커밋 푸쉬요청해". 사용자는 자신이 어떤 변경이 영구 기록되는지 미리 알고 결정하고 싶어함.

**How to apply:**

- 작업 완료 시점에 **보고 → 승인 → 커밋** 3단계로 진행
- 보고 형식: 변경 파일 목록(신규/수정 구분) + 각 파일 변경 요약 + 검증 결과(typecheck/test/biome 등)
- 사용자 응답 "OK", "커밋해줘", "진행해" 등 명시 승인 후에만 `git commit` 실행
- 단순 stash/임시 작업이라도 commit 하기 전에 보고는 동일하게 적용
- 본 규칙은 `feedback_commit_at_end`("다단계 누적 세션은 마지막에 한 번만 커밋")와 짝을 이룸 — 마지막 1회 커밋도 보고+승인 거쳐야 함
- PR description 작성 후 `gh pr create` 시점에도 동일 — push 전에 PR 본문도 보고하고 진행
