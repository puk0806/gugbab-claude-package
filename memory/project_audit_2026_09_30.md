---
name: project_audit_2026_09_30
description: "2026-09-30 전체 점검 — 1~4순위·styled 통합까지 6개 브랜치 전부 커밋(미푸시), 병합 시뮬레이션 GREEN. 남은 것: 푸시·D1~D4·Codex 설정"
metadata:
  node_type: memory
  type: project
  originSessionId: f35db723-e646-4a91-90c9-1860c939e8df
  modified: 2026-10-01T04:39:07.610Z
---

2026-09-30 전체 프로젝트 점검. a11y-auditor, security-auditor, codebase-domain-analyst, qa-engineer, pr-reviewer를 병렬로 돌렸다. 2026-10-01까지 모든 순위 작업을 마쳤다.

**브랜치 (모두 커밋, 미푸시 — 사용자가 마지막에 한 번에 푸시. PR은 사용자가 생성)**
- `feature/claude-assets-cleanup`: Claude 자산 정리 + memory/export
- `feature/fix-headless-priority1`: main 기준. 동작 버그, 메뉴 axe 위반(HoverCard role 제거·ContextMenu 트리거 aria 제거·Menubar 트리거 menuitem), Accordion.Header `level`, Toast `closeLabel`, ref 병합 안정화(useMergedRefs)
- `feature/fix-security-priority2`: main 기준
- `feature/refactor-structure-priority3`: **priority2 위에 쌓임**(utils/src/sse 공동 수정). 테스트 파일 타입 검사를 켬
- `feature/a11y-priority4`: main 기준. 포커스·대비, NavigationMenu Escape·`active`, tokens CSS 인젝션 스캐너, reduced-motion·forced-colors·24px 히트 영역, 오버레이 context 메모
- `feature/refactor-styled-factory`: main 기준. styled-mui/radix 래퍼 32종을 private `@gugbab/styled-factory`(`create<Name>(prefix)`)로 통합, tsup이 번들에 포함
- **권장 머지 순서:** cleanup → 1 → 2 → 3 → 4 → styled-factory. 이 순서로 `git merge-tree`와 `git archive`로 합친 트리에서 build·typecheck·test 29/29와 biome가 GREEN이다
- feature PR 머지 = npm 자동 게시. 머지 시점은 사용자가 정한다. 4순위는 기본 외관이 바뀌므로 PR에서 VR `accept-baseline`이 필요하다

**교훈 (병합 시뮬레이션이 잡은 것):** 텍스트 충돌이 없어도 브랜치 사이 의미 충돌이 생긴다. 3순위의 테스트 타입 검사와 1·4순위 새 테스트, 1순위의 headless Biome 활성화와 3순위 파일 포맷, 전체 HTML 스냅샷과 headless 마크업 변경이 그랬다. 여러 브랜치를 만들면 합친 트리에서 검증한다. styled 스냅샷은 접두사 클래스 요소만 고정한다.

**전체 Claude 리뷰 (2026-10-01, 사용자 요청: Codex 대신 pr-reviewer 6개 병렬):**
- 반영: Toast onClickCapture 소실(1), 토큰 검사기 주석·url() 우회(4), 비모달 Dialog 포커스(4), RadioGroup dir 상속(4), NavigationMenu SSR 경고(4), SSE CR 구분자·재분할 비용(2), groupBy 호환(2), VR 라벨 env(2), private 참조 빌드 가드(styled-factory), codex 마커 추적 해제(cleanup)
- 오탐(테스트로 확인): 거부된 바깥 닫힘 뒤 포커스 유실, SSE BOM
- 설치본 자산의 끊긴 참조(agent-design.md·skill-tester 등)는 원본 세션(00-gugbab-claude)에 SendMessage로 제보했다
- semver 판단 대기: 1순위 DOM 계약 변경, 2순위 SSE·withRetry 동작 변경, 4순위 토큰 TypeError가 모두 minor다. major 여부는 사용자가 결정한다

**사용자 결정 대기:**
- D1 npm OIDC Trusted Publishing: 패키지 9개 등록 필요, pnpm publish의 OIDC 지원 미확인
- D2 relay-types 게시 승인 게이트와 main 직접 push
- D3 VR 워크플로우 job 분리
- D4 GitHub 설정 점검
- Codex: `~/.codex/config.toml`의 `model = "gpt-5.4"`가 ChatGPT 계정에서 400 오류를 낸다. 리뷰는 pr-reviewer로 대체했다

**후속 (미착수):** SSE 함수 제네릭화, 다음 major에서 safety_block 제거, CSS `var`·`data-*` 계약 테스트, `color-mix` 지원 브라우저 README 명시, dev 전용 취약점(vitest v4·uuid v11·esbuild)

**원본 레포 반영 대기:** 원본 세션이 제보 항목을 반영했지만 원본도 미커밋 상태다. 원본이 커밋되면 재설치한다(작성 도구 N, CLAUDE.md N).

**Why:** 감사 결과가 길어서 세션을 넘어가면 우선순위를 잃는다. 에이전트 지적에는 오탐이 섞여 있다.

**How to apply:** 작업은 계획 → TDD(RED 재현) 순서로 진행한다. 독립 리뷰를 받은 뒤 커밋하고, 여러 브랜치는 합친 트리로 검증한다. 관련: [[feedback_report_upstream_asset_bugs]], [[feedback_no_git_stash]]
