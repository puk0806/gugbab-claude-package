# @gugbab/commitlint-config

`@gugbab/*` 모노레포의 커밋 메시지 컨벤션을 강제하는 [commitlint](https://commitlint.js.org) 설정.

## 컨벤션

```
[category] Type: Subject

body (선택, 72자 이내)
footer (선택)
```

| 항목 | 값 |
| --- | --- |
| category | `agent`, `skill`, `docs`, `config`, `pkg`, `apps`, `scripts`, `deps` |
| Type | `Add`, `Remove`, `Fix`, `Modify`, `Improve`, `Refactor`, `Rename`, `Move` |
| Subject | 마침표 없음, 영문이면 동사 첫 글자 대문자 |

예시:
```
[pkg] Add: @gugbab/headless 컴포넌트 35종
[docs] Modify: README 자산 현황 갱신
[config] Modify: Husky pre-commit 훅 추가
```

## 설치

```sh
pnpm add -D @gugbab/commitlint-config @commitlint/cli
```

`@commitlint/cli ≥ 19`을 peer dependency로 요구합니다.

## 사용

루트의 `commitlint.config.js` 또는 `.commitlintrc.js`:

```js
export default {
  extends: ['@gugbab/commitlint-config'],
};
```

## Husky 통합

`.husky/commit-msg`:

```sh
pnpm exec commitlint --edit "$1"
```

## 라이선스

MIT
