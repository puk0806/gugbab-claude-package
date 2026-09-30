---
name: project_audit_2026_09_30
description: "2026-09-30 전체 점검 결과와 진행 상황 — 1~3순위 완료·커밋(미푸시, 4개 브랜치), 4순위·결정 D1~D4·후속 작업 대기"
metadata:
  node_type: memory
  type: project
  originSessionId: f35db723-e646-4a91-90c9-1860c939e8df
  modified: 2026-09-30T06:56:42.465Z
---

2026-09-30 전체 프로젝트 점검. a11y-auditor, security-auditor, codebase-domain-analyst, qa-engineer, pr-reviewer를 병렬로 돌렸다. 빌드·타입·테스트·biome는 모두 GREEN이었다.

**브랜치 상태 (모두 커밋, 미푸시 — 사용자가 마지막에 한 번에 푸시)**
- `feature/claude-assets-cleanup`: Claude 자산 정리 + memory/export
- `feature/fix-headless-priority1`: main 기준
- `feature/fix-security-priority2`: main 기준
- `feature/refactor-structure-priority3`: **priority2 위에 쌓임**(utils/src/sse 공동 수정). 머지 순서는 2 → 3
- feature PR 머지 = npm 자동 게시. 1·2·3순위 모두 hooks·utils·headless 등을 bump하므로 머지 순서와 시점은 사용자가 정한다

**1순위 (동작 버그): 완료** — 계획서 `docs/superpowers/plans/2026-09-30-headless-priority1-fixes.md`
- 반영: useControllableState StrictMode 이중 onChange, Combobox 목록 누적 + Enter 선택(IME 가드) + data-highlighted, RovingFocusGroup 컨테이너 tabIndex -1, 가로 Slider Up/Down
- FocusScope StrictMode 지적은 **오탐**이었다. container가 state로 들어와서 최초 이중 effect 때는 null이다

**2순위 (보안): 완료** — 계획서 `docs/superpowers/plans/2026-09-30-security-priority2-fixes.md`
- 반영: groupBy 예약 키, parseSSELine 정규화, readSSEStream maxBufferSize와 cancel, useSSEChat 언마운트/Activity 정리, 액션 10종 SHA 고정과 dependabot, head.ref의 env 전달, checkout head.sha, `.env.*`
- **사용자 결정 대기:**
  - D1 npm OIDC Trusted Publishing: 패키지 9개 등록 필요, pnpm publish의 OIDC 지원 미확인
  - D2 relay-types 게시 승인 게이트와 main 직접 push
  - D3 VR 워크플로우 job 분리
  - D4 GitHub 설정 점검

**3순위 (구조): 완료** — 기록 `docs/superpowers/plans/2026-09-30-structure-priority3.md`
- `workspace:*` 유지: Radix·Chakra·Ark·React Aria·TanStack 게시본 조사 결과 정확 고정이 다수였다. peer 전환도 하지 않는다(사용자 확정)
- styled에서 DirectionProvider 재수출, SSE 타입 확장 지점과 safety_block deprecated, headless 미사용 utils 제거, 빌드 스크립트 tokens 해석과 누락 시 실패, turbo scripts 캐시 키, tokens README
- 보류: styled-mui/radix 복제 통합
- 후속: 테스트 파일 타입 검사를 CI에 포함(기존 TS 오류 3건 방치), SSE 함수 제네릭화, 다음 major에서 safety_block 제거

**4순위 (대기):** 스타일 a11y(Select/Combobox 항목과 Tabs 패널 포커스 표시, 무효한 `rgba(var(hex))` 포커스 링, 비텍스트 대비 3:1). 토큰 색을 바꾸면 VR 기준 이미지가 갱신된다. 남은 a11y Major는 RadioGroup RTL, Popover 바깥 클릭 포커스, Dialog 트리거 복귀, DropdownMenu RTL 서브메뉴다. 테스트 보강(qa 추천 10건)도 남아 있다.

**원본 레포 반영 대기:** 원본 세션이 제보 항목을 반영했지만 원본도 미커밋 상태다. 원본이 커밋되면 재설치한다(작성 도구 N, CLAUDE.md N). `_lib.js` 폐지로 훅 수가 바뀌므로 README를 동기화해야 한다.

**Why:** 감사 결과가 길어서 세션을 넘어가면 우선순위를 잃는다. 에이전트 지적에는 오탐이 섞여 있다.

**How to apply:** 다음 작업도 계획서 → 승인 → TDD 순서로 진행한다. 수정 전에는 지적 사항을 테스트로 재현해 확인한다. 관련: [[feedback_report_upstream_asset_bugs]], [[feedback_no_git_stash]]
