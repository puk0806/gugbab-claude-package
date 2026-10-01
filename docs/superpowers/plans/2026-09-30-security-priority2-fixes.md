# 보안 2순위 수정 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
> 워크트리 금지 — `feature/fix-security-priority2` 브랜치(main 기준)에서 진행한다.

**Goal:** 2026-09-30 보안 감사에서 코드로 확인된 결함을 수정한다. 대상은 SSE 파서 DoS·무검증, useSSEChat 언마운트 누수, groupBy 예약 키 크래시, CI 서드파티 액션 태그 참조, 워크플로우 스크립트 인젝션 패턴이다.

**Architecture:** 코드 결함(Task 1~4)은 TDD로 수정한다. CI(Task 5~6)는 로컬에서 실행할 수 없으므로 정적 검증(`actionlint`가 없으면 YAML 파싱과 grep 단언)으로 확인한다. 외부 서비스 설정이 필요하거나 되돌리기 어려운 항목은 **결정 필요(D1~D4)**로 분리하고, 사용자 승인 없이는 구현하지 않는다.

**Tech Stack:** TypeScript, vitest, React 19, GitHub Actions

---

## 사전 확인 결과 (2026-09-30, 코드·원격으로 직접 확인)

| 감사 항목 | 확인 |
|---|---|
| M-5 `readSSEStream` 버퍼 상한 없음 | ✅ `read-sse-stream.ts:16-19` — 개행 없는 입력이 들어오면 buffer가 무한히 커진다 |
| M-6 `parseSSELine` 무검증 | ✅ `parse-sse-line.ts:7` `JSON.parse(raw) as SseEvent` |
| M-7 `useSSEChat` 언마운트 정리 없음 | ✅ `use-sse-chat.ts` 전체에 cleanup effect가 없다 |
| M-8 `groupBy` 예약 키 | ✅ `group-by.ts:5-13` `{}`의 `result["toString"]`이 상속된 함수라 `.push`에서 TypeError가 난다 |
| L-1 `onEvent` throw 시 스트림 미취소 | ✅ `finally`에서 `releaseLock`만 한다 |
| H-1 액션 태그 참조 | ✅ 10종. 특히 `changesets/action@v1`은 **브랜치**(움직이는 ref)이고, npm 토큰 주입 단계다 |
| M-1 `head.ref` 보간 | ✅ `visual-regression.yml:145,226` |

**액션 SHA (git ls-remote로 2026-09-30 조회)**

| 현재 | 고정 SHA | 버전 |
|---|---|---|
| `actions/checkout@v5` | `fbc6f3992d24b796d5a048ff273f7fcc4a7b6c09` | v5.1.0 |
| `pnpm/action-setup@v4` | `b906affcce14559ad1aafd4ab0e942779e9f58b1` | v4.3.0 |
| `pnpm/action-setup@v6` | `0977fd99725f1db4007ccb2928dbb4e90d06cc86` | v6.0.10 |
| `actions/setup-node@v4` | `49933ea5288caeca8642d1e84afbd3f7d6820020` | v4.4.0 |
| `actions/setup-node@v6` | `249970729cb0ef3589644e2896645e5dc5ba9c38` | v6.5.0 |
| `changesets/action@v1` (브랜치) | `a45c4d594aa4e2c509dc14a9f2b3b67ba3780d0d` | v1.9.0 |
| `dorny/paths-filter@v3` | `0e4a8c6effa4802afeda77dc8d303f8176d7dfad` | v3.0.4 |
| `thollander/actions-comment-pull-request@v3` | `24bffb9b452ba05a4f3f77933840a6a841d1b32b` | v3.0.1 |
| `peter-evans/create-pull-request@v7` | `22a9089034f40e5a961c8808d113e2c98fb63676` | v7.0.11 |
| `actions/upload-artifact@v4` | `ea165f8d65b6e75b540449e92b4886f43607fa02` | v4.6.2 |

> 실행 직전에 같은 명령으로 재조회해 태그가 옮겨지지 않았는지 확인한다:
> `git ls-remote https://github.com/<repo> "refs/tags/<tag>^{}" "refs/tags/<tag>"`

---

## 사전 준비

- [ ] **Step 0-1: 브랜치**

```bash
git checkout main && git checkout -b feature/fix-security-priority2
```

- [ ] **Step 0-2: 기준선** — `pnpm build && pnpm typecheck && pnpm test`가 GREEN이어야 한다

> `@gugbab/hooks`는 `@gugbab/utils`를 dist로 소비한다. Task 1~3 이후 hooks 테스트 전에 `pnpm --filter @gugbab/utils build`.

---

### Task 1: groupBy — 예약 키(`__proto__`·`constructor`·`toString`) 안전 처리

**Files:** Modify `packages/utils/src/array/group-by.ts`, Test `packages/utils/src/array/group-by.test.ts`

- [ ] **Step 1: 실패 테스트** — describe 안에 추가

```ts
    describe("예약·상속 키 (악성 입력 방어)", () => {
        it("toString·constructor 키로 그룹화해도 크래시하지 않는다", () => {
            const result = groupBy(["a", "b", "c"], (_, i) => (i === 0 ? "toString" : "constructor"));
            expect(result.toString).toEqual(["a"]);
            expect(result.constructor).toEqual(["b", "c"]);
        });

        it("__proto__ 키는 자기 속성으로 저장되고 프로토타입을 오염시키지 않는다", () => {
            const result = groupBy([1, 2], () => "__proto__");
            expect(Object.hasOwn(result, "__proto__")).toBe(true);
            expect(Object.getOwnPropertyDescriptor(result, "__proto__")?.value).toEqual([1, 2]);
            expect(Object.getPrototypeOf(result)).toBe(Object.prototype);
            expect(({} as Record<string, unknown>).polluted).toBeUndefined();
        });

        it("일반 키와 예약 키가 섞여도 순서를 보존한다 (경계)", () => {
            const result = groupBy(["x", "y", "z"], (v) => (v === "y" ? "hasOwnProperty" : "normal"));
            expect(result.normal).toEqual(["x", "z"]);
            expect(result.hasOwnProperty).toEqual(["y"]);
        });
    });
```

- [ ] **Step 2: 실패 확인** — `pnpm --filter @gugbab/utils exec vitest run src/array/group-by.test.ts`
  Expected: FAIL. `bucket.push is not a function` TypeError가 나고, `__proto__` 테스트는 own property false.

- [ ] **Step 3: 구현**

```ts
export function groupBy<T, K extends PropertyKey>(
    array: readonly T[],
    keyFn: (item: T, index: number) => K,
): Record<K, T[]> {
    const result = {} as Record<K, T[]>;
    array.forEach((item, index) => {
        const key = keyFn(item, index);
        // Own-property check: inherited members (toString, constructor, …)
        // must not be mistaken for an existing bucket.
        if (Object.hasOwn(result, key)) {
            result[key].push(item);
        } else {
            // defineProperty: plain assignment to "__proto__" would replace the
            // prototype instead of creating a key.
            Object.defineProperty(result, key, { value: [item], writable: true, enumerable: true, configurable: true });
        }
    });
    return result;
}
```

- [ ] **Step 4: 통과 확인** — 같은 명령. Expected: PASS(기존 4건 + 신규 3건)
- [ ] **Step 5: 커밋** — `[pkg] Fix: groupBy 예약·상속 키에서 크래시·프로토타입 변경`

---

### Task 2: parseSSELine — 이벤트 런타임 검증

**설계:** 알려진 4개 타입의 필수 필드 타입을 확인한다. 형식이 틀리거나 알 수 없는 타입이면 `null`을 반환한다. 이렇게 하면 반환 타입(`SseEvent`)이 런타임에서도 참이 된다. `safety_block`은 3순위(M7, relay 전용 필드 분리)에서 다루므로 여기서는 검증만 한다.

**Files:** Modify `packages/utils/src/sse/parse-sse-line.ts`, Test `packages/utils/src/sse/parse-sse-line.test.ts`

- [ ] **Step 1: 실패 테스트**

```ts
    describe("형식 검증 (악성·비정상 페이로드)", () => {
        it.each([
            ['data: {"type":"chunk"}', "chunk에 text 없음"],
            ['data: {"type":"chunk","text":{"x":1}}', "chunk text가 객체"],
            ['data: {"type":"error"}', "error에 message 없음"],
            ['data: {"type":"done","summary":42}', "done summary가 숫자"],
            ['data: {"type":"safety_block","category":"x","message":"m","resources":"nope"}', "resources가 배열 아님"],
            ['data: {"type":"safety_block","category":"x","message":"m","resources":[{"url":1}]}', "resource url이 숫자"],
            ['data: {"type":"unknown","text":"t"}', "알 수 없는 type"],
            ["data: [1,2,3]", "배열 페이로드"],
            ['data: "chunk"', "문자열 페이로드"],
            ["data: null", "null 페이로드"],
        ])("%s → null (%s)", (line) => {
            expect(parseSSELine(line)).toBeNull();
        });

        it("__proto__ 키가 있어도 정상 필드만 있으면 통과하고 프로토타입을 오염시키지 않는다", () => {
            const event = parseSSELine('data: {"type":"chunk","text":"hi","__proto__":{"polluted":true}}');
            expect(event).toMatchObject({ type: "chunk", text: "hi" });
            expect(({} as Record<string, unknown>).polluted).toBeUndefined();
        });

        it("유효한 safety_block은 그대로 반환한다", () => {
            const line =
                'data: {"type":"safety_block","category":"self_harm","message":"m","resources":[{"url":"https://a.example","title":"A"},{}]}';
            expect(parseSSELine(line)).toEqual({
                type: "safety_block",
                category: "self_harm",
                message: "m",
                resources: [{ url: "https://a.example", title: "A" }, {}],
            });
        });
    });
```

- [ ] **Step 2: 실패 확인** — `pnpm --filter @gugbab/utils exec vitest run src/sse/parse-sse-line.test.ts`
  Expected: FAIL. `it.each`의 대부분이 객체를 반환해 null이 아니다.

- [ ] **Step 3: 구현**

```ts
import type { SseEvent } from "./types";

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isOptionalString(value: unknown): boolean {
    return value === undefined || typeof value === "string";
}

function isSseEvent(value: unknown): value is SseEvent {
    if (!isRecord(value)) return false;
    switch (value.type) {
        case "chunk":
            return typeof value.text === "string";
        case "done":
            return isOptionalString(value.summary);
        case "error":
            return typeof value.message === "string";
        case "safety_block":
            return (
                typeof value.category === "string" &&
                typeof value.message === "string" &&
                Array.isArray(value.resources) &&
                value.resources.every((r) => isRecord(r) && isOptionalString(r.url) && isOptionalString(r.title))
            );
        default:
            return false;
    }
}

export function parseSSELine(line: string): SseEvent | null {
    if (!line || line.startsWith(":") || !line.startsWith("data:")) return null;
    const raw = line.slice(5).trim();
    let parsed: unknown;
    try {
        parsed = JSON.parse(raw);
    } catch {
        return null;
    }
    return isSseEvent(parsed) ? parsed : null;
}
```

- [ ] **Step 4: 통과 확인** — 같은 명령 + `to-sse-line.test.ts`(왕복 파싱)도 PASS
- [ ] **Step 5: 커밋** — `[pkg] Fix: parseSSELine 이벤트 형식 런타임 검증`

---

### Task 3: readSSEStream — 버퍼 상한·스트림 취소

**설계:**
- 세 번째 인자로 `options?: { maxBufferSize?: number }`를 받는다(기본 1,048,576자). 개행 없이 남은 미완성 라인이 상한을 넘으면 스트림을 `cancel()`하고 `RangeError`를 던진다.
- `onEvent`가 throw하거나 읽기가 실패해도 스트림을 cancel한 뒤 같은 에러를 다시 던진다.
- `maxBufferSize`가 양의 유한수가 아니면 즉시 `RangeError`를 던진다.
- 공개 API에 옵션만 추가하므로 하위 호환된다(utils minor).

**Files:** Modify `packages/utils/src/sse/read-sse-stream.ts`, Test `packages/utils/src/sse/read-sse-stream.test.ts`

- [ ] **Step 1: 실패 테스트**

```ts
function makeTrackedStream(chunks: string[], close = true) {
    const cancel = vi.fn();
    const stream = new ReadableStream<Uint8Array>({
        start(controller) {
            for (const chunk of chunks) controller.enqueue(new TextEncoder().encode(chunk));
            if (close) controller.close();
        },
        cancel,
    });
    return { stream, cancel };
}

describe("readSSEStream — 버퍼 상한·취소 (DoS·오류 경로)", () => {
    it("개행 없는 라인이 상한을 넘으면 RangeError로 중단하고 스트림을 취소한다", async () => {
        const { stream, cancel } = makeTrackedStream(["data: ", "x".repeat(50), "y".repeat(50)], false);
        await expect(readSSEStream(stream, vi.fn(), { maxBufferSize: 64 })).rejects.toThrow(RangeError);
        expect(cancel).toHaveBeenCalled();
    });

    it("완성된 라인들의 총량이 상한을 넘어도 각 라인이 상한 이내면 정상 처리한다 (경계)", async () => {
        const line = 'data: {"type":"chunk","text":"abcdefghij"}\n';
        const onEvent = vi.fn();
        const { stream } = makeTrackedStream(Array.from({ length: 20 }, () => line));
        await readSSEStream(stream, onEvent, { maxBufferSize: line.length + 1 });
        expect(onEvent).toHaveBeenCalledTimes(20);
    });

    it("onEvent가 throw하면 같은 에러로 reject하고 스트림을 취소한다", async () => {
        const { stream, cancel } = makeTrackedStream(['data: {"type":"chunk","text":"a"}\n'], false);
        const boom = new Error("boom");
        await expect(
            readSSEStream(stream, () => {
                throw boom;
            }),
        ).rejects.toBe(boom);
        expect(cancel).toHaveBeenCalled();
    });

    it.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY])("maxBufferSize=%s는 RangeError", async (max) => {
        const { stream } = makeTrackedStream([]);
        await expect(readSSEStream(stream, vi.fn(), { maxBufferSize: max })).rejects.toThrow(RangeError);
    });

    it("옵션 없이 호출하면 기존 동작 그대로다 (하위 호환)", async () => {
        const onEvent = vi.fn();
        const { stream } = makeTrackedStream(['data: {"type":"done"}\n']);
        await readSSEStream(stream, onEvent);
        expect(onEvent).toHaveBeenCalledWith({ type: "done" });
    });
});
```

- [ ] **Step 2: 실패 확인** — `pnpm --filter @gugbab/utils exec vitest run src/sse/read-sse-stream.test.ts`
  Expected: FAIL. 상한 테스트와 onEvent 테스트가 hang되지 않도록 close=false 스트림은 cancel 전까지 pending이다. 현재 구현은 상한이 없어 **무한 대기**하므로 vitest 기본 timeout(5s)으로 실패한다. onEvent throw 테스트는 reject되지만 cancel이 호출되지 않아 실패한다.

- [ ] **Step 3: 구현**

```ts
import { parseSSELine } from "./parse-sse-line";
import type { SseEvent } from "./types";

export interface ReadSSEStreamOptions {
    /**
     * Max characters of a single unterminated line kept in memory. A peer that
     * never sends a newline would otherwise grow the buffer without bound.
     * Default: 1,048,576.
     */
    maxBufferSize?: number;
}

const DEFAULT_MAX_BUFFER_SIZE = 1_048_576;

export async function readSSEStream(
    body: ReadableStream<Uint8Array>,
    onEvent: (event: SseEvent) => void,
    options: ReadSSEStreamOptions = {},
): Promise<void> {
    const maxBufferSize = options.maxBufferSize ?? DEFAULT_MAX_BUFFER_SIZE;
    if (!Number.isFinite(maxBufferSize) || maxBufferSize <= 0) {
        throw new RangeError(`maxBufferSize must be a positive finite number (received ${maxBufferSize})`);
    }

    const reader = body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    const emit = (line: string) => {
        const event = parseSSELine(line);
        if (event) onEvent(event);
    };

    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });

            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";
            for (const line of lines) emit(line);

            if (buffer.length > maxBufferSize) {
                throw new RangeError(`SSE line exceeded maxBufferSize (${maxBufferSize} characters)`);
            }
        }

        // flush decoder's internal multibyte buffer, then process any remaining lines
        buffer += decoder.decode();
        for (const line of buffer.split("\n")) emit(line);
    } catch (error) {
        // Stop the producer — otherwise the connection stays open after we give up.
        await reader.cancel(error).catch(() => {});
        throw error;
    } finally {
        reader.releaseLock();
    }
}
```

`packages/utils/src/sse/index.ts`에 타입 export를 추가한다:
```ts
export type { ReadSSEStreamOptions } from "./read-sse-stream";
```

- [ ] **Step 4: 통과 확인** — 같은 명령. Expected: PASS(기존 6건 + 신규 8건)
- [ ] **Step 5: 커밋** — `[pkg] Fix: readSSEStream 버퍼 상한·실패 시 스트림 취소`

---

### Task 4: useSSEChat — 언마운트 시 요청 중단

**Files:** Modify `packages/hooks/src/network/use-sse-chat.ts`, Test `packages/hooks/src/network/use-sse-chat.test.tsx`

- [ ] **Step 0:** `pnpm --filter @gugbab/utils build` (hooks는 utils dist를 소비한다)

- [ ] **Step 1: 실패 테스트** — describe 안에 추가

```tsx
    describe("언마운트 (경쟁·누수)", () => {
        function controllableFetch() {
            let controller!: ReadableStreamDefaultController<Uint8Array>;
            let signal: AbortSignal | undefined;
            const body = new ReadableStream<Uint8Array>({
                start(c) {
                    controller = c;
                },
            });
            vi.mocked(fetch).mockImplementation((_url, init) => {
                signal = init?.signal ?? undefined;
                return Promise.resolve(new Response(body, { status: 200 }));
            });
            const push = (line: string) => controller.enqueue(new TextEncoder().encode(line));
            return { push, close: () => controller.close(), getSignal: () => signal };
        }

        it("언마운트하면 진행 중인 fetch를 abort하고 이후 chunk 콜백을 호출하지 않는다", async () => {
            const onChunk = vi.fn();
            const net = controllableFetch();
            const { result, unmount } = renderHook(() => useSSEChat({ url: "/api/chat", onChunk }));

            let pending!: Promise<void>;
            act(() => {
                pending = result.current.send({});
            });
            await act(async () => {
                net.push('data: {"type":"chunk","text":"a"}\n');
                await Promise.resolve();
            });
            await vi.waitFor(() => expect(onChunk).toHaveBeenCalledWith("a"));

            unmount();
            expect(net.getSignal()?.aborted).toBe(true);

            net.push('data: {"type":"chunk","text":"b"}\n');
            net.close();
            await pending;

            expect(onChunk).toHaveBeenCalledTimes(1);
        });

        it("요청 없이 언마운트해도 오류가 없다 (경계)", () => {
            const { unmount } = renderHook(() => useSSEChat({ url: "/api/chat" }));
            expect(() => unmount()).not.toThrow();
        });
    });
```

- [ ] **Step 2: 실패 확인** — `pnpm --filter @gugbab/hooks exec vitest run src/network/use-sse-chat.test.tsx`
  Expected: FAIL. `aborted`가 false이고 onChunk가 2회 호출된다.

- [ ] **Step 3: 구현** — import에 `useEffect`를 추가하고, `abort` 정의 아래에 다음을 넣는다

```ts
    // Unmount: abort the in-flight request and invalidate its generation so
    // late events from the reader are dropped (no callbacks after unmount).
    useEffect(
        () => () => {
            generationRef.current++;
            abortRef.current?.abort();
            abortRef.current = null;
        },
        [],
    );
```

- [ ] **Step 4: 통과 확인** — 같은 명령 + `pnpm --filter @gugbab/hooks test`
- [ ] **Step 5: 커밋** — `[pkg] Fix: useSSEChat 언마운트 시 요청 abort·콜백 차단`

---

### Task 5: CI — 서드파티 액션 SHA 고정 + Dependabot

**Files:** Modify `.github/workflows/*.yml` (6개), Create `.github/dependabot.yml`

- [ ] **Step 1: 치환** — 각 `uses: <repo>@<tag>`를 `uses: <repo>@<SHA> # <버전>`으로 바꾼다(위 표 기준). 예:

```yaml
      - uses: actions/checkout@fbc6f3992d24b796d5a048ff273f7fcc4a7b6c09 # v5.1.0
      - uses: changesets/action@a45c4d594aa4e2c509dc14a9f2b3b67ba3780d0d # v1.9.0
```

- [ ] **Step 2: Dependabot** — `.github/dependabot.yml`

```yaml
version: 2
updates:
  - package-ecosystem: github-actions
    directory: /
    schedule:
      interval: weekly
    groups:
      actions:
        patterns: ["*"]
```

- [ ] **Step 3: 정적 검증**

```bash
grep -nE "uses: [^ ]+@" .github/workflows/*.yml | grep -vE "@[0-9a-f]{40} # v" && echo "UNPINNED FOUND" || echo "all pinned"
node -e "for (const f of require('fs').readdirSync('.github/workflows')) require('yaml').parse(require('fs').readFileSync('.github/workflows/'+f,'utf8')); console.log('yaml ok')"
```
Expected: `all pinned`, `yaml ok`. `yaml` 모듈이 없으면 `npx --yes yaml valid < file`로 대체하거나 `python3 -c "import yaml"`을 쓴다.

- [ ] **Step 4: 커밋** — `[config] Improve: GitHub Actions 서드파티 액션 SHA 고정·Dependabot`

---

### Task 6: CI — 스크립트 인젝션 패턴 제거 + 체크아웃 SHA 고정

**Files:** Modify `.github/workflows/visual-regression.yml`, `.github/workflows/visual-regression-baseline.yml`

- [ ] **Step 1:** `visual-regression.yml`
  - 36행 checkout: `ref: ${{ github.event.pull_request.head.sha || github.sha }}`로 바꾼다. 라벨 이후 새 커밋이 들어와도 **이벤트 시점 커밋**을 빌드한다. 브랜치가 움직였다면 아래 push는 non-fast-forward로 **실패**하므로 안전하다.
  - 145행, 226행 두 step에 `env: HEAD_REF: ${{ github.event.pull_request.head.ref }}`를 추가하고(기존 `env: HUSKY`와 병합), 본문을 다음으로 바꾼다:
    ```bash
    git push origin "HEAD:refs/heads/${HEAD_REF}"
    ```
- [ ] **Step 2:** `visual-regression-baseline.yml:61`의 해당 step에 `env: PROJECT_INPUT: ${{ inputs.project || 'both' }}`를 추가하고, 본문은 `PROJECT="${PROJECT_INPUT}"`로 바꾼다.
- [ ] **Step 3: 정적 검증**

```bash
grep -nE 'run:.*\$\{\{ *github\.event\.pull_request\.head\.ref' .github/workflows/*.yml; \
grep -nE '^\s+git push origin HEAD:\$\{\{' .github/workflows/*.yml && echo "INJECTION PATTERN LEFT" || echo "clean"
```
Expected: `clean`. YAML 파싱은 Task 5 Step 3과 같다.

- [ ] **Step 4: 커밋** — `[config] Fix: 시각 회귀 워크플로우 head.ref 보간 제거·체크아웃 SHA 고정`

> 실제 동작 확인은 PR의 CI에서만 가능하다. 다음 PR에 `accept-baseline` 라벨 흐름을 한 번 돌려 확인하도록 보고에 명시한다.

---

### Task 7: `.gitignore` 환경 파일 패턴 강화

- [ ] `.gitignore`의 `.env`, `.env.local`, `.env.*.local` 3줄을 다음으로 교체한다:

```gitignore
.env
.env.*
!.env.example
```
검증: `git check-ignore -v .env.production` → 매칭, `git check-ignore .env.example` → 매칭 없음(exit 1)
- [ ] 커밋: `[config] Improve: .env 계열 파일 전부 무시`

---

### Task 8: changeset + 전체 검증

- [ ] `.changeset/security-priority2-fixes.md`

```md
---
"@gugbab/utils": minor
"@gugbab/hooks": patch
---

보안·안정성 수정

- `readSSEStream`: 개행 없이 들어오는 라인에 상한(`maxBufferSize`, 기본 1,048,576자)을 두고, 초과 시 `RangeError`로 중단합니다. 상한 초과, 읽기 실패, `onEvent` 예외 때는 스트림을 취소합니다. `ReadSSEStreamOptions` 타입을 추가했습니다.
- `parseSSELine`: 이벤트 형식을 런타임에 검증합니다. 필수 필드 타입이 틀리거나 알 수 없는 `type`이면 `null`을 반환합니다. 이전에는 `text`가 없는 chunk 등이 그대로 통과했습니다.
- `groupBy`: `toString`·`constructor`·`__proto__` 같은 키에서 크래시하거나 프로토타입이 바뀌던 문제를 수정했습니다.
- `useSSEChat`: 언마운트하면 진행 중인 요청을 abort하고, 이후 콜백을 호출하지 않습니다.
```

- [ ] 전체 검증: `pnpm install --frozen-lockfile && pnpm build && pnpm typecheck && pnpm test && pnpm exec biome ci .`
- [ ] 독립 코드 리뷰(Codex 불가 시 code-reviewer 에이전트)
- [ ] 커밋: `[pkg] Add: 보안 2순위 수정 changeset`

---

## 결정 필요 (사용자 승인 전 구현하지 않음)

| # | 항목 | 이유 | 필요한 것 |
|---|---|---|---|
| D1 | **npm Trusted Publishing(OIDC) 전환** (H-2) | 장기 `NPM_TOKEN` 제거. 공식 요건은 npm CLI ≥ 11.5.1, Node ≥ 22.14.0이고, provenance는 자동이다(docs.npmjs.com/trusted-publishers, 2026-09-30 확인) | ① 사용자가 npmjs.com에서 **패키지 9개 각각**에 Trusted Publisher(레포, `release.yml`, `relay-types-publish.yml`)를 등록해야 한다 ② 이 레포는 **pnpm 9.9.0의 `pnpm publish`**로 게시하는데, pnpm이 OIDC를 지원하는지는 **미확인**이다. 게시 명령을 `npm publish`로 바꾸거나 pnpm을 올려야 할 수 있다 ③ 잘못되면 **다음 릴리스 게시가 실패**한다 |
| D2 | relay-types 게시 승인 게이트·main 직접 push 제거 (M-3·M-4) | 외부 스펙을 무검증으로 자동 게시하고 main에 직접 커밋한다 | GitHub Environment(required reviewers) 설정은 사용자가 GitHub에서 해야 한다. 자동 게시 흐름(메모리: 스펙 변경 시 자동 게시)을 바꿀지 결정 |
| D3 | 시각 회귀 워크플로우 권한 job 분리 (M-2) | PR 코드가 `contents: write` 토큰을 가진 채 빌드된다 | 단일 job 430줄을 build(read)와 push(write)로 나누는 구조 변경이다. 로컬 검증이 불가능하고 CI 왕복이 필요하다 |
| D4 | GitHub 저장소 설정 점검 | 브랜치 보호, ruleset bypass, Environment 보호는 파일로 확인할 수 없다 | 사용자가 설정 화면에서 확인 |

## 범위 밖

- `withRetry` 상한·AbortSignal(L-5), 의존성 CVE(`pnpm audit`), pnpm lifecycle script 허용 목록 → 필요 시 별도
- utils SSE 타입의 relay 전용 `safety_block` 분리(M-7 구조) → 3순위

## 실행 후 반영 (2026-09-30, 독립 코드 리뷰)

- useSSEChat: 언마운트 없이 effect만 정리되는 경로(`<Activity mode="hidden">` 등)에서 status가 `streaming`에 멈추던 문제 → cleanup에서 `idle` 복구. 이 테스트 환경에서는 StrictMode 이중 effect가 재현되지 않아(`renderHook` 1회 setup 확인) Activity로 RED 재현
- parseSSELine: 검증 → **정규화**로 변경. 선택 필드 `null` 허용·제거, `safety_block.resources` 누락·`null` → `[]`(안전 안내 유실 방지), 여분 필드 미포함
- readSSEStream: `cancel()` 비대기(미정착 cancel이 에러를 삼키지 않도록), 상한 단위(UTF-16 code units)·완성 라인 비제한 문서화
- 워크플로우: SNAPBRANCH push도 `refs/heads/` 접두사. Dependabot은 minor/patch만 그룹화, major는 개별 PR
- changeset: 동작 변경(1MB 초과 라인 오류, 무효 이벤트 폐기) 명시
- 미반영(추적): Dependabot PR의 읽기 전용 토큰으로 코멘트 단계가 403 실패할 가능성(미확인) → 첫 Dependabot PR에서 확인

## 후속 반영 (2026-10-01, "남은 작업 전부" 요청)

- `withRetry` (감사 L-5): 옵션 검증(RangeError), `maxDelay` 상한(기본 30초), `AbortSignal` 지원, `shouldRetry` 예외가 원래 오류를 가리지 않게 했다. 테스트 12건은 모두 수정 전 RED였다.
- `total-content-bytes` waiver (qa 지적): **유지**. qa가 제안한 경계 케이스(멀티바이트·이모지·빈 값·깨진 서로게이트)가 이미 있고, 상한 파라미터가 없는 함수라 NaN·음수 케이스는 해당하지 않는다. waiver 사유가 사실과 일치한다.
- `pnpm audit`·lifecycle 스크립트 허용 목록은 lockfile을 건드려서 3순위 브랜치(lockfile 소유)에서 처리한다.
