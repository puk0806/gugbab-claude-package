---
name: Headless React package roadmap
description: @gugbab/headless 5-tier 35 컴포넌트의 설계 의도·구조·다음 단계. 디테일은 코드와 git log로 확인.
type: project
originSessionId: d38b63bc-10e0-4db4-8ff1-14cf943313c2
---
`packages/headless` = `@gugbab/*` 헤드리스 핵심 산출물. Radix UI primitives 동등 + 우리 Pagination/Breadcrumbs 추가. 스타일·토큰은 별도 패키지.

**Why:** 사용자가 2026-04-24 "MUI/Radix에 있는 기본 컴포넌트 전부 헤드리스로". 2026-04-27 "Radix 포크를 떠서 모든 기능을 동일하게". 핵심 의도는 *외부 라이브러리에 휘둘리지 않는 자기완결 헤드리스 시스템*.

**How to apply:** 컴포넌트 추가/수정 시 5-tier 분류와 설계 결정(아래)을 따른다. Phase 진행 디테일은 git log + 코드 구조 참조 — 메모리에 두지 않음.

---

## 설계 결정 (고정)

| 항목 | 선택 | 근거 |
|---|---|---|
| API | Compound + `asChild` (Radix 방식) | `<Dialog.Root><Dialog.Trigger/><Dialog.Content/></Dialog.Root>` |
| 포지셔닝 | `@floating-ui/react` | Radix·Ark·React Aria 표준 |
| 상태 | `useControllableState` (`@gugbab/hooks`) | 자체 패키지 |
| 스타일 훅 | `data-state`, `data-disabled`, `data-orientation` | Radix 방식 |
| 빌드 | tsup dual ESM/CJS, `"use client"` banner | Next.js RSC 대응 |

## 35 컴포넌트 (5-tier)

| Tier | 갯수 | 컴포넌트 |
|---|---|---|
| 1 — 원시 프리미티브 | 7 | Portal, VisuallyHidden, Slot(+Slottable), Label, Separator, AspectRatio, Avatar |
| 2 — 상태 프리미티브 | 9 | Collapsible, Accordion, Tabs, Toggle, ToggleGroup, Switch, Checkbox, RadioGroup, Progress |
| 3 — 오버레이 | 8 | Dialog, AlertDialog, Popover, HoverCard, Tooltip, DropdownMenu(+Sub), ContextMenu(+Sub), Menubar(+Sub) |
| 4 — 복합 폼 | 6 | Select, Combobox, Slider, Toast, Form, OneTimePasswordField |
| 5 — 내비게이션 | 4 | Pagination, Breadcrumbs, NavigationMenu, Toolbar |

Shared utility 9종(DirectionProvider/usePresence/BubbleInput/ScrollArea + DismissableLayer/FocusScope/RovingFocusGroup/Collection/Presence v2)은 Tier에 포함하지 않음.

## 다음 후보 (정해진 것 아님)

- Phase 7: Radix Themes / shadcn 적응성 검증 (`@gugbab/styled-*` 외 스타일 시스템 추가 가능성)
- 컴포넌트 확장 (DataTable, Calendar 등 35 외)

> v1.0.0 publish는 2026-05-09에 9개 패키지 동시 완료 — `project_npm_v1_publishing.md` 참조.
