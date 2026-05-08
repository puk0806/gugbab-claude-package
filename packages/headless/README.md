# @gugbab/headless

Headless, accessible React components for `@gugbab/*` — behavior only, bring your own styles.

- Compound component API with `asChild` prop (Radix style)
- Full keyboard navigation + ARIA compliance
- Controlled & uncontrolled modes via `useControllableState`
- `data-state` / `data-disabled` / `data-orientation` attributes for CSS styling
- `@floating-ui/react` for anchored overlays
- React 18 / 19 support, dual ESM / CJS, `"use client"` banner for RSC

## 설치

```sh
pnpm add @gugbab/headless @floating-ui/react
```

스타일이 입혀진 형태가 필요하다면 `@gugbab/styled-mui` 또는 `@gugbab/styled-radix`를 함께 설치합니다.

## 범위 (35 컴포넌트)

### Tier 1 — 원시 프리미티브 (7)
Portal · VisuallyHidden · Slot · Label · Separator · AspectRatio · Avatar

### Tier 2 — 상태 프리미티브 (9)
Collapsible · Accordion · Tabs · Toggle · ToggleGroup · Switch · Checkbox · RadioGroup · Progress

### Tier 3 — 오버레이 (8) — Floating UI
Dialog · AlertDialog · Popover · HoverCard · Tooltip · DropdownMenu · ContextMenu · Menubar

### Tier 4 — 복합 폼 (6)
Select · Combobox · Slider · Toast · Form · OneTimePasswordField

### Tier 5 — 내비게이션 (4)
Pagination · Breadcrumbs · NavigationMenu · Toolbar

### 그 외 (1)
ScrollArea

## 사용 예

```tsx
import { Dialog } from '@gugbab/headless';

function Example() {
  return (
    <Dialog.Root>
      <Dialog.Trigger>Open</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed inset-0 m-auto w-96 bg-white p-6">
          <Dialog.Title>Hello</Dialog.Title>
          <Dialog.Description>world</Dialog.Description>
          <Dialog.Close>Close</Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
```

## `asChild` 패턴

모든 leaf 컴포넌트는 `asChild`로 자식 엘리먼트에 props를 위임할 수 있습니다.

```tsx
<Dialog.Trigger asChild>
  <button className="my-button">Open</button>
</Dialog.Trigger>
```

## 라이선스

MIT
