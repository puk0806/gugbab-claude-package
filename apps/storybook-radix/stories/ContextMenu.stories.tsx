import { ContextMenu } from '@gugbab/styled-radix';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type React from 'react';

const meta = {
  title: 'Menus/ContextMenu',
  component: ContextMenu.Root,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
**ContextMenu** — 우클릭(또는 길게 누르기)으로 열리는 컨텍스트 메뉴 컴포넌트. Radix UI 기반의 headless 구조 위에 MUI 토큰이 적용된 스타일드 버전이다.

### 컴파운드 구조

| 키                           | 역할                                                               |
| ---------------------------- | ------------------------------------------------------------------ |
| \`ContextMenu.Root\`         | 메뉴 전체 상태를 관리하는 컨텍스트 제공자                          |
| \`ContextMenu.Trigger\`      | 우클릭 이벤트를 감지하는 영역. 반드시 \`<div>\` 계열 요소 사용    |
| \`ContextMenu.Portal\`       | 메뉴를 \`document.body\`에 포탈로 렌더링                           |
| \`ContextMenu.Content\`      | 메뉴 패널. 우클릭 위치 기준으로 배치됨                             |
| \`ContextMenu.Item\`         | 기본 메뉴 항목. \`disabled\` prop 지원                             |
| \`ContextMenu.Sub\`          | 서브메뉴 컨텍스트 제공자                                           |
| \`ContextMenu.SubTrigger\`   | 서브메뉴를 여는 트리거 항목 (오른쪽 화살표로 진입)                 |
| \`ContextMenu.SubContent\`   | 서브메뉴 패널                                                      |

### 접근성 · 키보드

- 우클릭 / \`Shift+F10\`: 메뉴 열기
- \`ArrowDown\` / \`ArrowUp\`: 항목 이동
- \`Enter\` / \`Space\`: 항목 선택
- \`Escape\`: 메뉴 닫기
- \`ArrowRight\`: 서브메뉴 진입, \`ArrowLeft\`: 서브메뉴 닫기
- Typeahead: 문자 입력 시 해당 문자로 시작하는 항목으로 포커스 이동
- \`ContextMenu.Trigger\`에는 \`asChild\` prop이 없으므로 자체 래퍼 \`<div>\`를 사용한다

### 주요 prop

- \`ContextMenu.Trigger\` — HTML \`div\` 요소를 직접 렌더링. \`style\` / \`className\`으로 영역 가시화 권장
- \`ContextMenu.Content\` — \`alignOffset\` / \`avoidCollisions\`: 뷰포트 가장자리 충돌 방지
- \`ContextMenu.Root\` — \`open\` / \`onOpenChange\`: 외부 제어 가능
        `.trim(),
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj;

const TRIGGER_STYLE: React.CSSProperties = {
  width: 320,
  height: 160,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '2px dashed currentColor',
  borderRadius: 8,
  cursor: 'context-menu',
  userSelect: 'none',
};

function DefaultDemo() {
  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger style={TRIGGER_STYLE}>Right-click here</ContextMenu.Trigger>
      <ContextMenu.Portal>
        <ContextMenu.Content>
          <ContextMenu.Item>Back</ContextMenu.Item>
          <ContextMenu.Item>Forward</ContextMenu.Item>
          <ContextMenu.Item>Reload</ContextMenu.Item>
          <ContextMenu.Item disabled>Print… (disabled)</ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
}

function WithSubmenuDemo() {
  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger style={TRIGGER_STYLE}>Right-click for share options</ContextMenu.Trigger>
      <ContextMenu.Portal>
        <ContextMenu.Content>
          <ContextMenu.Item>Copy link</ContextMenu.Item>
          <ContextMenu.Sub>
            <ContextMenu.SubTrigger>Share via</ContextMenu.SubTrigger>
            <ContextMenu.Portal>
              <ContextMenu.SubContent>
                <ContextMenu.Item>Email</ContextMenu.Item>
                <ContextMenu.Item>Slack</ContextMenu.Item>
                <ContextMenu.Item>Teams</ContextMenu.Item>
              </ContextMenu.SubContent>
            </ContextMenu.Portal>
          </ContextMenu.Sub>
          <ContextMenu.Item>Open in new tab</ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
}

function LongMenuDemo() {
  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger style={TRIGGER_STYLE}>Right-click for full menu</ContextMenu.Trigger>
      <ContextMenu.Portal>
        <ContextMenu.Content>
          <ContextMenu.Item>Cut</ContextMenu.Item>
          <ContextMenu.Item>Copy</ContextMenu.Item>
          <ContextMenu.Item>Paste</ContextMenu.Item>
          <ContextMenu.Item>Paste and Match Style</ContextMenu.Item>
          <ContextMenu.Item disabled>Delete (disabled)</ContextMenu.Item>
          <ContextMenu.Item>Select All</ContextMenu.Item>
          <ContextMenu.Sub>
            <ContextMenu.SubTrigger>Find</ContextMenu.SubTrigger>
            <ContextMenu.Portal>
              <ContextMenu.SubContent>
                <ContextMenu.Item>Find…</ContextMenu.Item>
                <ContextMenu.Item>Find Next</ContextMenu.Item>
                <ContextMenu.Item>Find Previous</ContextMenu.Item>
              </ContextMenu.SubContent>
            </ContextMenu.Portal>
          </ContextMenu.Sub>
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
}

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '기본 컨텍스트 메뉴. 점선 영역을 우클릭하면 열린다. `disabled` 항목과 기본 항목으로 구성된 가장 단순한 케이스.',
      },
    },
  },
  render: () => <DefaultDemo />,
};

export const WithSubmenu: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`Sub` + `SubTrigger` + `SubContent`로 "Share via" 서브메뉴 구성. `ArrowRight`로 진입, `ArrowLeft`로 닫는다.',
      },
    },
  },
  render: () => <WithSubmenuDemo />,
};

export const LongMenu: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '다수 항목과 서브메뉴를 함께 포함한 편집기 스타일 컨텍스트 메뉴. Typeahead로 빠른 항목 탐색이 가능하다.',
      },
    },
  },
  render: () => <LongMenuDemo />,
};
