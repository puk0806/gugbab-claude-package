# @gugbab-ui/styled-radix

`@gugbab-ui/headless`(헤드리스 동작) 위에 **Radix Themes lookalike** 스타일을 입힌 React 컴포넌트 35종. CSS 클래스명은 모두 `grx-*` prefix.

- 35 컴포넌트 — `@gugbab-ui/headless` 35종과 1:1 대응
- 디자인 토큰: `@gugbab-ui/tokens` (Radix 스냅샷)
- React 18 / 19 지원, dual ESM / CJS, RSC 호환 (`"use client"` banner)

## 설치

```sh
pnpm add @gugbab-ui/styled-radix @gugbab-ui/headless @gugbab-ui/tokens @floating-ui/react
```

## 사용

엔트리에서 토큰 CSS + 컴포넌트 CSS를 한 번씩 import.

```tsx
// app entry
import '@gugbab-ui/tokens/radix.css';
import '@gugbab-ui/styled-radix/styles.css';
```

```tsx
import { Button, Dialog } from '@gugbab-ui/styled-radix';

export function Example() {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Button variant="solid" size="2">Open</Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay />
        <Dialog.Content>
          <Dialog.Title>Hello</Dialog.Title>
          <Dialog.Description>This is a Radix Themes lookalike dialog.</Dialog.Description>
          <Dialog.Close asChild>
            <Button variant="soft">Close</Button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
```

## 컴포넌트 (35종)

### Tier 1 — 원시 프리미티브 (7)
Portal · VisuallyHidden · Slot · Label · Separator · AspectRatio · Avatar

### Tier 2 — 상태 프리미티브 (9)
Collapsible · Accordion · Tabs · Toggle · ToggleGroup · Switch · Checkbox · RadioGroup · Progress

### Tier 3 — 오버레이 (8)
Dialog · AlertDialog · Popover · HoverCard · Tooltip · DropdownMenu · ContextMenu · Menubar

### Tier 4 — 복합 폼 (6)
Select · Combobox · Slider · Toast · Form · OneTimePasswordField

### Tier 5 — 내비게이션 (4)
Pagination · Breadcrumbs · NavigationMenu · Toolbar

### 그 외 (1)
ScrollArea

## 스타일 커스터마이즈

CSS 변수 오버라이드로 테마를 조정합니다.

```css
:root {
  --gugbab-color-accent-base: var(--indigo-9);
  --gugbab-radius-md: 8px;
}
```

컴포넌트 CSS는 모두 `:where()` 셀렉터로 작성되어 specificity 0 — 사용자 클래스가 자동으로 우선합니다.

## 라이선스

MIT
