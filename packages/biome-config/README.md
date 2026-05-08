# @gugbab/biome-config

`@gugbab/*` 모노레포에서 사용하는 공용 [Biome](https://biomejs.dev) 설정.

- ESLint + Prettier 대신 Biome 단일 도구 사용
- TypeScript / React 친화 규칙 활성화
- 포맷터: 2-space, single quote, trailing comma, semi

## 설치

```sh
pnpm add -D @gugbab/biome-config @biomejs/biome
```

`@biomejs/biome ≥ 2.0`을 peer dependency로 요구합니다.

## 사용

프로젝트 루트의 `biome.json` 또는 패키지 디렉토리의 `biome.json`에서 `extends`:

```json
{
  "$schema": "https://biomejs.dev/schemas/2.0.0/schema.json",
  "extends": ["@gugbab/biome-config/base.json"]
}
```

규칙을 패키지별로 미세 조정하고 싶을 때:

```json
{
  "$schema": "https://biomejs.dev/schemas/2.0.0/schema.json",
  "extends": ["@gugbab/biome-config/base.json"],
  "linter": {
    "rules": {
      "suspicious": {
        "noConsole": "off"
      }
    }
  }
}
```

## 명령

```sh
biome check --write .   # lint + format 동시 적용
biome ci .              # CI에서 lint + format 검증 (write 없음)
```

## 라이선스

MIT
