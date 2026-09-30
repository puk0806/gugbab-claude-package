# 구조·배포 3순위 정리 기록

> 브랜치 `feature/refactor-structure-priority3`는 **`feature/fix-security-priority2` 위에 쌓았다.** `utils/src/sse`를 두 브랜치가 함께 수정해서, main에서 따로 갈라지면 병합 충돌이 난다. 머지 순서는 2순위 → 3순위다.

## 결정 (2026-09-30, 사용자 승인)

| 항목 | 결정 | 근거 |
|---|---|---|
| 내부 의존성 표기 | **`workspace:*` 유지**(게시 시 정확한 버전으로 고정) | npm 게시본을 조사했다. Radix, Chakra→Ark, Ark→Zag, React Aria, Base UI, TanStack Query가 내부 패키지를 정확한 버전으로 고정한다. MUI 본체는 `^` 범위, MUI Lab·Mantine 확장 패키지는 peer를 쓴다. 이 레포와 구조가 가장 닮은 Chakra(스타일 → 헤드리스)도 고정 방식이다 |
| 두 벌 설치 시 Context 불일치 | styled 패키지가 **공유 Provider를 다시 내보낸다**(Chakra 방식) | 고정 방식에서 두 벌 설치는 정상이다. 소비자가 headless를 직접 가져와 styled 컴포넌트와 Context를 공유할 때만 문제가 된다. `DirectionProvider`가 그 지점이었다 |
| peer 전환 | 하지 않음 | 설치 방법이 바뀌는 breaking change이고, 비교 대상 헤드리스 계열도 쓰지 않는다 |
| `safety_block` | **제네릭 확장 + deprecated**, major 없음 | 기본 `SseEvent`를 유지해 하위 호환한다. 다음 major에서 기본값에서 제거한다 |
| styled-mui·radix 복제 통합 | **보류** | 큰 리팩터링이고 시각 회귀 CI 확인이 필요해서 별도 작업으로 뺀다 |

## 반영

1. **styled-mui·styled-radix:** `DirectionProvider`·`useDirection`·타입을 다시 내보낸다. 테스트는 두 가지를 확인한다. ① headless와 동일 객체인지(`toBe`) ② styled 쪽 Provider로 RTL이 Slider 키 동작에 전달되는지. RED에서는 export가 없어 실패했다.
2. **utils:**
   - `SseCoreEvent`, `SseSafetyBlockEvent`(`@deprecated`), `SseEvent<TExtra = SseSafetyBlockEvent>`를 둔다.
   - 테스트 파일은 tsconfig에서 제외되어 있어서, 타입 테스트는 임시 tsconfig로 `tsc`를 돌려 검증했다. RED에서는 TS 오류가 7건 났다.
3. **headless:** 미사용 `@gugbab/utils`를 dependencies와 tsup external에서 제거했다. src와 dist 참조 0건을 확인했고, lockfile은 3줄 삭제됐다.
4. **`scripts/build-styled-css.mjs`:**
   - tokens CSS를 형제 경로가 아니라 `createRequire().resolve('@gugbab/tokens/<variant>.css')`로 찾는다.
   - 파일이 없으면 경고가 아니라 **exit 1**로 끝낸다.
   - 산출물이 기존과 바이트 단위로 같고, 실패 경로도 확인했다.
5. **turbo:** `globalDependencies`에 `scripts/**`를 추가했다. 루트 빌드 스크립트를 고치면 캐시가 무효화된다.
6. **tokens README:** 존재하지 않던 `muiTokensLight` 예제를 `muiTheme.light`·`renderThemeCss`로 고쳤다. 빌드 산출물로 실행해 확인했다.

## 범위 밖

- 루트 README의 "35종 + Form" 표기(같은 줄을 정리 작업 브랜치가 고치므로 그쪽에서 수정)
- turbo 미사용 항목(`lint` 태스크, `.next/**`) 정리, 스토리북 앱의 미사용 의존성
- styled 복제 통합

## 독립 리뷰 반영 (2026-09-30)

재수출이 dist에서 external로 유지되는지 확인했다. `from '@gugbab/headless'` 재수출이고 `createContext` 인라인은 0건이다. `"use client"` 충돌과 `SseEvent` 기본값 호환성도 문제없었다.

- 반영: changeset·JSDoc에 SSE 확장이 **타입 전용**임을 명시했다. deprecated 이전 안내의 모순(앱에서 직접 선언하도록 통일)을 없앴다. headless 연쇄 bump 표현을 낮췄다. 서식과 README 미사용 import를 정리했다.
- **후속 작업:**
  - `parseSSELine`·`readSSEStream`·`toSSELine` 제네릭화와 파서 확장 훅. 다음 major에서 `safety_block`을 제거하는 작업과 함께 한다.
  - **테스트 파일 타입 검사를 CI에 포함(`vitest --typecheck` 또는 테스트용 tsconfig).** 현재 `expectTypeOf`와 `@ts-expect-error`가 CI에서 검사되지 않는다. 기존 테스트에도 TS 오류 3건(`read-sse-stream.test.ts:55`, `to-sse-line.test.ts:37`)이 방치되어 있다.
  - 확장 이벤트가 core와 같은 `type`을 쓰지 못하게 막는 제약
  - dist 인라인 회귀 검사(빌드 후 `from '@gugbab/headless'` 존재, `createContext` 0건)
  - turbo `scripts/**` 무효화 범위를 패키지별 `inputs`로 좁히기(현재는 비용만 증가하고 결과에는 영향 없음)

