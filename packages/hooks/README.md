# @gugbab/hooks

`@gugbab/*` 헤드리스 React 컴포넌트의 빌딩블록이 되는 프레임워크 독립 공용 훅 모음.

- React 18 / 19 지원 (`peerDependencies: react >=18`)
- 순수 계산이 필요한 경우 `@gugbab/utils`를 내부에서 사용
- Dual ESM / CJS 빌드 + 타입 정의

## 카테고리

| 카테고리 | 훅 | 설명 |
| --- | --- | --- |
| lifecycle | `useIsomorphicLayoutEffect` | SSR 환경에서 `useLayoutEffect` 대신 안전하게 쓰는 훅 |
| lifecycle | `useMounted` | 컴포넌트 마운트 여부를 읽기 전용으로 반환 |
| ref | `useLatestRef` | 최신 값을 가리키는 ref (렌더마다 업데이트) |
| ref | `useEventCallback` | 렌더 간 안정적 identity를 유지하는 이벤트 핸들러 |
| ref | `useMergedRefs` | 여러 ref를 하나로 합치는 콜백 ref |
| binding | `useDebouncedValue` | 디바운스된 값 (`@gugbab/utils/debounce` 기반) |
| binding | `useDebouncedCallback` | 디바운스된 콜백 (cleanup 자동 처리) |
| binding | `useThrottledCallback` | 쓰로틀된 콜백 (cleanup 자동 처리) |
| state | `useControllableState` | controlled / uncontrolled 자동 전환 (headless 패턴) |
| dom | `useEventListener` | 타입 안전한 DOM 이벤트 리스너 |
| dom | `useOnClickOutside` | 특정 요소 밖 클릭 감지 (팝오버·다이얼로그용) |
| speech | `useSpeechRecognition` | Web Speech API 음성 인식(STT) — listening/interim/error 상태 + stale 세션 가드 |
| speech | `useSpeak` | speechSynthesis 발화(TTS) — voice 비동기 로딩·언마운트 cancel 대응 |
| speech | `createRecognizer` | 프레임워크 독립 STT 코어 (훅 없이 직접 제어할 때) |
| speech | `pickVoice` / `listVoices` | voice 선택 유틸 (preferredURI > lang 정확 일치 > primary subtag) |
| speech | `isSpeechRecognitionSupported` / `isSpeechSynthesisSupported` | 지원 감지 (부분 구현 방어 포함) |
| push | `usePushSubscription` | Web Push 구독·해지 — 권한 요청(제스처 유지)·중복 탭 방어·VAPID 키 교체·서버 저장 실패 시 되돌림 |
| push | `getPushSupport` | `supported` / `ios-needs-install`(iOS 홈 화면 PWA 필요) / `unsupported` |

## 설치

```sh
pnpm add @gugbab/hooks
```

## 사용 예

```tsx
import { useControllableState, useOnClickOutside } from '@gugbab/hooks';

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

### 웹 푸시 구독

브라우저 쪽(권한·구독·해지)만 다룬다. 서비스워커의 `push` 이벤트 처리와 서버 발송(`web-push` 등)은 앱에서 구현한다.

```tsx
'use client';
import { usePushSubscription } from '@gugbab/hooks';

const MESSAGES = {
  'permission-denied': '브라우저 설정에서 알림을 허용해 주세요',
  'ios-needs-install': '공유 → 홈 화면에 추가 후 앱에서 다시 시도해 주세요',
} as const;

function PushToggle() {
  const push = usePushSubscription({
    vapidPublicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? '',
    // 서비스워커 등록 완료까지 기다리려면 지정 (기본은 getRegistration — 미등록이면 no-service-worker)
    getRegistration: () => navigator.serviceWorker.ready,
    onSubscribe: async (sub) => {
      const res = await fetch('/api/push/subscribe', { method: 'POST', body: JSON.stringify(sub) });
      if (!res.ok) throw new Error('save failed'); // throw → sync-failed + 새 구독 되돌림
    },
    onUnsubscribe: async (sub) => {
      await fetch('/api/push/unsubscribe', { method: 'POST', body: JSON.stringify({ endpoint: sub.endpoint }) });
    },
  });

  if (push.support === 'unsupported') return null;
  const busy = push.status !== 'idle';

  return (
    <>
      {/* subscribe()는 반드시 클릭 핸들러 안에서 — iOS는 사용자 제스처 밖 권한 요청을 거부 */}
      <button disabled={busy} onClick={() => (push.subscription ? push.unsubscribe() : push.subscribe())}>
        {push.subscription ? '알림 끄기' : '알림 켜기'}
      </button>
      {push.error && <p>{MESSAGES[push.error as keyof typeof MESSAGES] ?? '알림 설정에 실패했어요'}</p>}
    </>
  );
}
```

`PushError`: `unsupported` · `ios-needs-install` · `invalid-key` · `permission-denied` · `permission-dismissed` · `no-service-worker` · `subscribe-failed` · `unsubscribe-failed` · `sync-failed`
