# @gugbab/tsconfig

`@gugbab/*` 모노레포에서 사용하는 공용 TypeScript 설정 프리셋.

## 설치

```sh
pnpm add -D @gugbab/tsconfig typescript
```

## 프리셋 3종

| 파일 | 용도 |
| --- | --- |
| `base.json` | 공용 베이스 — `strict`, `target: ES2022`, `moduleResolution: bundler`, `esModuleInterop` 등 |
| `react-library.json` | React 라이브러리 — `base.json` + `jsx: react-jsx`, `lib: [DOM, DOM.Iterable, ES2022]` |
| `node-library.json` | Node 라이브러리 — `base.json` + `types: ["node"]` |

## 사용

각 패키지의 `tsconfig.json`에서 `extends`로 가져옵니다.

### React 라이브러리

```json
{
  "extends": "@gugbab/tsconfig/react-library.json",
  "include": ["src"],
  "compilerOptions": {
    "outDir": "dist"
  }
}
```

### Node 라이브러리 / 프레임워크 독립 패키지

```json
{
  "extends": "@gugbab/tsconfig/node-library.json",
  "include": ["src"]
}
```

### 직접 base만 쓰는 경우

```json
{
  "extends": "@gugbab/tsconfig/base.json"
}
```

## 라이선스

MIT
