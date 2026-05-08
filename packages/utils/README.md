# @gugbab/utils

프레임워크 독립적인 순수 유틸리티 모음. 브라우저와 Node.js 양쪽에서 동작합니다.

## 설치

```bash
pnpm add @gugbab/utils
```

## 특징

- **런타임 의존성 0개** — 소비자 번들에 우리 코드만 포함됩니다.
- **ESM + CJS 듀얼 빌드** — 모든 번들러·런타임 지원.
- **`sideEffects: false`** — 번들러 tree-shaking 완벽 지원.
- **TypeScript strict** — 모든 함수 타입 가드·제네릭 제공.

## API

단일 엔트리에서 모든 함수를 import합니다.

```ts
import { camelCase, chunk, debounce, isNil, formatBytes } from '@gugbab/utils';
```

### guard

런타임 타입 가드. TypeScript narrowing에 사용.

| 함수 | 설명 |
| --- | --- |
| `isNil(v)` | `null` 또는 `undefined`인지 |
| `isString(v)` | 원시 문자열인지 |
| `isNumber(v)` | `NaN`이 아닌 숫자인지 |
| `isPlainObject(v)` | `{}` 또는 `Object.create(null)` 형태인지 |
| `isNonEmptyArray<T>(v)` | 길이 1 이상의 배열인지 |

### string

| 함수 | 설명 |
| --- | --- |
| `capitalize(s)` | 첫 글자만 대문자로 |
| `camelCase(s)` | `user-profile`, `user_profile`, `UserProfile` → `userProfile` |
| `kebabCase(s)` | `userProfile` → `user-profile` |
| `truncate(s, { length, suffix? })` | 길이 초과 시 `…`(기본) 접미사 붙임 |

### array

| 함수 | 설명 |
| --- | --- |
| `chunk(arr, size)` | 고정 크기 배열로 분할 |
| `uniq(arr)` | 중복 제거 (SameValueZero) |
| `groupBy(arr, keyFn)` | 키 함수로 그룹핑 |

### object

| 함수 | 설명 |
| --- | --- |
| `pick(obj, keys)` | 키 화이트리스트 |
| `omit(obj, keys)` | 키 블랙리스트 |
| `deepMerge(target, source)` | 재귀 병합 (plain object만, 배열은 교체, prototype pollution 차단) |

### fn

| 함수 | 설명 |
| --- | --- |
| `sleep(ms)` | `Promise<void>` 지연 |
| `once(fn)` | 최초 1회만 실행, 이후 캐시 반환 |
| `debounce(fn, wait)` | 트레일링 디바운스 (`.cancel()`, `.flush()` 포함) |
| `throttle(fn, wait)` | 리딩+트레일링 스로틀 (`.cancel()` 포함) |

### format

`Intl` API 기반. `locale` 옵션으로 로케일 지정.

| 함수 | 설명 |
| --- | --- |
| `formatNumber(n, { locale?, ...Intl.NumberFormatOptions })` | 숫자 포맷 |
| `formatPercent(ratio, opts?)` | `0.5` → `50%` |
| `formatBytes(bytes, { fractionDigits?, base? })` | 바이트 크기 (binary 기본, decimal 옵션) |

## 라이선스

MIT
