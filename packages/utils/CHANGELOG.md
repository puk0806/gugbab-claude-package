# @gugbab/utils

## 1.5.0

### Minor Changes

- 2398432: 보안·안정성 수정

  - `readSSEStream`: 개행 없이 들어오는 라인에 상한(`maxBufferSize`, 기본 1,048,576자)을 두고, 초과하면 `RangeError`로 중단합니다(메모리 폭증 방지). **동작 변경:** 이전에는 통과하던, 개행 없이 1MB를 넘는 라인이 이제 오류가 됩니다. 상한 초과, 읽기 실패, `onEvent` 예외가 나면 스트림을 취소해 연결을 닫습니다. 옵션 타입 `ReadSSEStreamOptions`를 추가했습니다. 줄 구분자로 LF·CRLF뿐 아니라 CR 단독도 인식합니다(WHATWG event-stream). 이전에는 CR만 쓰는 서버의 이벤트를 받지 못했습니다.
  - `parseSSELine`: 이벤트 형식을 런타임에 검증하고 정규화합니다. 필수 필드 타입이 틀리거나 알 수 없는 `type`이면 `null`을 반환합니다(**동작 변경:** 이전에는 그대로 전달됨. `text`가 없는 chunk 때문에 화면에 `"undefined"`가 붙을 수 있었음). 선택 필드의 `null`은 허용해 제거하고, `safety_block`의 `resources`가 없으면 `[]`로 채웁니다. 알려지지 않은 여분 필드는 결과에 포함하지 않습니다.
  - `withRetry`: `maxRetries`·`baseDelay`·`maxDelay`가 비정상이면 `RangeError`를 던집니다(이전엔 `Infinity`면 무한 재시도). 대기 상한 `maxDelay`(기본 30초)를 추가했고, `signal`(AbortSignal)로 중단할 수 있습니다. `shouldRetry`가 예외를 던져도 원래 오류로 reject합니다.
  - `groupBy`: `toString`·`constructor`·`__proto__` 같은 키에서 크래시하거나 프로토타입이 바뀌던 문제를 수정했습니다.
  - `useSSEChat`: 언마운트하면 진행 중인 요청을 abort하고, 이후 `onChunk`·`onDone`·`onError`를 호출하지 않습니다. 언마운트 없이 effect만 정리되는 경우(예: `<Activity mode="hidden">`)에도 요청을 끊고 `status`를 `idle`로 되돌립니다.
  - `groupBy`: `Object.hasOwn`(ES2022) 대신 `hasOwnProperty.call`을 써서 Safari 15.3 이하에서도 동작합니다.

- 0d2c8ef: 구조·배포 정리

  - styled-mui / styled-radix: `DirectionProvider`·`useDirection`(과 `Direction`·`DirectionProviderProps` 타입)을 다시 내보냅니다. `@gugbab/headless`를 따로 설치하지 않고 RTL을 설정할 수 있습니다. 앱에 다른 버전의 headless가 설치되어 있어도, styled 패키지에서 가져온 Provider는 styled 컴포넌트와 같은 Context를 씁니다.
  - utils: SSE 이벤트 타입에 확장 지점을 추가했습니다.
    - `SseCoreEvent`(chunk·done·error)를 새로 둡니다.
    - `SseEvent<TExtra>`로 앱별 이벤트 **타입**을 선언할 수 있습니다. `SseEvent<never>`는 공통 이벤트만 포함합니다. 확장은 현재 **타입 전용**입니다. `parseSSELine`·`readSSEStream`·`toSSELine`은 공통 이벤트와 `safety_block`만 인식하고, 그 밖의 `type`은 파서가 버립니다.
    - 기본 `SseEvent`는 기존과 동일합니다.
    - relay 전용 `safety_block`은 `SseSafetyBlockEvent`로 분리하고 `@deprecated` 처리했습니다. 다음 major에서 타입과 파서 지원 모두 제거할 예정이며, 필요한 앱은 직접 선언해 `SseEvent<...>`로 넘기면 됩니다.
  - headless: 사용하지 않던 `@gugbab/utils` 직접 의존성을 제거했습니다. utils는 hooks를 거쳐 여전히 전이 설치됩니다.
  - tokens: README의 사용 예제를 실제 API(`muiTheme`·`radixTheme`·`renderThemeCss`)로 수정했습니다. 이전 예제의 `muiTokensLight` 등은 존재하지 않는 export였습니다.

## 1.4.0

### Minor Changes

- cd928cb: Web Speech API 공통화 — 형제 앱들에 복붙되어 있던 마이크(STT)·TTS 모듈을 패키지로 승격

  - `@gugbab/hooks` 신규 `speech` 카테고리:
    - `useSpeechRecognition` — 음성 인식 훅 (listening/interim/error 상태, stale 인스턴스 가드, start/stop/abort/toggle, 언마운트 abort)
    - `useSpeak` — TTS 훅 (voiceschanged 비동기 로딩 대응, 발화 중 언마운트 cancel)
    - `createRecognizer` — 프레임워크 독립 STT 코어 (lang 파라미터화, resultIndex 배치 유실 방지)
    - `pickVoice` / `listVoices` — voice 선택 유틸 (preferredURI > lang 정확 일치 > primary subtag)
    - `isSpeechRecognitionSupported` / `isSpeechSynthesisSupported` — 부분 구현 방어 포함 지원 감지
  - `@gugbab/utils` 신규 `appendTranscript` — 인식 결과 이어붙이기 + 상한 강제 (서로게이트 쌍 안전 절단)

## 1.3.0

### Minor Changes

- 91889b1: 이력 압축 순수 함수 4종 추가 (`history` 모듈)

  - `totalContentBytes` — content 합산 UTF-8 바이트 (relay 상한 판정과 동일 기준: TextEncoder)
  - `fitMessagesToBudget` — 바이트 예산·개수 상한 초과 시 오래된 왕복부터 드롭, 첫·마지막 role=user 계약 유지
  - `compressHistory` — 오래된 assistant 턴 content를 요약으로 교체 (요약이 원문보다 길면 원문 유지)
  - `isHistoryValidationError` — relay 400의 `violation === "history-budget"` 구조적 판별 (재시도 신호)

  상한 값은 전부 파라미터 주입 — 기본값 상수 내장·타 패키지 의존 없음.

## 1.2.0

### Minor Changes

- 16829d7: SSE `done` 이벤트에 선택 필드 `summary` 지원 추가

  - `@gugbab/utils`: `SseEvent`의 done 변형을 `{ type: "done"; summary?: string }`로 확장. `parseSSELine` / `readSSEStream` / `toSSELine`은 기존 로직 그대로 summary를 통과시키며, summary 없는 done 이벤트와 100% 하위 호환.
  - `@gugbab/hooks`: `useSSEChat`이 done 수신 시 `onDone?.(event)`로 done 이벤트 객체를 전달. `onDone`의 인자는 선택이므로 기존 `() => void` 소비자는 변경 없이 동작. chunk/error 동작 변경 없음.

## 1.1.0

### Minor Changes

- **@gugbab/utils**: Add SSE utilities and `withRetry`

  - `parseSSELine(line)` — parses a single `data: {...}` SSE line into a typed `SseEvent`
  - `readSSEStream(body, onEvent)` — streams a `ReadableStream` and emits `SseEvent` objects
  - `toSSELine(event)` — serializes a `SseEvent` to `data: ...\n\n` format for server-side use
  - `withRetry(fn, options)` — exponential-backoff retry with `maxRetries`, `baseDelay`, `shouldRetry`
  - `SseEvent` discriminated union type exported from `@gugbab/utils`

  **@gugbab/hooks**: Add `useSSEChat`

  - `useSSEChat({ url, onChunk, onDone, onError })` — React hook for SSE streaming chat with state management (`idle` / `streaming` / `done` / `error`), `abort()` support, and generation-safe concurrent-send handling

## 1.0.1

### Patch Changes

- 57cfcff: # v1.0.1 — 품질 리팩토링 (RSC 호환성 + SSR 안전성 + 캡슐화 정돈)

  ## Critical fixes

  - **`"use client"` 배너가 dist 첫 줄에 정상 삽입됨.** v1.0.0에선 tsup 의 banner 옵션을 esbuild 가 module-level directive 로 인식해 무력화시켜 4 패키지(`@gugbab/headless`, `@gugbab/hooks`, `@gugbab/styled-mui`, `@gugbab/styled-radix`) 의 산출물에 `"use client";` 가 누락되어 Next.js App Router(RSC) 환경에서 즉시 빌드/런타임 실패가 발생했다. 빌드 후처리 스크립트(`scripts/inject-use-client.mjs`)로 dist 첫 줄에 directive 를 강제 삽입하도록 변경.
  - **`Select.ScrollDownButton` 의 `onPointerEnter` 사용자 콜백이 `onPointerLeave` 로 잘못 라우팅되던 버그 수정.** 사용자가 `onPointerEnter` 핸들러를 넘기면 호출되지 않고 `onPointerLeave` 가 두 번 호출되던 회귀. `Select.ScrollUpButton` 은 정상이었음. 회귀 테스트 4개 추가.

  ## SSR / 안전성

  - 11곳의 `useLayoutEffect` 사용을 `@gugbab/hooks` 의 `useIsomorphicLayoutEffect` 로 교체 (Portal / Avatar / Slider / Toast / usePresence / ScrollArea / BubbleInput) — Next.js Client Component 의 1차 SSR 렌더 시 `"useLayoutEffect does nothing on the server"` 경고가 stderr 에 출력되던 노이즈 제거.
  - `Dialog` / `Progress` 의 `console.error` dev warning 에 `process.env.NODE_ENV !== 'production'` 가드 추가 — production 콘솔 노이즈 방지 + 번들러의 dead-code 제거 가능.
  - `Toast.Root` unmount 시 `closeTimerRef` cleanup effect 추가 — 빠른 unmount 시 stale 컴포넌트에 `setOpen(false)` 가 호출되던 race 차단.
  - `Slider.registerThumb` 시그니처 변경: `() => number` → `() => { index, unregister }`. Thumb 동적 add/remove 시 카운터 누수 차단. (internal contract 변경, 외부 사용자 영향 0.)
  - `Tooltip` Provider 의 `isOpenDelayedRef` 를 ref 대신 state 로 변경 — render 중 ref.current 를 직접 읽어 첫 렌더 시 capture 된 값이 stale 해지던 race 해소.

  ## 캡슐화·구조 정돈

  - `ScrollArea` 를 `headless/src/shared/` (internal building block) → `headless/src/primitives/` 로 이동. 5-tier 분류와의 일관성 회복. `@gugbab/headless` barrel 경로는 그대로이므로 사용자 영향 0.
  - `cn` 유틸리티를 styled-mui / styled-radix 의 로컬 `utils/cn.ts` 중복 정의에서 `@gugbab/utils/string/cn` 으로 hoist. styled-\* 의 internal import 변경, 외부 사용자 영향 0.
  - styled-mui / styled-radix 의 `scripts/build-css.mjs` 중복을 루트 `scripts/build-styled-css.mjs` 한 파일로 통합 (`<variant>` 인자로 분기).
  - `headless/src/index.ts` 의 `shared/*` 노출 의도 명시 주석 추가 — v2 에서 stable Advanced API 로 graduate 할지 internal subpath 로 격리할지 결정 예정.

  ## DRY / minor cleanup

  - `useLatestRef` 중복 정의 2곳(DismissableLayer, FocusScope) 제거 → `@gugbab/hooks` 의 단일 정의 사용.
  - `Slot.tsx` 의 `Symbol.for('react.lazy')` 모듈 상수로 호이스팅 (render 마다 호출되던 lookup 1회 감소).
  - `RovingFocusGroup` 의 `setTimeout(0)` 에 cleanup 추가 — 키 입력 직후 unmount 시 detached 노드에 focus 시도하던 race 차단.
  - `Dialog` 의 `eslint-disable` 주석 → `biome-ignore` 로 통일 (프로젝트가 Biome 사용).
  - `@gugbab/utils` 의 미사용 `type-fest` devDep 제거.
  - `Toast.Viewport` 의 hotkey effect 가 inline `hotkey` prop 으로 매 렌더 listener 재설치되던 churn 차단 — `useLatestRef` 로 핸들러는 mount-only 등록.
  - `DismissableLayer` 의 모듈-레벨 mutable state (`originalBodyPointerEvents`) 를 `WeakMap<Document, string | null>` 로 격리. SSR 멀티-테넌트 cross-request leak 가능성 차단.
  - `forwardRef` 컴포넌트의 `displayName` 명시 일관성 — 13곳에 명시되어 있던 displayName 을 모두 제거하고 named function expression 의 자동 추론에 일관 의존 (DevTools 표시는 동일).

  ## 회귀 안전망 보강

  - `@gugbab/styled-mui` 와 `@gugbab/styled-radix` 에 다층 wrapper 테스트 추가:
    - **통합 smoke** (`styled-smoke.test.tsx`) — 35 컴포넌트 export integrity + compound part structure + 단순 컴포넌트 className 합성. styled-mui +32 / styled-radix +32.
    - **variant/size 회귀** (`variants.test.tsx`) — Accordion / AlertDialog / Dialog / Pagination / Slider / Combobox / Select / Toggle / ToggleGroup / Form 의 BEM modifier 분기 + consumer className 합성. styled-mui +31 / styled-radix +31.
    - **컴포넌트별 분리 테스트 28개씩** — 신규 wrapper 의 className 부착 / compound part / variant·size 분기 / consumer className 합성 / ref forwarding 을 컴포넌트 단위로 분리 검증 (Accordion / AlertDialog / AspectRatio / Breadcrumbs / Collapsible / Combobox / ContextMenu / Dialog / DropdownMenu / Form / HoverCard / Menubar / NavigationMenu / OneTimePasswordField / Pagination / Popover / Portal / ScrollArea / Select / Separator / Slider / Slot / Toast / Toggle / ToggleGroup / Toolbar / Tooltip / VisuallyHidden). styled-mui +97 / styled-radix +97.
    - **합계 +320 신규 테스트** (총 640 → **970 tests**).

  ## Style / 타입 정밀화

  - `Toolbar.ToggleGroup` 의 `(props as any)` 우회 제거 → `props.type` 으로 discriminated union narrow 후 spread.
  - `Slot` 의 `mergeProps` 핸들러 chain `(...a: any[])` cast 두 곳 → 단일 `(...a: unknown[]) => unknown` 타입 별칭으로 정리.
  - `Slot.Slottable` 의 `__slottableId` 에 `@internal` JSDoc 추가 — IDE / API extractor 가 사용자에게 노출하지 않도록 표시.

  ## 환경 / 호환성

  - 루트 `engines.node` 를 `>=20.17.0` → `>=20.19.0` 으로 상향 (개발 환경 — Storybook 10 요구치 일치).
  - 9 publishable 패키지의 `engines.node` 를 `>=20.17.0` → `>=18.0.0` 으로 _완화_. publishable 패키지의 `engines` 는 _소비자_ 환경 호환을 의미하므로 React 라이브러리 표준값(Node 18+)을 따른다.

  ## 성능 / 산출물 최적화

  - **Context Provider value 안정화** — 9 컴포넌트(Progress / Checkbox / Switch / Toolbar / NavigationMenu / Toast / Select / DropdownMenu / Menubar)의 `<Ctx.Provider value={{...}}>` 인라인 객체를 `useMemo` 로 감쌌다. Provider 가 부모 props 변경으로 재렌더될 때 모든 consumer 가 강제 재렌더되던 패턴 차단. 15곳 인라인 value 모두 정리.
  - **CSS 번들 minify** — `scripts/build-styled-css.mjs` 가 dist/styles.css 를 미니파이(주석 / 공백 / 트레일링 세미콜론 정리)하도록 변경. 사이즈 **약 19% 감소**:
    - `@gugbab/styled-mui/styles.css`: 74,498B → **57,663B** (-16,835B)
    - `@gugbab/styled-radix/styles.css`: 70,890B → **54,850B** (-16,040B)
    - 사용자가 import 만 하면 자동 적용. 디버그 빌드는 `--no-minify` 플래그 가능.
