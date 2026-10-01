---
name: feedback_single_pr
description: 여러 작업 단위도 커밋을 관심사별로 나누면 PR은 하나로 충분 — 브랜치·PR을 작업 단위마다 쪼개지 않는다
metadata:
  node_type: memory
  type: feedback
  originSessionId: f35db723-e646-4a91-90c9-1860c939e8df
  modified: 2026-10-01T05:01:40.898Z
---

한 세션의 여러 작업(예: 감사 1~4순위·리팩터링)은 커밋을 관심사별로 나누고 **PR은 하나**로 만든다. 2026-10-01에 PR 6개(#44~#49)를 만들었더니 사용자가 "커밋을 여러 번 했을 뿐 PR은 하나여도 되잖아"라고 해서 단일 PR로 합쳤다.

**Why:** 브랜치 6개를 따로 들고 가면 브랜치마다 설정 차이(Biome·테스트 타입 검사)로 의미 충돌이 생겨 합친 트리 검증을 반복해야 했고, 머지 순서 관리와 PR 6번 머지가 사용자 부담이었다.

**How to apply:** 큰 작업은 feature 브랜치 하나에서 관심사별 커밋으로 진행하고 PR 하나로 올린다. 정말 독립적으로 배포 시점을 달리해야 할 때만 PR을 나눈다(그때도 사용자에게 먼저 묻는다). 관련: [[feedback_no_worktrees_use_feature_branch]], [[project_audit_2026_09_30]]
