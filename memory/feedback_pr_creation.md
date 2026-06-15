---
name: feedback_pr_creation
description: PR 생성은 사용자가 직접 — Claude는 gh pr create 호출 금지
metadata: 
  node_type: memory
  type: feedback
  originSessionId: bfc7802b-aa36-406e-b08b-1c96c782b326
---

PR 생성은 사용자가 직접 수행한다. Claude는 `gh pr create`를 호출하지 않는다.

**Why:** 사용자가 직접 PR을 만들겠다고 명시적으로 요청.

**How to apply:** 브랜치 push 완료 후 PR URL 대신 브랜치 push 완료 사실만 보고한다. PR 생성 단계는 사용자에게 위임.
