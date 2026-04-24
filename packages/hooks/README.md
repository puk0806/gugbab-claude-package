# @gugbab-ui/hooks

`@gugbab-ui/*` 헤드리스 React 컴포넌트의 빌딩블록이 되는 프레임워크 독립 공용 훅 모음.

- React 18 / 19 지원 (`peerDependencies: react >=18`)
- 순수 계산이 필요한 경우 `@gugbab-ui/utils`를 내부에서 사용
- Dual ESM / CJS 빌드 + 타입 정의

## 카테고리

| 카테고리 | 훅 | 설명 |
| --- | --- | --- |
| lifecycle | `useIsomorphicLayoutEffect` | SSR 환경에서 `useLayoutEffect` 대신 안전하게 쓰는 훅 |
| lifecycle | `useMounted` | 컴포넌트 마운트 여부를 읽기 전용으로 반환 |
| ref | `useLatestRef` | 최신 값을 가리키는 ref (렌더마다 업데이트) |
| ref | `useEventCallback` | 렌더 간 안정적 identity를 유지하는 이벤트 핸들러 |
| ref | `useMergedRefs` | 여러 ref를 하나로 합치는 콜백 ref |
| binding | `useDebouncedValue` | 디바운스된 값 (`@gugbab-ui/utils/debounce` 기반) |
| binding | `useDebouncedCallback` | 디바운스된 콜백 (cleanup 자동 처리) |
| binding | `useThrottledCallback` | 쓰로틀된 콜백 (cleanup 자동 처리) |
| state | `useControllableState` | controlled / uncontrolled 자동 전환 (headless 패턴) |
| dom | `useEventListener` | 타입 안전한 DOM 이벤트 리스너 |
| dom | `useOnClickOutside` | 특정 요소 밖 클릭 감지 (팝오버·다이얼로그용) |

## 설치

```sh
pnpm add @gugbab-ui/hooks
```

## 사용 예

```tsx
import { useControllableState, useOnClickOutside } from '@gugbab-ui/hooks';

function Popover(props: { open?: boolean; defaultOpen?: boolean; onOpenChange?: (v: boolean) => void }) {
  const [open, setOpen] = useControllableState({
    value: props.open,
    defaultValue: props.defaultOpen,
    onChange: props.onOpenChange,
  });

  const ref = useRef<HTMLDivElement>(null);
  useOnClickOutside(ref, () => setOpen(false), open);

  return open ? <div ref={ref}>...</div> : null;
}
```
