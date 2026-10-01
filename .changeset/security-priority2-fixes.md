---
"@gugbab/utils": minor
"@gugbab/hooks": patch
---

보안·안정성 수정

- `readSSEStream`: 개행 없이 들어오는 라인에 상한(`maxBufferSize`, 기본 1,048,576자)을 두고, 초과하면 `RangeError`로 중단합니다(메모리 폭증 방지). **동작 변경:** 이전에는 통과하던, 개행 없이 1MB를 넘는 라인이 이제 오류가 됩니다. 상한 초과, 읽기 실패, `onEvent` 예외가 나면 스트림을 취소해 연결을 닫습니다. 옵션 타입 `ReadSSEStreamOptions`를 추가했습니다.
- `parseSSELine`: 이벤트 형식을 런타임에 검증하고 정규화합니다. 필수 필드 타입이 틀리거나 알 수 없는 `type`이면 `null`을 반환합니다(**동작 변경:** 이전에는 그대로 전달됨. `text`가 없는 chunk 때문에 화면에 `"undefined"`가 붙을 수 있었음). 선택 필드의 `null`은 허용해 제거하고, `safety_block`의 `resources`가 없으면 `[]`로 채웁니다. 알려지지 않은 여분 필드는 결과에 포함하지 않습니다.
- `withRetry`: `maxRetries`·`baseDelay`·`maxDelay`가 비정상이면 `RangeError`를 던집니다(이전엔 `Infinity`면 무한 재시도). 대기 상한 `maxDelay`(기본 30초)를 추가했고, `signal`(AbortSignal)로 중단할 수 있습니다. `shouldRetry`가 예외를 던져도 원래 오류로 reject합니다.
- `groupBy`: `toString`·`constructor`·`__proto__` 같은 키에서 크래시하거나 프로토타입이 바뀌던 문제를 수정했습니다.
- `useSSEChat`: 언마운트하면 진행 중인 요청을 abort하고, 이후 `onChunk`·`onDone`·`onError`를 호출하지 않습니다. 언마운트 없이 effect만 정리되는 경우(예: `<Activity mode="hidden">`)에도 요청을 끊고 `status`를 `idle`로 되돌립니다.
