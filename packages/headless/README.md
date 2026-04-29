# @gugbab-ui/headless

Headless, accessible React components for `@gugbab-ui/*` — behavior only, bring your own styles.

- Compound component API with `asChild` prop (Radix style)
- Full keyboard navigation + ARIA compliance
- Controlled & uncontrolled modes via `useControllableState`
- `data-state` / `data-disabled` attributes for CSS styling
- `@floating-ui/react` for anchored overlays
- React 18 / 19 support, dual ESM / CJS, `"use client"` banner for RSC

## 범위 (30개 컴포넌트)

### Tier 1 — 원시 프리미티브 (7)
Portal · VisuallyHidden · Slot · Label · Separator · AspectRatio · Avatar

### Tier 2 — 상태 프리미티브 (9)
Collapsible · Accordion · Tabs · Toggle · ToggleGroup · Switch · Checkbox · RadioGroup · Progress

### Tier 3 — 오버레이 (8) — Floating UI
Dialog · AlertDialog · Popover · HoverCard · Tooltip · DropdownMenu · ContextMenu · Menubar

### Tier 4 — 복합 폼 (4)
Select · Combobox · Slider · Toast

### Tier 5 — 내비게이션 (3)
Pagination · Breadcrumbs · NavigationMenu

## 설치

```sh
pnpm add @gugbab-ui/headless @floating-ui/react
```

## 사용 예

```tsx
import { Dialog } from '@gugbab-ui/headless';

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
