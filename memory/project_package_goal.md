---
name: Package project goal
description: 01_gugbab-claude-package — Claude-only로 구축하는 범용 헤드리스 UI + 정적 토큰 + 스타일 패키지 모노레포. v1.0.0 publish 완료.
type: project
originSessionId: d38b63bc-10e0-4db4-8ff1-14cf943313c2
---
사용자는 `/Users/lf/Desktop/gugbab-workspace/01_gugbab-claude-package`를 **Claude(Claude Code)만을 이용해, 모든 프론트엔드 개발자가 공용으로 쓸 수 있는 패키지 배포용 모노레포**로 구축한다.

참고 레포 위치는 `project_reference_monorepo`.

## 성격 (확정)

- **패키지 관리 레포** — 최종 산출물은 앱이 아니라 9개 `@gugbab/*` 패키지 (배포 대상). `apps/`는 Storybook 검증·쇼케이스 전용.
- **모든 프론트엔드 개발자 대상** — 특정 프로젝트 종속이 아닌 범용·재사용·공개 배포 퀄리티.
- **UI 컴포넌트는 headless** — 동작·상태·접근성만 제공, 스타일은 별도 패키지(`styled-mui`, `styled-radix`)에서 입힘. React 전용.
- **정교한 패키지** — 문서·타입·빌드·버전닝·lint 표준화. bottom-up으로 기반(tsconfig·biome-config·utils·hooks)부터 쌓고 UI는 위에.
- **외부 디자인 라이브러리 의존성 0** — 토큰은 정적 박제 (`feedback_no_external_design_deps` 참조).

## 스택 (확정)

- pnpm 9 workspace + Turborepo 2.x + Changesets + tsup
- Husky + lint-staged + commitlint + Biome (eslint/prettier 대신)
- Storybook 10 분리 — `apps/storybook-{mui,radix}`
- Playwright (visual check + visual regression)
- 워크스페이스 스코프: `@gugbab/*`

## 9개 publishable 패키지 (v1.0.0 publish 완료, 2026-05-09)

| 카테고리 | 패키지 | 역할 |
|---|---|---|
| 인프라 | `@gugbab/tsconfig` | 공용 tsconfig 프리셋 |
| 인프라 | `@gugbab/biome-config` | 공용 Biome 프리셋 |
| 인프라 | `@gugbab/commitlint-config` | 공용 commitlint 프리셋 |
| 핵심 | `@gugbab/utils` | 프레임워크 독립 순수 유틸 |
| 핵심 | `@gugbab/hooks` | React 공용 훅 |
| 핵심 | `@gugbab/headless` | 35 헤드리스 컴포넌트 |
| 디자인 | `@gugbab/tokens` | 정적 디자인 토큰 + `dist/{mui,radix}.css` |
| 디자인 | `@gugbab/styled-mui` | Material 디자인 35 스타일 컴포넌트 `gmui-*` |
| 디자인 | `@gugbab/styled-radix` | Radix Themes 디자인 35 스타일 컴포넌트 `grx-*` |

apps/storybook-{mui,radix}는 private(검증·쇼케이스 전용).

상세 publish 흐름은 `project_npm_v1_publishing` 참조. 이후 변경은 changesets 흐름으로 자동 publish.

## 빌드 순서 (의존성 방향)

1. 레포 인프라: `pnpm-workspace.yaml`, `turbo.json`, `.changeset`, Husky, biome
2. tsconfig / biome-config / commitlint-config — 공용 프리셋
3. `utils` — 프레임워크 독립 순수 유틸
4. `hooks` — React 공용 훅
5. `headless` — 위의 모든 것 소비
6. `tokens` — 정적 토큰 (외부 의존성 0)
7. `styled-mui` / `styled-radix` — `headless` + `tokens` 소비
8. `apps/storybook-{mui,radix}` — 검증·쇼케이스

## Claude-only 제약

외부 CLI·웹 서비스 의존 최소화. Claude Code 에이전트·스킬·훅·슬래시 커맨드로 해결 가능한 경로 우선.

## 미해결

- **node engines 상향** — 루트 `engines.node: ">=20.17.0"`은 Storybook 10 요구치(20.19+ 또는 22.12+)보다 낮음. 상향 + `.nvmrc` 갱신 검토 필요 (사용자 결정 대기).
