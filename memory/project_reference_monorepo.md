---
name: Reference monorepo
description: 참고 레포 gugbab-integrated-admin-poc의 구조·스택·관례 요약
type: project
originSessionId: b3423967-ab94-4f8d-abcb-c50694e91f40
---
경로: `/Users/lf/Desktop/workspace/09_gugbab-integrated-admin-poc/gugbab-integrated-admin-poc`

**Why:** 사용자가 신규 01_gugbab-claude-package 모노레포의 원형으로 이 레포를 지목. 구조·네이밍·스크립트 규약을 준용할 가능성이 크다.

**How to apply:** 새 모노레포 설계·스캐폴딩 시 아래 구조를 기본값으로 제안하고, 차이점이 생기면 사용자에게 확인 후 바꾼다.

## 스택
- 패키지 매니저: pnpm 9.12.2 (`pnpm-workspace.yaml` — `apps/*`, `packages/*`)
- 태스크 러너: Turborepo 2.x (`turbo.json` — dev/build/lint/typecheck/test)
- 버전 관리: Changesets (`.changeset`)
- 훅: Husky
- Node: 22.17.0
- 런타임: Next.js 16(beta, Turbopack 기본) + React 19
- 상태: TanStack Query v5, Zustand
- 폼·검증: React Hook Form + Zod
- UI: Sass + Vanilla Extract + 자체 ui-sass 패키지
- 테스트: Jest + RTL + MSW
- 그리드: AG Grid
- 도구 가이드: `.cursor/rules` + `CURSOR_GUIDE.md`

## 디렉토리
```
apps/
  gugbab-next-admin   # Next.js 통합 어드민 (FSD: app/widgets/features/shared)
  storybook           # Vite 기반 디자인시스템 문서
packages/
  eslint-config       # 공용 ESLint 설정 (index/react/node/jest)
  gugbab-types        # OpenAPI → 타입 생성 (tsup 빌드)
  icons               # SVG → 웹폰트 (fantasticonrc.json, tsup)
  tsconfig            # base/nextjs/react-library 공용 tsconfig
  ui-sass             # Sass 기반 UI 라이브러리 (tsup 빌드)
  utils               # 공용 유틸 (tsup)
scripts/
  clear-install/      # 캐시·node_modules 초기화 스크립트
  generate-component/ # 컴포넌트 스캐폴더
```

## 네이밍·스크립트 관례
- 워크스페이스 스코프: `@gugbab-integrated-admin-poc/*`
- 루트 스크립트: `dev`, `build`, `lint`, `typecheck`, `test`는 turbo 일괄 / `dev:app`·`build:ui` 같은 타깃별 스크립트는 `pnpm --filter @{scope}/{pkg}` 형태로 제공
- `changeset:version`으로 버전업
- Docker: `build:docker` → `start:docker` (gugbab-next-admin 전용)
- 커밋 컨벤션: `service : Service` + `type: Subject` (서비스 키: app/storybook/ui/utils/icons/eslint/tsconfig/types/all)

## FSD 레이어(app 내)
`app → widgets → features → shared` 단방향 의존. `processes`·`entities`는 미사용. 각 슬라이스는 `ui/api/types/hooks/utils/consts` 세그먼트로 구성.
