# @gugbab/tokens

`@gugbab/*`에서 쓰이는 디자인 토큰 모음. **외부 디자인 라이브러리 의존성 0** — MUI / Radix Themes 형태의 토큰을 정적 객체로 박제해 제공합니다.

- 추상 `ThemeTokens` 타입 + 두 가지 정적 스냅샷 (MUI, Radix)
- light / dark 변종 동시 제공
- 빌드 산출물: `dist/{mui,radix}.css` — `:root` / `[data-theme="dark"]` 셀렉터 + `var(--gugbab-*)` 변수
- ESM + CJS 듀얼 빌드, 타입 정의 포함

## 설치

```sh
pnpm add @gugbab/tokens
```

## 사용 — CSS 변수 import

번들러 입구(앱 진입점)에서 한 번만 import 하면 `<html>` 전역에 변수가 주입됩니다.

```ts
// 앱 entrypoint (예: main.tsx, _app.tsx)
import '@gugbab/tokens/mui.css';   // 또는
import '@gugbab/tokens/radix.css';
```

dark 모드는 `<html data-theme="dark">`로 토글합니다.

```css
/* 컴포넌트 CSS에서는 변수만 참조 */
.my-button {
  background: var(--gugbab-color-accent-base);
  color: var(--gugbab-color-accent-fg);
  padding: var(--gugbab-space-3) var(--gugbab-space-4);
  border-radius: var(--gugbab-radius-md);
}
```

## 사용 — TypeScript 객체 import

`ThemeTokens` 타입과 정적 스냅샷이 필요하면 직접 import.

```ts
import { muiTokensLight, muiTokensDark, radixTokensLight, type ThemeTokens } from '@gugbab/tokens';

const accent = muiTokensLight.color.accent.base;
```

## 토큰 카테고리

| 카테고리 | 키 | 예시 |
| --- | --- | --- |
| `color.bg` | app, surface, elevated, inset | `--gugbab-color-bg-app` |
| `color.fg` | primary, secondary, muted, disabled, onAccent | `--gugbab-color-fg-primary` |
| `color.accent` | base, hover, active, subtle, fg | `--gugbab-color-accent-base` |
| `color.{success,warning,danger,info}` | base, fg, subtle | `--gugbab-color-success-base` |
| `color.border` | subtle, base, strong, focus | `--gugbab-color-border-base` |
| `space` | 0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24 | `--gugbab-space-3` |
| `radius` | none, sm, md, lg, xl, full | `--gugbab-radius-md` |
| `font.size` | xs, sm, md, lg, xl, 2xl, 3xl, 4xl | `--gugbab-font-size-md` |
| `font.weight` | normal, medium, semibold, bold | `--gugbab-font-weight-semibold` |
| `font.family` | sans, mono | `--gugbab-font-family-sans` |
| `lineHeight` | tight, normal, relaxed | `--gugbab-line-height-normal` |
| `shadow` | sm, md, lg, xl | `--gugbab-shadow-md` |
| `z` | dropdown, overlay, modal, popover, tooltip, toast | `--gugbab-z-modal` |
| `breakpoint` | sm, md, lg, xl, 2xl | `--gugbab-breakpoint-md` |
| `duration` / `easing` | fast/normal/slow / default/in/out/inOut | `--gugbab-duration-normal` |

전체 키 목록은 [src/types.ts](./src/types.ts) 참조.

## 정적화 정책

토큰은 외부 라이브러리(`@mui/material`, `@radix-ui/colors`)를 빌드 타임에서도 참조하지 않습니다. 외부 디자인 변경에 자동 추적되지 않으며 의도적 갱신 시점에만 변경됩니다.

## 라이선스

MIT
