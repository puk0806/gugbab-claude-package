# @gugbab/utils 패키지 설계

**작성일**: 2026-04-23
**상태**: Draft
**소속 레포**: `01_gugbab-claude-package`
**위치**: `packages/utils`

---

## 1. 목적과 범위

### 1.1 목적

`@gugbab/utils`는 `@gugbab/*` 모노레포 전반(특히 앞으로 구축할 `packages/react`)에서 공통으로 사용할, **프레임워크 독립·순수 함수 기반** 유틸리티 모음이다. 공개 배포 대상이며, 외부 프론트엔드 개발자도 소비자로 가정한다.

### 1.2 타깃 환경

- 브라우저 + Node.js 듀얼 지원 (순수 JS만 사용, DOM API 직접 호출 없음)
- TypeScript strict 모드 (`@gugbab/tsconfig/base.json` 상속)
- Node.js `>=20.17.0`

### 1.3 제공 카테고리

초기 6개 카테고리, 총 30~50개 함수 규모로 출발한다.

| 카테고리 | 예시 함수 |
| -------- | ------------------------------------------------------------ |
| `string` | `camelCase`, `kebabCase`, `truncate`, `slugify`, `capitalize` |
| `object` | `pick`, `omit`, `deepMerge`, `isPlainObject`, `mapValues` |
| `array`  | `chunk`, `uniq`, `uniqBy`, `groupBy`, `partition` |
| `guard`  | `isNil`, `isString`, `isNumber`, `isRecord`, `isNonEmptyArray` |
| `fn`     | `debounce`, `throttle`, `sleep`, `retry`, `once` |
| `format` | `formatNumber`, `formatPercent`, `formatBytes` |

함수 목록은 초기 가이드이며, `packages/react` 구현 과정에서 실제로 필요해지는 순서대로 추가한다.

### 1.4 비목표 (Non-goals)

- **날짜 처리** — 소비자가 필요 시 `dayjs` 등을 직접 사용. utils에 포함하지 않는다.
- **DOM·브라우저 전용 API** — clipboard, scroll lock 등은 별도 `@gugbab/dom` 패키지로 분리 (필요해질 때).
- **React 훅** — 별도 `@gugbab/hooks` 패키지로 분리 (필요해질 때).
- **로다시 전체 API 복제** — 실무에서 실제로 반복 등장하는 것만 선별한다.

---

## 2. 의존성 정책

| 구분 | 정책 | 예시 |
| ---------------------- | ----------------- | --------------------------- |
| `dependencies`         | **0개 유지**      | (없음) |
| `peerDependencies`     | 없음              | (필요 시 재검토) |
| `devDependencies`      | 허용 (개발 전용) | `type-fest`, `tsup`, `vitest` |

### 근거

- 유명 유틸 라이브러리 전수(`lodash`, `remeda`, `es-toolkit`, `radash`, `type-fest`) 모두 런타임 deps 0개로 배포.
- 소비자 번들 크기·버전 충돌 리스크 최소화.
- 타입 전용 라이브러리(`type-fest`)는 컴파일 후 런타임 코드에 0바이트만 남으므로 devDep에 둔다.

---

## 3. Exports 전략

### 3.1 단일 엔트리 채택

```ts
import { chunk, debounce, isNil } from '@gugbab/utils';
```

### 3.2 근거 (업계 관행 조사)

| 라이브러리       | API 규모  | exports 방식 |
| ---------------- | --------- | ------------ |
| `remeda`         | ~100개    | 단일 엔트리  |
| `radash`         | ~80개     | 단일 엔트리  |
| `type-fest`      | 타입 전용 | 단일 엔트리  |
| `es-toolkit`     | 500+개    | 단일 + subpath |
| `@vueuse/core`   | 200+개    | 단일 + subpath |

초기 30~50개 규모에서는 단일 엔트리가 현대 주류. `sideEffects: false` + ESM 배포면 번들러(Vite/webpack5/Rollup)가 tree-shaking을 충분히 처리한다. 함수 수가 100개를 넘으면 subpath exports 도입을 재검토한다.

### 3.3 package.json exports 필드

```jsonc
{
  "exports": {
    ".": {
      "import": {
        "types": "./dist/index.d.mts",
        "default": "./dist/index.mjs"
      },
      "require": {
        "types": "./dist/index.d.ts",
        "default": "./dist/index.js"
      }
    },
    "./package.json": "./package.json"
  },
  "sideEffects": false
}
```

ESM/CJS 듀얼 빌드, 각 포맷별 타입 선언 파일 분리.

---

## 4. 디렉토리 구조

```
packages/utils/
├── src/
│   ├── string/
│   │   ├── camel-case.ts
│   │   ├── camel-case.test.ts
│   │   ├── kebab-case.ts
│   │   ├── kebab-case.test.ts
│   │   └── index.ts              # 이 카테고리 함수 re-export
│   ├── object/
│   ├── array/
│   ├── guard/
│   ├── fn/
│   ├── format/
│   └── index.ts                  # 각 카테고리 index re-export (전체 barrel)
├── package.json
├── tsconfig.json
├── tsup.config.ts
└── vitest.config.ts
```

### 파일 규칙

- **함수 1개 = 파일 1개** 원칙 (예외: 2~3줄짜리 헬퍼가 관련된 경우만)
- 테스트는 **co-located** (`foo.ts` ↔ `foo.test.ts`)
- 파일명 `kebab-case.ts`, 함수명 `camelCase`, 타입 `PascalCase`
- 모든 함수 `named export` (default export 금지)
- 각 카테고리의 `index.ts`는 해당 폴더의 함수들을 re-export만 수행

---

## 5. 빌드 도구: tsup

### 5.1 설정

```ts
// packages/utils/tsup.config.ts
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
});
```

### 5.2 산출물

- `dist/index.mjs`, `dist/index.js`
- `dist/index.d.mts`, `dist/index.d.ts`
- 소스맵 동반
- `package.json`의 `files`에 `dist`만 포함

### 5.3 근거

CLAUDE.md에 명시된 기술 스택 기본값. ESM/CJS 듀얼과 타입 선언을 설정 한 번으로 동시 생성한다.

---

## 6. 테스트: Vitest

### 6.1 설정

```ts
// packages/utils/vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
    },
  },
});
```

### 6.2 TDD 절차

superpowers 플러그인의 TDD 강제 워크플로우를 따른다.

1. **RED** — 실패하는 테스트 먼저 작성 (함수 시그니처 + 대표 동작 1~2개)
2. **GREEN** — 테스트 통과시키는 최소 구현
3. **REFACTOR** — 엣지 케이스·성능·가독성 개선

### 6.3 테스트 범위 기준

- 각 함수의 **정상 케이스 + 엣지 케이스 2~3개** 필수 커버
- 순수 함수이므로 통합 테스트 불필요
- Coverage 목표: 라인 커버리지 90% 이상

---

## 7. 버전·배포 정책

### 7.1 package.json 핵심

```jsonc
{
  "name": "@gugbab/utils",
  "version": "0.0.1",
  "description": "Framework-agnostic utilities for @gugbab/*",
  "license": "MIT",
  "type": "module",
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": { /* 섹션 3.3 참조 */ },
  "files": ["dist"],
  "sideEffects": false,
  "publishConfig": { "access": "public" },
  "engines": { "node": ">=20.17.0" },
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "test": "vitest run",
    "test:watch": "vitest",
    "typecheck": "tsc --noEmit",
    "clean": "rm -rf dist .turbo"
  },
  "devDependencies": {
    "@gugbab/tsconfig": "workspace:*",
    "@gugbab/biome-config": "workspace:*",
    "type-fest": "^4.x",
    "tsup": "^8.x",
    "vitest": "^2.x",
    "@vitest/coverage-v8": "^2.x",
    "typescript": "^5.x"
  }
}
```

### 7.2 버전 관리

- Changesets로 관리
- 초기 버전 `0.0.1`
- pre-1.0 동안: minor=Breaking, patch=fix/feature (Changesets 관행)

### 7.3 tsconfig 상속

```jsonc
// packages/utils/tsconfig.json
{
  "extends": "@gugbab/tsconfig/node-library.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src/**/*"],
  "exclude": ["src/**/*.test.ts", "dist", "node_modules"]
}
```

React/DOM 타입을 참조하지 않는 순수 JS이므로 `node-library` 프리셋 상속 (브라우저에서도 정상 동작).

### 7.4 Turbo 연동

루트 `turbo.json`의 `build`, `test`, `typecheck` 태스크에 자동 편입 (이미 workspace 규칙 설정됨).

---

## 8. 확정 요약

| 항목 | 결정 |
| ------------ | ------------------------------------------------- |
| 스코프       | `@gugbab/utils` · 6 카테고리 · 30~50 함수 출발 |
| 의존성       | 런타임 0개, devDep에 `type-fest` |
| Exports      | 단일 엔트리 |
| 빌드         | tsup, ESM+CJS 듀얼, `sideEffects: false` |
| 테스트       | Vitest, co-located `*.test.ts`, TDD 강제 |
| 파일 구조    | 함수 1개 = 파일 1개, 카테고리별 폴더 |
| Non-goals    | 날짜/DOM/hooks — 필요해지면 별도 패키지로 분리 |

---

## 9. 구현 후속 작업 (별도 Plan 문서에서 다룸)

- 초기 함수 선정 (각 카테고리 최소 3개, 총 30~50개 목표)
- Biome lint 규칙 정렬
- README 생성 (API 목록 + 사용 예시)
- Changeset 생성
- 루트 README의 Packages 섹션에 항목 추가
