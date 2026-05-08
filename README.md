# gugbab-claude-package

Claude Code만을 이용해 구축·운영하는 **공용 프론트엔드 패키지 배포용 모노레포**.

프로젝트 방향·워크플로우는 [CLAUDE.md](./CLAUDE.md) 참조.

---

## 구조

```
01_gugbab-claude-package/
├── CLAUDE.md              # 프로젝트 지침
├── .claude/               # Claude Code 자산
│   ├── agents/            # 서브에이전트
│   ├── skills/            # 스킬
│   ├── hooks/             # 훅
│   ├── rules/             # 규칙 문서
│   └── settings.json      # Claude Code 설정·플러그인
├── .husky/                # Git 훅 (pre-commit / commit-msg / pre-push)
├── .changeset/            # Changesets 버전 기록
├── packages/              # 배포 대상 패키지 (@gugbab/*)
│   ├── tsconfig/          # @gugbab/tsconfig
│   ├── biome-config/      # @gugbab/biome-config
│   ├── commitlint-config/ # @gugbab/commitlint-config
│   ├── utils/             # @gugbab/utils
│   ├── hooks/             # @gugbab/hooks
│   ├── headless/          # @gugbab/headless (headless 컴포넌트 35종)
│   ├── tokens/            # @gugbab/tokens (정적 디자인 토큰 — MUI/Radix lookalike, 외부 의존성 0)
│   ├── styled-mui/        # @gugbab/styled-mui (MUI 외관 styled 35종)
│   └── styled-radix/      # @gugbab/styled-radix (Radix 외관 styled 35종)
├── apps/
│   ├── storybook-mui/     # @gugbab/storybook-mui (styled-mui 전용 쇼케이스)
│   └── storybook-radix/   # @gugbab/storybook-radix (styled-radix 전용 쇼케이스)
├── docs/                  # 에이전트·스킬 검증 문서 및 리서치
└── examples/              # CLAUDE.md 템플릿
```

## 배포 패키지 (@gugbab/\*)

| 패키지                           | 역할                        | 상태 |
| -------------------------------- | --------------------------- | ---- |
| `@gugbab/tsconfig`            | 공용 TS 프리셋 (base / react-library / node-library) | 0.0.1 |
| `@gugbab/biome-config`        | 공용 Biome 프리셋 (base.json) | 0.0.1 |
| `@gugbab/commitlint-config`   | 공용 commitlint 컨벤션 (`[category] Type: Subject`) | 0.0.1 |
| `@gugbab/utils`               | 프레임워크 독립 순수 유틸 (string/object/array/guard/fn/format, 22개 함수) | 0.0.1 |
| `@gugbab/hooks`               | 헤드리스 공용 React 훅 (lifecycle/ref/binding/state/dom, 11개 훅) | 0.0.1 |
| `@gugbab/headless`               | 헤드리스 React 컴포넌트 35종 + Form (Radix 1:1 ~90%, 426 tests) | 0.0.1 |
| `@gugbab/tokens`              | 추상 디자인 토큰 + 정적 MUI/Radix 스냅샷 → CSS variables (`dist/{mui,radix}.css`). 외부 라이브러리 의존성 0 | 0.0.1 |
| `@gugbab/styled-mui`          | MUI 외관 styled 컴포넌트 35종 (`gmui-*` 클래스, `dist/styles.css` 99 blocks) | 0.0.1 |
| `@gugbab/styled-radix`        | Radix 외관 styled 컴포넌트 35종 (`grx-*` 클래스, `dist/styles.css` 99 blocks) | 0.0.1 |

## 개발 워크플로우

| 단계         | 실행              | 검증 | 차단 |
| ------------ | ----------------- | ---- | :---: |
| pre-commit   | `lint-staged`     | staged 파일에 `biome check --write` | ✅ |
| commit-msg   | `commitlint`      | `[category] Type: Subject` 정규식 | ✅ |
| **pre-push** | `pnpm typecheck && pnpm exec biome ci .` | 전체 레포 typecheck + biome CI | ✅ |
| **pre-push** | `codex review --base <upstream>` | Codex 독립 리뷰 (advisory) | ❌ |

### Storybook (apps/storybook-mui · apps/storybook-radix)

두 시스템(`styled-mui`·`styled-radix`)을 각각 독립된 Storybook 앱으로 운영한다. 컴포넌트별 한국어 docs(컴파운드 구조 표·접근성·키보드 가이드 포함)는 `tags: ['autodocs']` + `parameters.docs.description` 방식으로 자동 페이지화된다.

| 명령                     | 설명                                                                  |
| ------------------------ | --------------------------------------------------------------------- |
| `pnpm sb:dev:mui`        | MUI 쇼케이스 dev 서버 — http://localhost:6006                         |
| `pnpm sb:dev:radix`      | Radix 쇼케이스 dev 서버 — http://localhost:6007                       |
| `pnpm sb:build:mui`      | 정적 빌드 → `apps/storybook-mui/storybook-static/`                    |
| `pnpm sb:build:radix`    | 정적 빌드 → `apps/storybook-radix/storybook-static/`                  |
| `pnpm vr`                | 양쪽 Storybook 시각 회귀 — Playwright + `toHaveScreenshot`            |
| `pnpm vr:mui` / `vr:radix` | 단일 시스템만 시각 회귀                                            |
| `pnpm vr:update`         | baseline 갱신 (양쪽). CI에서 자동 생성된 baseline만 commit한다        |
| `pnpm vr:report`         | 마지막 실행 HTML 리포트 열기 (`playwright-report/`)                   |

추가 인자는 그대로 전달된다 (`bash scripts/storybook-build.sh mui --skip-deps` 로 deps 빌드 생략 등).

> Storybook 10은 Node ≥20.19 또는 ≥22.12를 요구한다. 두 스크립트 모두 `scripts/_use-node22.sh` 헬퍼로 nvm에 설치된 Node 22.x(또는 20.19+)를 자동 PATH에 prepend 한다. nvm이 없으면 `NODE_BIN=/path/to/node-bin pnpm sb:dev:mui`로 직접 지정 가능.

Codex 리뷰 생략: `SKIP_CODEX=1 git push ...`

## Claude 자산 현황

### 에이전트 (22개)

| 카테고리       | 항목                                                                                          |
| -------------- | --------------------------------------------------------------------------------------------- |
| devops (1)     | devops-engineer                                                                               |
| domain (5)     | api-spec-designer, business-domain-analyst, codebase-domain-analyst, product-planner, ui-ux-designer |
| frontend (2)   | frontend-architect, frontend-developer                                                        |
| meta (6)       | agent-creator, claude-code-guide, freshness-auditor, planner, skill-creator, skill-tester     |
| research (5)   | competitor-analyst, data-analyst, deep-researcher, research-reviewer, web-searcher            |
| validation (3) | fact-checker, qa-engineer, source-validator                                                   |

### 스킬 (46개)

| 카테고리       | 수  | 항목                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| -------------- | :-: | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| architecture   |  1  | ddd                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| devops         |  3  | docker-deployment, github-actions, github-actions-visual-regression                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| frontend       | 40  | accessibility, animation, api-integration, bundling-compiler, code-convention, component-design, cra-to-vite-migration, css-variables, dayjs, design-patterns, design-token-scss, e2e-testing, error-handling, form-handling, intersection-observer, monorepo-turborepo, mui-v5, mutation-observer, nextjs, page-visibility, performance, radix-ui, react-core, react-dnd, react-virtuoso, resize-observer, rsbuild, sass, seo, state-management, storybook, storybook-visual-testing, swiper, testing, tsup, typescript-v4, typescript-v5, vite-advanced-splitting, vite-pwa-service-worker, webpack-vite-config-mapping |
| meta           |  2  | continuous-learning, ralph-loop                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |

### 훅 (6개)

- `auto-approve.js` — 안전 커맨드 자동 승인
- `bash-guard.js` — Bash 명령 실행 전/후 가드
- `pending-test-guard.js` — PENDING_TEST 스킬 세션 종료 차단
- `session-summary.js` — 세션 종료 요약
- `skill-md-guard.js` — SKILL.md 편집 가드
- `verification-guard.js` — verification.md 편집 가드

### 규칙 (8개)

- `agent-design.md` — 에이전트 설계 기준
- `creation-workflow.md` — 스킬·에이전트 생성 5단계 워크플로우
- `git-workflow.md` — feature 브랜치 + PR 워크플로우 (워크트리 금지)
- `git.md` — Git 커밋 컨벤션
- `info-verification.md` — 외부 정보 검증 원칙
- `readme-update.md` — README 동기화 규칙
- `typescript.md` — TypeScript·React 코딩 규칙
- `verification-policy.md` — 검증 상태 전환 정책

### 플러그인 (프로젝트 레벨)

- [`codex@openai-codex`](https://github.com/openai/codex-plugin-cc) — 2차 코드 리뷰 (Codex가 Claude 외부에서 독립 검토)
- [`superpowers@superpowers-marketplace`](https://github.com/obra/superpowers) — TDD 강제(RED→GREEN→REFACTOR) + 7단계 워크플로우

---

## 업데이트 로그

| 날짜       | 변경 내용                                                                                                     |
| ---------- | ------------------------------------------------------------------------------------------------------------- |
| 2026-04-22 | 초기 스캐폴드 — gugbab-claude 메타 레포에서 프론트엔드 관련 자산 선별 import, Codex·Superpowers 플러그인 등록 |
| 2026-04-23 | `@gugbab/utils` 0.0.1 추가 — string/object/array/guard/fn/format 6개 카테고리, 22개 함수, 108개 테스트     |
| 2026-04-24 | `@gugbab/hooks` 0.0.1 추가 — lifecycle/ref/binding/state/dom 5개 카테고리, 11개 훅, 42개 테스트 (`utils` 소비) |
| 2026-04-24 | `@gugbab/headless` 0.0.1 추가 — 헤드리스 컴포넌트 30종 (5 tier: primitives/stateful/overlays/forms/navigation), 98개 테스트, Floating UI 기반 |
| 2026-04-24 | `@gugbab/headless` 고도화 — DirectionProvider(RTL), Dialog asChild+scrollLock, Slider 포인터 드래그, Toast pause/swipe, axe-core a11y smoke (총 121 tests) |
| 2026-04-27 | `@gugbab/headless` Phase 2 (Radix parity) — asChild 14개 subcomponent 일괄 확장, usePresence(애니메이션 후 unmount), DropdownMenu/Select FloatingList+typeahead, DropdownMenu.CheckboxItem/RadioGroup/RadioItem/ItemIndicator, Tabs/RadioGroup RTL 키보드, Form (Field/Label/Control/Message/Submit) 추가 (총 158 tests) |
| 2026-04-27 | `@gugbab/headless` Phase 3·4·5 — Tier A·B·C·F 1:1, 인프라 5종 (DismissableLayer/FocusScope/RovingFocusGroup/Collection/Presence), Slider Range/Toast/Select 보강 (총 426 tests, Radix 1:1 ~90%) |
| 2026-04-28 | Phase 6.1·6.2 — `@gugbab/tokens` (MUI + Radix 어댑터 → CSS variables) + `@gugbab/styled-mui` (`gmui-*` 35종) + `@gugbab/styled-radix` (`grx-*` 35종) 추가. 헤드리스 적응성 증명 (build/typecheck GREEN, 426 회귀 tests 유지) |
| 2026-04-28 | Phase 6.3 — `apps/storybook-mui`·`apps/storybook-radix` 분리 (Storybook 10.3.5 + Vite + React 19). 시스템별 독립 쇼케이스, `theme` (light/dark) 토글, 35 컴포넌트 stories × 2 시스템. 컴포넌트 docs(한국어 컴파운드 구조 표 + 접근성 가이드) 풍부화. |
| 2026-04-28 | Phase 6.3.1 — 디자인 시스템 품질 보강. ① CSS 토큰 mismatch 일괄 치환 (accent/border/bg/fg `default` → 실제 토큰명, radius-xs → sm) — Checkbox/Switch 등 박스가 안 보이던 시각 버그 해결. ② Foundations 5종(Colors/Typography/Spacing/Radius/Shadows) × 2 storybook 추가. ③ Checkbox indicator 자동 ✓/− SVG glyph (mask-image, consumer가 children 주면 비활성). ④ styled-mui/styled-radix 양쪽에 smoke tests 26 × 2 = 52 추가 (전체 640 tests). |
| 2026-04-28 | Phase 6.3.2 — Playwright 시각 검수 (`scripts/visual-check.{mjs,sh}`)로 18 페이지 캡처, 토큰 30+개 추가 mismatch(`accent-9/-1~12`, `spacing-N`, `radius-1/2/3` 등) 일괄 정리. Slider/Progress 가시성 회복. |
| 2026-04-28 | Phase 6.3.3 — `packages/react` → `packages/headless` (`@gugbab/headless`) 리네이밍 — 헤드리스 의도가 패키지명에서 즉시 드러나도록. 82 파일 import + 4 workspace dep 일괄 갱신. |
| 2026-04-28 | Phase 6.3.4 — `@gugbab/tokens` 정적 토큰화. `@mui/material`·`@radix-ui/colors`·`@emotion/*` devDep 전부 제거. `createTheme()` 어댑터 → 정적 객체. dist/{mui,radix}.css는 byte-identical, 번들은 234KB → 15KB (16배 감소). 외부 디자인 라이브러리 변화에 휘둘리지 않는 자기완결 패키지로 전환. |
| 2026-04-29 | Phase 6.4 — Visual Regression 인프라. Playwright `toHaveScreenshot` + `e2e/visual/` 셋업 (임계치 `maxDiffPixelRatio: 0.001` = 0.1%, 디자인 시스템 기준). 인터랙티브 stories(Toast/Dialog/Popover/Menu/Select 등)는 trigger 클릭 후 캡처 + portal 컴포넌트는 viewport 전체 캡처. `pnpm vr` 명령군 추가. GitHub Actions 워크플로우 2종(`visual-regression.yml` PR 게이트 + `visual-regression-baseline.yml` workflow_dispatch baseline 자동 PR). 양쪽 Storybook 222개 stories 픽셀 회귀 잠금. baseline은 CI(Linux)에서만 생성·commit, macOS 로컬 PNG는 `.gitignore`. |
| 2026-05-07 | feature 브랜치 + PR 워크플로우 도입 (`.claude/rules/git-workflow.md`) — 워크트리 사용 중단. 다른 프로젝트(인문학·도덕교육 학위논문, Java/Rust 백엔드)에서 임포트된 외래 자산 정리: skills 74개(`backend` 41 / `humanities` 12 / `education` 5 / `research` 4 / `writing` 12) + agents 16개(`backend` 5 / `education` 1 / academic `research` 6 / academic `validation` 4) + rules 2개(`java`, `rust`) 제거. 결과: 스킬 46 / 에이전트 22 / 훅 6 / 규칙 8 — 헤드리스 React 패키지 모노레포에 부합하도록 정합성 회복. |
