# @gugbab/styled-mui

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

- Updated dependencies [57cfcff]
  - @gugbab/headless@1.0.1
  - @gugbab/utils@1.0.1
