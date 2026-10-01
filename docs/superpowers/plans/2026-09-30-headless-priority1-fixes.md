# Headless 1순위 버그 5건 수정 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
> 이 레포는 워크트리를 쓰지 않는다 — `feature/fix-headless-priority1` 브랜치에서 진행한다 (CLAUDE.md).

**Goal:** 2026-09-30 전체 점검에서 확인된 동작 버그 5건(StrictMode 이중 onChange, Combobox 키보드 선택, FocusScope StrictMode 포커스 탈취, RovingFocusGroup 이중 탭 스톱, 가로 Slider Up/Down)을 TDD로 수정한다.

**Architecture:** 각 버그는 독립 파일에 국한된다. 결함을 "정답"으로 고정한 기존 테스트(RovingFocusGroup tabindex 0, Slider ArrowUp 무효)는 먼저 올바른 기대값으로 바꿔 RED를 만든다. 동작 기준은 WAI-ARIA APG이며, Radix와 다를 때는 APG를 따른다(Radix도 APG를 따르는 항목이라 실제 충돌은 없음).

**Tech Stack:** React 19, TypeScript, vitest + @testing-library/react(jsdom), @floating-ui/react 0.27.19, pnpm + turbo

---

## 사전 준비

- [ ] **Step 0-1: 브랜치 생성** — Claude 자산 정리 커밋이 끝난 main 기준

```bash
git checkout main && git pull --ff-only
git checkout -b feature/fix-headless-priority1
```

- [ ] **Step 0-2: 기준선 확인** — 전부 GREEN이어야 시작한다

```bash
pnpm build && pnpm typecheck && pnpm test
```
Expected: build 10/10, typecheck 17/17, test 15/15 성공

> 주의: `@gugbab/headless`는 `@gugbab/hooks`를 **dist**로 소비한다. Task 1(hooks) 수정 후 headless 테스트 전에 `pnpm --filter @gugbab/hooks build`를 반드시 실행한다.

## 파일 구조

| 파일 | 변경 | 책임 |
|---|---|---|
| `packages/hooks/src/state/use-controllable-state.ts` | Modify | updater 순수화 |
| `packages/hooks/src/state/use-controllable-state.test.tsx` | Modify | StrictMode·연쇄 갱신 테스트 |
| `packages/headless/src/forms/Combobox/Combobox.tsx` | Modify | FloatingList/useListItem 전환, Enter 선택, 활성 항목 표시 |
| `packages/headless/src/forms/Combobox/Combobox.test.tsx` | Modify | 키보드·재오픈·필터 테스트 |
| `packages/headless/src/shared/FocusScope.tsx` | Modify | 언마운트 타이머 취소, 최초 포커스 대상 보존 |
| `packages/headless/src/shared/FocusScope.test.tsx` | Modify | StrictMode 테스트 |
| `packages/headless/src/shared/RovingFocusGroup.tsx` | Modify | 컨테이너 tabIndex -1 |
| `packages/headless/src/shared/RovingFocusGroup.test.tsx` | Modify | 결함 고정 테스트 교정 + 단일 탭 스톱 |
| `packages/headless/src/forms/Slider/Slider.tsx` | Modify | 가로 Up/Down |
| `packages/headless/src/forms/Slider/Slider.range.test.tsx` | Modify | 결함 고정 테스트 교정 |
| `.changeset/*.md` | Create | hooks·headless patch |

순서 근거: Task 1이 영향 범위가 가장 넓고(거의 모든 컴포넌트의 상태 기반) 다른 Task의 테스트에도 영향을 주므로 먼저 한다. 나머지는 서로 독립이다.

---

### Task 1: useControllableState — updater 부수효과 제거

**문제:** 비제어 모드에서 `setInternal(prev => { onChange(next); return next })`. React StrictMode(dev)는 updater를 두 번 실행하므로 `onChange`가 2회 호출된다. Tabs·Accordion·Dialog·Select·Switch 등 전 컴포넌트의 `onValueChange`/`onOpenChange`에 전파된다.

**설계:** 최신 내부 값을 `internalRef`로 추적하고 updater 밖에서 `next`를 계산한다. 같은 이벤트에서 연속 호출(`set(p=>p+1); set(p=>p+1)`)되어도 ref가 즉시 갱신되므로 체이닝이 유지된다. 기존 의미(값이 같아도 setter 호출 시 onChange 발화)는 바꾸지 않는다 — 공개 동작 변경 최소화.

**Files:**
- Modify: `packages/hooks/src/state/use-controllable-state.ts:20-49`
- Test: `packages/hooks/src/state/use-controllable-state.test.tsx`

- [ ] **Step 1: 실패 테스트 작성** — 파일 끝 `describe("useControllableState")` 안에 추가, import에 `StrictMode`, `createElement`, `type ReactNode` 추가

```tsx
import { createElement, type ReactNode, StrictMode } from "react";

const strict = ({ children }: { children: ReactNode }) => createElement(StrictMode, null, children);

describe("StrictMode / 연쇄 갱신 (경계)", () => {
    it("비제어 모드에서 StrictMode여도 onChange는 setter 1회당 정확히 1번", () => {
        const onChange = vi.fn();
        const { result } = renderHook(() => useControllableState<number>({ defaultValue: 0, onChange }), {
            wrapper: strict,
        });

        act(() => {
            result.current[1](1);
        });

        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenCalledWith(1);
        expect(result.current[0]).toBe(1);
    });

    it("StrictMode에서 함수형 갱신도 onChange 1번", () => {
        const onChange = vi.fn();
        const { result } = renderHook(() => useControllableState<number>({ defaultValue: 5, onChange }), {
            wrapper: strict,
        });

        act(() => {
            result.current[1]((p) => p * 2);
        });

        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenCalledWith(10);
        expect(result.current[0]).toBe(10);
    });

    it("같은 act 안의 연속 함수형 갱신은 이전 결과를 이어받는다", () => {
        const onChange = vi.fn();
        const { result } = renderHook(() => useControllableState<number>({ defaultValue: 0, onChange }));

        act(() => {
            result.current[1]((p) => p + 1);
            result.current[1]((p) => p + 1);
        });

        expect(result.current[0]).toBe(2);
        expect(onChange.mock.calls).toEqual([[1], [2]]);
    });

    it("제어 모드 StrictMode에서도 onChange 1번, 내부 상태는 변하지 않는다", () => {
        const onChange = vi.fn();
        const { result } = renderHook(() => useControllableState<number>({ value: 3, onChange }), {
            wrapper: strict,
        });

        act(() => {
            result.current[1]((p) => p + 1);
        });

        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenCalledWith(4);
        expect(result.current[0]).toBe(3);
    });

    it("onChange 없이 StrictMode에서 연속 갱신해도 오류 없이 누적된다 (누락 콜백 경계)", () => {
        const { result } = renderHook(() => useControllableState<number>({ defaultValue: 0 }), { wrapper: strict });

        act(() => {
            result.current[1]((p) => p + 1);
            result.current[1]((p) => p + 1);
            result.current[1]((p) => p + 1);
        });

        expect(result.current[0]).toBe(3);
    });
});
```

- [ ] **Step 2: 실패 확인**

Run: `pnpm --filter @gugbab/hooks exec vitest run src/state/use-controllable-state.test.tsx`
Expected: FAIL — StrictMode 테스트 2건에서 `toHaveBeenCalledTimes(1)`이 2로 실패. 마지막 테스트는 현재 구현에서 updater 안 throw로 상태가 갱신되지 않아 실패할 수 있다(그 경우도 RED로 인정).

- [ ] **Step 3: 구현**

```ts
import { type Dispatch, type SetStateAction, useCallback, useRef, useState } from "react";
import { useLatestRef } from "../ref/use-latest-ref";

// (UseControllableStateOptions·JSDoc은 그대로 유지)

export function useControllableState<T>(options: UseControllableStateOptions<T>): [T, Dispatch<SetStateAction<T>>] {
    const { value, defaultValue, onChange } = options;
    const isControlled = value !== undefined;

    const [internal, setInternal] = useState<T>(defaultValue as T);
    // 최신 내부 값 — updater 밖에서 next를 계산하기 위한 소스.
    // updater는 React가 StrictMode에서 두 번 실행하므로 부수효과(onChange)를 둘 수 없다.
    const internalRef = useRef<T>(internal);
    const current = (isControlled ? value : internal) as T;

    const ctxRef = useLatestRef({ isControlled, value, onChange });

    const setter = useCallback<Dispatch<SetStateAction<T>>>(
        (update) => {
            const ctx = ctxRef.current;
            const prev = ctx.isControlled ? (ctx.value as T) : internalRef.current;
            const next = typeof update === "function" ? (update as (p: T) => T)(prev) : update;

            if (!ctx.isControlled) {
                internalRef.current = next;
                setInternal(next);
            }
            ctx.onChange?.(next);
        },
        [ctxRef],
    );

    return [current, setter];
}
```

- [ ] **Step 4: 통과 확인**

Run: `pnpm --filter @gugbab/hooks exec vitest run src/state/use-controllable-state.test.tsx`
Expected: PASS (기존 + 신규 전부)

- [ ] **Step 5: 회귀 확인** — hooks 전체 + headless 전체(hooks dist 재빌드 후)

```bash
pnpm --filter @gugbab/hooks test
pnpm --filter @gugbab/hooks build
pnpm --filter @gugbab/headless test
```
Expected: 전부 PASS. headless에서 onValueChange 호출 횟수를 단언한 테스트가 깨지면 그 테스트의 기대값이 이중 호출에 맞춰져 있던 것이므로 원인 확인 후 보고.

- [ ] **Step 6: 커밋**

```bash
git add packages/hooks/src/state/use-controllable-state.ts packages/hooks/src/state/use-controllable-state.test.tsx
git commit -m "[pkg] Fix: useControllableState StrictMode에서 onChange 이중 호출"
```
> 커밋 카테고리: 패키지 코드는 레포 관례상 `[pkg]` (`git log -- packages/` 기준, commitlint-config 허용).

---

### Task 2: Combobox — 항목 목록 관리·키보드 선택

**문제:**
1. `Item` ref 콜백이 `listRef.current.push(node)`만 하고 제거하지 않는다. `Content`는 닫히면 `null`을 반환해 항목이 매번 unmount되므로 재오픈·필터링 시 분리된 노드가 누적되고 순서도 DOM 순서가 아니다.
2. Input에 Enter 처리가 없다 — ArrowDown으로 활성 항목을 옮겨도 키보드로 선택할 수 없다 (SC 2.1.1).
3. 활성 항목을 표시하는 속성이 없어 스타일 패키지가 하이라이트를 줄 수 없다.

**설계:** Select와 같은 `FloatingList` + `useListItem` 패턴으로 전환한다(등록·해제·DOM 순서 인덱스를 floating-ui가 관리). 각 Item은 `index === activeIndex`일 때 `data-highlighted`를 노출한다. Input의 `onKeyDown`에서 Enter 시 활성 항목 요소를 `.click()`해 기존 onClick 로직(disabled 가드 포함)을 재사용한다.

**Files:**
- Modify: `packages/headless/src/forms/Combobox/Combobox.tsx`
- Test: `packages/headless/src/forms/Combobox/Combobox.test.tsx`

- [ ] **Step 1: 실패 테스트 작성** — 기존 describe 아래에 추가

```tsx
function Fruits({
  onValueChange,
  items = ['apple', 'banana', 'cherry'],
}: {
  onValueChange?: (v: string) => void;
  items?: string[];
}) {
  return (
    <Combobox.Root onValueChange={onValueChange}>
      <Combobox.Anchor>
        <Combobox.Input aria-label="fruit" />
      </Combobox.Anchor>
      <Combobox.Portal>
        <Combobox.Content>
          {items.map((v) => (
            <Combobox.Item key={v} value={v}>
              {v}
            </Combobox.Item>
          ))}
        </Combobox.Content>
      </Combobox.Portal>
    </Combobox.Root>
  );
}

describe('Combobox — 키보드 선택', () => {
  it('ArrowDown 두 번 후 Enter로 두 번째 항목을 선택한다', () => {
    const onValueChange = vi.fn();
    render(<Fruits onValueChange={onValueChange} />);
    const input = screen.getByLabelText('fruit');

    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onValueChange).toHaveBeenCalledWith('banana');
    expect(screen.queryByRole('option')).toBeNull();
  });

  it('활성 항목에 data-highlighted가 붙고 input의 aria-activedescendant가 그 id를 가리킨다', () => {
    render(<Fruits />);
    const input = screen.getByLabelText('fruit');
    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: 'ArrowDown' });

    const highlighted = screen.getAllByRole('option').filter((o) => o.hasAttribute('data-highlighted'));
    expect(highlighted).toHaveLength(1);
    expect(highlighted[0]).toHaveTextContent('apple');
    expect(input.getAttribute('aria-activedescendant')).toBe(highlighted[0].id);
  });
});

describe('Combobox — 재오픈·필터 (경계)', () => {
  it('닫았다 다시 열어도 키보드 선택이 DOM 순서대로 동작한다', () => {
    const onValueChange = vi.fn();
    render(<Fruits onValueChange={onValueChange} />);
    const input = screen.getByLabelText('fruit');

    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(screen.queryByRole('option')).toBeNull();

    fireEvent.keyDown(input, { key: 'ArrowDown' }); // 재오픈
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });

    // 누적 버그가 있으면 분리된 노드를 가리켜 호출되지 않거나 엉뚱한 값이 된다
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange.mock.calls[0][0]).toMatch(/^(apple|banana|cherry)$/);
  });

  it('필터로 목록이 바뀌면 새 목록 기준으로 선택한다', () => {
    const onValueChange = vi.fn();
    const { rerender } = render(<Fruits onValueChange={onValueChange} />);
    const input = screen.getByLabelText('fruit');
    fireEvent.focus(input);

    rerender(<Fruits onValueChange={onValueChange} items={['cherry']} />);
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onValueChange).toHaveBeenCalledWith('cherry');
  });

  it('활성 항목이 없을 때 Enter는 아무것도 선택하지 않는다', () => {
    const onValueChange = vi.fn();
    render(<Fruits onValueChange={onValueChange} />);
    const input = screen.getByLabelText('fruit');
    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('disabled 항목은 Enter로도 선택되지 않는다 (오남용 방어)', () => {
    const onValueChange = vi.fn();
    render(
      <Combobox.Root onValueChange={onValueChange}>
        <Combobox.Anchor>
          <Combobox.Input aria-label="fruit" />
        </Combobox.Anchor>
        <Combobox.Portal>
          <Combobox.Content>
            <Combobox.Item value="apple" disabled>
              apple
            </Combobox.Item>
          </Combobox.Content>
        </Combobox.Portal>
      </Combobox.Root>,
    );
    const input = screen.getByLabelText('fruit');
    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onValueChange).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `pnpm --filter @gugbab/headless exec vitest run src/forms/Combobox`
Expected: FAIL — Enter 선택 테스트(`onValueChange` 미호출), `data-highlighted` 테스트(0개). 재오픈 테스트도 실패 예상.
> 만약 jsdom에서 floating-ui `useListNavigation`이 ArrowDown에 반응하지 않아 **기존 구현과 수정 구현 모두** activeIndex가 안 움직이면, Step 3 이후에도 실패한다. 그 경우 `fireEvent.keyDown` 대신 `@testing-library/user-event`(`await user.keyboard('{ArrowDown}')`) 사용 여부를 확인하고(`packages/headless/package.json` devDependencies), 없으면 사용자에게 보고 후 결정한다.

- [ ] **Step 3: 구현** — 변경 부분만

import 교체:
```tsx
import {
  FloatingFocusManager,
  FloatingList,
  FloatingPortal,
  type Placement,
  useClick,
  useDismiss,
  useInteractions,
  useListItem,
  useListNavigation,
  useRole,
} from '@floating-ui/react';
import { useControllableState } from '@gugbab/hooks';
import {
  type ButtonHTMLAttributes,
  createContext,
  forwardRef,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
  useContext,
  useRef,
  useState,
} from 'react';
```

`ComboboxRoot` return — children을 FloatingList로 감싼다(`listRef`는 그대로 `elementsRef`로 전달):
```tsx
      <FloatingList elementsRef={listRef}>{children}</FloatingList>
```

`Input`의 `getReferenceProps` 인자에 onKeyDown 추가(props 구조분해에 `onKeyDown` 추가):
```tsx
  function ComboboxInput({ onChange, onFocus, onKeyDown, value, ...rest }, ref) {
    // ...
          onKeyDown: (e: ReactKeyboardEvent<HTMLInputElement>) => {
            onKeyDown?.(e);
            if (e.defaultPrevented) return;
            if (e.key === 'Enter' && ctx.open && ctx.activeIndex !== null) {
              e.preventDefault();
              ctx.listRef.current[ctx.activeIndex]?.click();
            }
          },
```

`Item` — push 로직을 `useListItem`으로 교체:
```tsx
const Item = forwardRef<HTMLButtonElement, ComboboxItemProps>(function ComboboxItem(
  { value: itemValue, onClick, disabled, type = 'button', ...rest },
  ref,
) {
  const ctx = useCtx('Combobox.Item');
  const selected = ctx.value === itemValue;
  const { ref: listItemRef, index } = useListItem();
  const highlighted = ctx.activeIndex === index;

  return (
    <button
      ref={(node) => {
        listItemRef(node);
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      }}
      type={type}
      role="option"
      aria-selected={selected}
      data-highlighted={highlighted ? '' : undefined}
      disabled={disabled}
      {...ctx.getItemProps({
        ...rest,
        onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
          onClick?.(e);
          if (!e.defaultPrevented && !disabled) {
            ctx.setValue(itemValue);
            ctx.setOpen(false);
          }
        },
      })}
    />
  );
});
```

- [ ] **Step 4: 통과 확인**

Run: `pnpm --filter @gugbab/headless exec vitest run src/forms/Combobox`
Expected: PASS (기존 1건 + 신규 6건)

- [ ] **Step 5: 회귀 + 스타일 패키지 확인**

```bash
pnpm --filter @gugbab/headless test
pnpm --filter @gugbab/headless build
pnpm --filter @gugbab/styled-mui test && pnpm --filter @gugbab/styled-radix test
```
Expected: 전부 PASS. (`data-highlighted` 스타일링은 4순위 스타일 작업에서 다룬다 — 이번엔 속성 노출까지만)

- [ ] **Step 6: 커밋**

```bash
git add packages/headless/src/forms/Combobox/
git commit -m "[pkg] Fix: Combobox 항목 목록 누적·Enter 키보드 선택 누락"
```

---

### Task 3: FocusScope — StrictMode 재마운트 시 포커스 탈취

> **실행 결과 (2026-09-30): 오탐으로 판명, 수정 없음.** Step 2에서 수정 전 코드로 3건 모두 PASS(RED 재현 실패).
> 원인: `container`가 ref 콜백 → state로 들어오므로, StrictMode가 effect를 이중 실행하는 최초 마운트 시점에는
> `container === null`이라 effect가 즉시 return하고 cleanup이 없다. container 확정 후 effect는 한 번만 실행된다.
> 추가했던 테스트는 되돌렸다. 아래 단계는 기록용으로 남긴다.

**문제:** 언마운트 cleanup이 `setTimeout(0)`으로 포커스 복원 + 스택 제거를 예약하고 취소하지 않는다. StrictMode의 가상 unmount→remount 후 이 타이머가 실행되어 ① 아직 마운트된 scope를 스택에서 제거하고 ② 포커스를 트리거로 되돌린다. 또 remount 시점의 `previouslyFocused`는 scope 내부 요소라, 실제 언마운트 때 복원 대상이 틀어진다.

**설계:** 예약 타이머 id와 "최초 포커스 대상"을 ref에 보관한다. effect 재실행 시 대기 중인 타이머가 있으면 remount로 보고 취소하며, 자동 포커스와 포커스 대상 기록은 최초 마운트에서만 한다. 타이머 안의 동작(복원·스택 제거 순서)은 그대로 둔다 — Radix와 동일한 "React 언마운트 중 포커스 경합 회피" 목적 유지.

**Files:**
- Modify: `packages/headless/src/shared/FocusScope.tsx:115-153`
- Test: `packages/headless/src/shared/FocusScope.test.tsx`

- [ ] **Step 1: 실패 테스트 작성** — import에 `StrictMode` 추가(`import { StrictMode, useState } from 'react';`), 파일 끝에 추가

```tsx
describe('FocusScope — StrictMode (경계)', () => {
  function Tree({ open }: { open: boolean }) {
    return (
      <StrictMode>
        <button type="button" data-testid="trigger">
          trigger
        </button>
        {open && (
          <FocusScope trapped>
            <button type="button" data-testid="inside">
              inside
            </button>
          </FocusScope>
        )}
      </StrictMode>
    );
  }

  it('StrictMode 재마운트 후에도 포커스가 scope 안에 머문다', () => {
    const { rerender } = render(<Tree open={false} />);
    const trigger = screen.getByTestId('trigger');
    act(() => trigger.focus());

    rerender(<Tree open={true} />);
    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(document.activeElement).toBe(screen.getByTestId('inside'));
  });

  it('StrictMode에서 실제 언마운트 시 최초 포커스 대상(trigger)으로 복원한다', () => {
    const { rerender } = render(<Tree open={false} />);
    const trigger = screen.getByTestId('trigger');
    act(() => trigger.focus());

    rerender(<Tree open={true} />);
    act(() => {
      vi.advanceTimersByTime(1);
    });
    rerender(<Tree open={false} />);
    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(document.activeElement).toBe(trigger);
  });

  it('StrictMode 재마운트가 onUnmountAutoFocus를 발화시키지 않는다', () => {
    const onUnmountAutoFocus = vi.fn();
    const { rerender } = render(
      <StrictMode>
        <FocusScope onUnmountAutoFocus={onUnmountAutoFocus}>
          <button type="button">x</button>
        </FocusScope>
      </StrictMode>,
    );
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(onUnmountAutoFocus).not.toHaveBeenCalled();

    rerender(<StrictMode>{null}</StrictMode>);
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(onUnmountAutoFocus).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `pnpm --filter @gugbab/headless exec vitest run src/shared/FocusScope.test.tsx`
Expected: FAIL — 첫 테스트는 activeElement가 trigger, 세 번째는 onUnmountAutoFocus가 재마운트 때 1회 호출됨.

- [ ] **Step 3: 구현** — `lastFocusedRef` 선언 아래에 ref 2개 추가, 마운트 effect 교체

```tsx
    // StrictMode의 가상 unmount→remount 사이에 예약된 복원 타이머를 취소하기 위한 id,
    // 그리고 최초 마운트 시점의 포커스 대상(remount 시점 값은 scope 내부라 쓸 수 없다).
    const restoreTimerRef = useRef<number | null>(null);
    const previouslyFocusedRef = useRef<HTMLElement | null>(null);
```

```tsx
    // Auto-focus on mount + restore on unmount.
    useEffect(() => {
      if (!container) return;

      const isRemount = restoreTimerRef.current !== null;
      if (restoreTimerRef.current !== null) {
        window.clearTimeout(restoreTimerRef.current);
        restoreTimerRef.current = null;
      }

      focusScopesStack.add(focusScope);

      if (!isRemount) {
        const previouslyFocused = document.activeElement as HTMLElement | null;
        previouslyFocusedRef.current = previouslyFocused;
        const hasFocusInside = container.contains(previouslyFocused);

        if (!hasFocusInside) {
          const mountEvent = new CustomEvent(AUTOFOCUS_ON_MOUNT, EVENT_OPTIONS);
          const handler = (event: Event) => onMountAutoFocusRef.current?.(event);
          container.addEventListener(AUTOFOCUS_ON_MOUNT, handler);
          container.dispatchEvent(mountEvent);
          container.removeEventListener(AUTOFOCUS_ON_MOUNT, handler);
          if (!mountEvent.defaultPrevented) {
            const candidates = removeLinks(getTabbableCandidates(container));
            focusFirst(candidates, { select: true });
            if (document.activeElement === previouslyFocused) {
              focusElement(container);
            }
          }
        }
      }

      return () => {
        // Defer unmount focus restore — React mid-unmount focus sometimes fights
        // the browser. setTimeout(0) avoids the race. A remount (StrictMode)
        // cancels this timer in the effect above.
        const node = container;
        restoreTimerRef.current = window.setTimeout(() => {
          restoreTimerRef.current = null;
          const unmountEvent = new CustomEvent(AUTOFOCUS_ON_UNMOUNT, EVENT_OPTIONS);
          const handler = (event: Event) => onUnmountAutoFocusRef.current?.(event);
          node.addEventListener(AUTOFOCUS_ON_UNMOUNT, handler);
          node.dispatchEvent(unmountEvent);
          node.removeEventListener(AUTOFOCUS_ON_UNMOUNT, handler);
          if (!unmountEvent.defaultPrevented) {
            focusElement(previouslyFocusedRef.current ?? document.body, { select: true });
          }
          focusScopesStack.remove(focusScope);
        }, 0);
      };
    }, [container, focusScope, onMountAutoFocusRef, onUnmountAutoFocusRef]);
```

> 설계 메모: 컴포넌트가 실제로 언마운트되면 effect가 다시 돌지 않으므로 타이머는 그대로 실행된다. `container`만 바뀌는 경우(같은 인스턴스)는 remount로 간주되어 복원을 건너뛴다 — scope가 여전히 살아 있으므로 올바른 동작이다.

- [ ] **Step 4: 통과 확인**

Run: `pnpm --filter @gugbab/headless exec vitest run src/shared/FocusScope.test.tsx`
Expected: PASS (기존 전부 + 신규 3건)

- [ ] **Step 5: 회귀 확인** — FocusScope 소비자(Dialog·Popover·DropdownMenu 등)

Run: `pnpm --filter @gugbab/headless test`
Expected: 전부 PASS

- [ ] **Step 6: 커밋**

```bash
git add packages/headless/src/shared/FocusScope.tsx packages/headless/src/shared/FocusScope.test.tsx
git commit -m "[pkg] Fix: FocusScope StrictMode 재마운트 시 포커스 탈취·스택 오제거"
```

---

### Task 4: RovingFocusGroup — 컨테이너 이중 탭 스톱

**문제:** 컨테이너가 `tabIndex={0}`이고 컨테이너 포커스를 항목으로 넘기는 처리가 없다. Tabs(tablist)·RadioGroup·Toolbar·Accordion에서 Tab이 컨테이너에 한 번, 활성 항목에 한 번 멈춘다. 컨테이너에서 화살표는 동작하지 않는다(`item`의 onKeyDown이 `event.target !== currentTarget`이면 return). 기존 테스트 2건이 이 값을 정답으로 고정하고 있다.

**설계:** APG의 roving tabindex 패턴대로 컨테이너는 탭 순서에서 빠진다: `tabIndex={-1}`. 소비자가 `tabIndex`를 넘기면 `{...rest}`가 뒤에 있어 덮어쓸 수 있는 현재 구조는 유지한다.

**Files:**
- Modify: `packages/headless/src/shared/RovingFocusGroup.tsx:123`
- Test: `packages/headless/src/shared/RovingFocusGroup.test.tsx:39-65`

- [ ] **Step 1: 결함 고정 테스트 교정 + 신규 테스트** — 39-51행 테스트 교체

```tsx
  it('컨테이너는 탭 순서에 들어가지 않는다 (tabindex -1)', () => {
    render(
      <RovingFocusGroup>
        <RovingFocusGroupItem>
          <button type="button" data-testid="a">
            a
          </button>
        </RovingFocusGroupItem>
      </RovingFocusGroup>,
    );
    const container = screen.getByTestId('a').closest('[data-roving-group="true"]');
    expect(container?.getAttribute('tabindex')).toBe('-1');
  });
```

53-65행 asChild 테스트의 마지막 단언 교체:
```tsx
    expect(screen.getByTestId('group').getAttribute('tabindex')).toBe('-1');
```

파일 끝에 추가:
```tsx
describe('RovingFocusGroup — 탭 스톱 (경계)', () => {
  it('그룹 전체에서 tabindex=0인 요소는 정확히 하나다', () => {
    render(
      <RovingFocusGroup>
        {['a', 'b', 'c'].map((id) => (
          <RovingFocusGroupItem key={id}>
            <button type="button" data-testid={id}>
              {id}
            </button>
          </RovingFocusGroupItem>
        ))}
      </RovingFocusGroup>,
    );
    const group = screen.getByTestId('a').closest('[data-roving-group="true"]') as HTMLElement;
    const tabbables = [group, ...Array.from(group.querySelectorAll('[tabindex]'))].filter(
      (el) => el.getAttribute('tabindex') === '0',
    );
    expect(tabbables).toHaveLength(1);
    expect(tabbables[0]).toBe(screen.getByTestId('a'));
  });

  it('항목이 없으면 탭 가능한 요소가 없다', () => {
    render(<RovingFocusGroup data-testid="empty" />);
    expect(screen.getByTestId('empty').getAttribute('tabindex')).toBe('-1');
  });

  it('소비자가 tabIndex를 명시하면 그 값을 존중한다', () => {
    render(<RovingFocusGroup data-testid="g" tabIndex={0} />);
    expect(screen.getByTestId('g').getAttribute('tabindex')).toBe('0');
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `pnpm --filter @gugbab/headless exec vitest run src/shared/RovingFocusGroup.test.tsx`
Expected: FAIL — 교정한 2건과 "정확히 하나"(2개), "항목 없음"(0) 실패. 마지막 테스트는 현재도 통과(회귀 방지용).

- [ ] **Step 3: 구현** — `RovingFocusGroup.tsx:123`

```tsx
        <Comp
          tabIndex={-1}
          data-orientation={orientation}
          data-roving-group="true"
          {...rest}
          ref={forwardedRef}
        >
```

- [ ] **Step 4: 통과 확인**

Run: `pnpm --filter @gugbab/headless exec vitest run src/shared/RovingFocusGroup.test.tsx`
Expected: PASS

- [ ] **Step 5: 회귀 확인** — Tabs·RadioGroup·Accordion·Toolbar·ToggleGroup 및 styled 스냅샷 없음 확인

```bash
pnpm --filter @gugbab/headless test
pnpm --filter @gugbab/headless build
pnpm --filter @gugbab/styled-mui test && pnpm --filter @gugbab/styled-radix test
```
Expected: 전부 PASS. 컨테이너 tabindex를 단언하는 다른 테스트가 깨지면 같은 방식으로 `-1`로 교정한다(결함 고정 테스트).
> 시각 회귀(`pnpm vr`)는 CI 전용 baseline이라 로컬에서 돌리지 않는다. 컨테이너 포커스 링이 사라지는 변화는 스크린샷에 영향이 없다(포커스 상태 캡처 없음).

- [ ] **Step 6: 커밋**

```bash
git add packages/headless/src/shared/RovingFocusGroup.tsx packages/headless/src/shared/RovingFocusGroup.test.tsx
git commit -m "[pkg] Fix: RovingFocusGroup 컨테이너 이중 탭 스톱 제거"
```

---

### Task 5: Slider — 가로형 ArrowUp/ArrowDown

**문제:** 가로 슬라이더에서 ArrowUp/Down을 무시한다. APG Slider는 방향과 무관하게 Up=증가, Down=감소이며 VoiceOver 조작이 이에 의존한다. 기존 테스트가 "무효"를 정답으로 고정하고 있다.

**설계:** 가로형에서 Up은 항상 +step, Down은 항상 −step(RTL·inverted와 무관 — Radix도 동일). 세로형은 기존 `incrementKey/decrementKey` 분기가 먼저 매칭되므로 변경 없음.

**Files:**
- Modify: `packages/headless/src/forms/Slider/Slider.tsx:505-516`
- Test: `packages/headless/src/forms/Slider/Slider.range.test.tsx:145-150`

- [ ] **Step 1: 결함 고정 테스트 교정 + 신규 테스트** — 145-150행 교체

```tsx
  it('가로 슬라이더에서 ArrowUp은 증가, ArrowDown은 감소 (APG)', () => {
    const thumb = setup([50]);
    fireEvent.keyDown(thumb, { key: 'ArrowUp' });
    expect(Number(thumb.getAttribute('aria-valuenow'))).toBe(51);
    fireEvent.keyDown(thumb, { key: 'ArrowDown' });
    fireEvent.keyDown(thumb, { key: 'ArrowDown' });
    expect(Number(thumb.getAttribute('aria-valuenow'))).toBe(49);
  });

  it('가로 ArrowUp도 max에서 clamp된다 (경계)', () => {
    const thumb = setup([100]);
    fireEvent.keyDown(thumb, { key: 'ArrowUp' });
    expect(Number(thumb.getAttribute('aria-valuenow'))).toBe(100);
  });
```

`describe('Slider — inverted')` 블록 끝에 추가:
```tsx
  it('가로 inverted여도 ArrowUp은 증가한다 (APG: Up=증가)', () => {
    render(
      <Slider.Root defaultValue={[50]} inverted>
        <Slider.Track>
          <Slider.Range />
        </Slider.Track>
        <Slider.Thumb aria-label="value" />
      </Slider.Root>,
    );
    const thumb = screen.getByRole('slider');
    thumb.focus();
    fireEvent.keyDown(thumb, { key: 'ArrowUp' });
    expect(Number(thumb.getAttribute('aria-valuenow'))).toBe(51);
  });

  it('disabled면 ArrowUp이 무시된다 (오남용 방어)', () => {
    render(
      <Slider.Root defaultValue={[50]} disabled>
        <Slider.Track>
          <Slider.Range />
        </Slider.Track>
        <Slider.Thumb aria-label="value" />
      </Slider.Root>,
    );
    const thumb = screen.getByRole('slider');
    fireEvent.keyDown(thumb, { key: 'ArrowUp' });
    expect(Number(thumb.getAttribute('aria-valuenow'))).toBe(50);
  });
```

- [ ] **Step 2: 실패 확인**

Run: `pnpm --filter @gugbab/headless exec vitest run src/forms/Slider`
Expected: FAIL — ArrowUp/Down 테스트(50 유지), inverted ArrowUp 테스트 실패. clamp·disabled는 현재도 통과(회귀 방지용).

- [ ] **Step 3: 구현** — 505-516행 교체

```tsx
      case 'ArrowUp':
        // 가로형: APG에 따라 방향과 무관하게 증가. 세로형은 위 incrementKey/decrementKey가 먼저 매칭된다.
        e.preventDefault();
        svc(index, horizontal || !inverted ? value + ctx.step : value - ctx.step);
        break;
      case 'ArrowDown':
        e.preventDefault();
        svc(index, horizontal || !inverted ? value - ctx.step : value + ctx.step);
        break;
```

- [ ] **Step 4: 통과 확인**

Run: `pnpm --filter @gugbab/headless exec vitest run src/forms/Slider`
Expected: PASS (RTL·inverted 기존 테스트 포함)

- [ ] **Step 5: 커밋**

```bash
git add packages/headless/src/forms/Slider/Slider.tsx packages/headless/src/forms/Slider/Slider.range.test.tsx
git commit -m "[pkg] Fix: 가로 Slider ArrowUp/ArrowDown 무시 (APG)"
```

---

### Task 6: Changeset + 전체 검증

- [ ] **Step 1: changeset 작성** — `.changeset/headless-priority1-fixes.md`

```md
---
"@gugbab/hooks": patch
"@gugbab/headless": minor
---

동작 버그 수정: useControllableState가 StrictMode에서 onChange를 두 번 호출하던 문제, Combobox 재오픈 시 항목 목록 누적과 Enter 키 선택 누락(활성 항목 `data-highlighted` 노출), FocusScope가 StrictMode 재마운트 후 포커스를 빼앗던 문제, RovingFocusGroup 컨테이너의 이중 탭 스톱, 가로 Slider의 ArrowUp/ArrowDown 무시.
```

- [ ] **Step 2: 전체 검증** (푸시 전 필수 — memory: frozen-lockfile)

```bash
pnpm install --frozen-lockfile
pnpm build && pnpm typecheck && pnpm test && pnpm exec biome ci .
```
Expected: 전부 성공, 테스트 수는 기준선 1,151 + 신규 약 20

- [ ] **Step 3: Codex 적대적 리뷰** — `.claude/rules/codex-review.md` (현재 `gpt-5.4` 설정 문제로 사용 불가 마커 상태면 그 사실을 보고)

- [ ] **Step 4: 커밋**

```bash
git add .changeset/headless-priority1-fixes.md
git commit -m "[pkg] Add: headless 1순위 버그 수정 changeset"
```

- [ ] **Step 5: 사용자 보고** — 푸시·PR은 사용자 요청 시에만 (PR 생성은 사용자 직접)

---

## 범위 밖 (이번 계획에서 다루지 않음)

- RadioGroup RTL 방향 불일치, Popover/DropdownMenu 바깥 클릭 포커스, Dialog 트리거 복귀, DropdownMenu RTL 서브메뉴 — 접근성 Major, 별도 계획
- `data-highlighted` 스타일링, 포커스 링·대비 — 4순위 스타일 계획
- 세로 Slider의 ArrowLeft/Right(Radix는 지원, APG는 선택 사항) — 요청 시 추가

## 실행 후 반영 (2026-09-30, 독립 코드 리뷰)

- Combobox: IME 조합 중 Enter(`isComposing`/keyCode 229) 무시, 활성 항목이 필터로 사라지면 Enter를 가로채지 않음(폼 제출 유지), `useListItem` 초기 `index === null` 가드, 재오픈 테스트를 정확한 값(`banana`)으로 강화
- Slider: 도달 불가 분기 단순화, 가로 RTL·세로 inverted 회귀 테스트 추가
- changeset: headless는 기능 추가(Enter 선택·`data-highlighted`)가 있어 `minor`, hooks는 `patch`

