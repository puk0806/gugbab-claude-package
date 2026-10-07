---
name: feedback_no_unrequested_automation
description: "요청하지 않은 지속 자동화(Dependabot, 봇, 스케줄 워크플로우 등)는 넣지 않는다 — 필요하면 따로 짚어 명시 승인"
metadata:
  node_type: memory
  type: feedback
  originSessionId: f35db723-e646-4a91-90c9-1860c939e8df
  modified: 2026-10-07T01:12:31.470Z
---

사용자가 요청하지 않은 **계속 동작하는 자동화**(Dependabot, 스케줄 워크플로우, 자동 PR·자동 머지 봇 등)는 추가하지 않는다. 필요하다고 판단되면 계획 목록 속 한 줄로 묻어 두지 말고, 그것만 따로 짚어 명시 승인을 받는다.

**Why:** 2026-09-30 2순위 보안 작업에서 "액션 SHA 고정 + Dependabot"을 한 항목으로 묶어 넣었다. 10-01에 PR 5개가 갑자기 열리자 사용자가 "저런 기능을 키라고 한 적이 없는데"라고 지적했고, 10-07에 "당장 꺼"라고 결정했다. 일회성 수정과 달리 이후 계속 PR·작업을 만들어 내는 기능이라 사용자의 관리 부담이 생긴다.

**How to apply:** 감사·보안 작업 중에도 자동화 추가는 별도 결정 항목으로 분리해 보고한다. 기존 자동화를 바꾸는 것(예: release.yml 수정)은 요청 범위 안이면 괜찮지만, 새 봇·새 주기 작업은 반드시 따로 묻는다. 관련: [[project_npm_v1_publishing]]
