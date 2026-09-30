---
name: project_audit_2026_09_30
description: "2026-09-30 전체 점검(에이전트 5종 병렬 감사) 결과 우선순위 목록과 진행 상황 — 1순위 완료(미커밋), 2~4순위 대기"
metadata:
  node_type: memory
  type: project
  originSessionId: f35db723-e646-4a91-90c9-1860c939e8df
  modified: 2026-09-30T05:08:07.257Z
---

2026-09-30 전체 프로젝트 점검. a11y-auditor, security-auditor, codebase-domain-analyst, qa-engineer, pr-reviewer를 병렬로 돌렸다. 빌드·타입·테스트·biome는 모두 GREEN이었다.

**1순위 (동작 버그): 완료, 미커밋**
- 계획서: `docs/superpowers/plans/2026-09-30-headless-priority1-fixes.md`
- 반영: useControllableState StrictMode 이중 onChange, Combobox 목록 누적 + Enter 선택(IME 가드) + data-highlighted, RovingFocusGroup 컨테이너 tabIndex -1, 가로 Slider Up/Down
- changeset: hooks patch, headless minor
- FocusScope StrictMode 지적은 **오탐**이었다. container가 state로 들어와서 최초 이중 effect 때는 null이다. TDD RED 단계에서 재현되지 않아 수정하지 않았다.

**대기 중인 우선순위**
- 2순위 보안: GitHub Actions를 SHA로 고정, npm OIDC Trusted Publishing, visual-regression의 `head.ref` 인젝션과 write 권한, SSE 버퍼 상한과 이벤트 검증, groupBy의 `__proto__` 크래시, useSSEChat 언마운트 abort
- 3순위 구조: `workspace:*` → `workspace:^`, headless의 미사용 utils dep, styled-*의 tokens 경로 참조와 turbo globalDependencies, styled-mui/radix 복제, utils SSE 타입의 relay 전용 `safety_block`, tokens README의 잘못된 API
- 4순위 스타일 a11y: Select/Combobox 항목과 Tabs 패널의 포커스 표시, 무효한 `rgba(var(hex))` 포커스 링, 비텍스트 대비. 그 외 a11y Major로 RadioGroup RTL, Popover 바깥 클릭 포커스, Dialog 트리거 복귀, DropdownMenu RTL 서브메뉴가 있다.

**Why:** 감사 결과가 길어서 세션을 넘어가면 우선순위를 잃는다. 에이전트 지적에는 오탐이 섞여 있어서, 반드시 RED 재현 후에 수정해야 한다.

**How to apply:** 다음 우선순위도 계획서 → 승인 → TDD 순서로 진행한다. 수정 전에는 지적 사항을 테스트로 재현해 확인한다. 관련 메모리: [[feedback_report_upstream_asset_bugs]]
