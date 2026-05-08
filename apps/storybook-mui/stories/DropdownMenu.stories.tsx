import { DropdownMenu } from '@gugbab/styled-mui';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

const meta = {
  title: 'Menus/DropdownMenu',
  component: DropdownMenu.Root,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
**DropdownMenu** — 버튼 클릭으로 열리는 드롭다운 메뉴 컴포넌트. Radix UI 기반의 headless 구조 위에 MUI 토큰이 적용된 스타일드 버전이다.

### 컴파운드 구조

| 키                              | 역할                                                              |
| ------------------------------- | ----------------------------------------------------------------- |
| \`DropdownMenu.Root\`           | 메뉴 전체 상태를 관리하는 컨텍스트 제공자                         |
| \`DropdownMenu.Trigger\`        | 메뉴를 여닫는 트리거 버튼                                         |
| \`DropdownMenu.Portal\`         | 메뉴를 \`document.body\`에 포탈로 렌더링                          |
| \`DropdownMenu.Content\`        | 메뉴 패널. \`sideOffset\`으로 트리거와의 간격 조정                |
| \`DropdownMenu.Item\`           | 기본 메뉴 항목. \`disabled\` prop 지원                            |
| \`DropdownMenu.Label\`          | 항목 그룹의 제목 (비선택, 시각적 구분)                            |
| \`DropdownMenu.Separator\`      | 항목 사이 구분선                                                  |
| \`DropdownMenu.CheckboxItem\`   | 체크박스 형태 항목. \`checked\` / \`onCheckedChange\` 제어        |
| \`DropdownMenu.RadioGroup\`     | 라디오 그룹 컨테이너. \`value\` / \`onValueChange\` 제어         |
| \`DropdownMenu.RadioItem\`      | 라디오 형태 항목. \`value\` 필수                                  |
| \`DropdownMenu.ItemIndicator\`  | CheckboxItem/RadioItem 선택 시 나타나는 인디케이터                |
| \`DropdownMenu.Sub\`            | 서브메뉴 컨텍스트 제공자                                          |
| \`DropdownMenu.SubTrigger\`     | 서브메뉴를 여는 트리거 항목 (오른쪽 화살표로 진입)                |
| \`DropdownMenu.SubContent\`     | 서브메뉴 패널                                                     |

### 접근성 · 키보드

- \`ArrowDown\` / \`ArrowUp\`: 항목 이동
- \`Enter\` / \`Space\`: 항목 선택
- \`Escape\`: 메뉴 닫기
- \`ArrowRight\`: 서브메뉴 진입, \`ArrowLeft\`: 서브메뉴 닫기
- Typeahead: 문자 입력 시 해당 문자로 시작하는 항목으로 포커스 이동
- 메뉴가 열리면 포커스가 자동으로 첫 번째 항목으로 이동 (WAI-ARIA Menu Button 패턴)

### 주요 prop

- \`DropdownMenu.Content\` — \`sideOffset\`: 트리거와의 간격(px), \`align\`: \`start\` / \`center\` / \`end\`
- \`DropdownMenu.Item\` — \`disabled\`: 비활성화, \`onSelect\`: 선택 콜백
- \`DropdownMenu.Root\` — \`open\` / \`onOpenChange\`: 외부 제어 가능
        `.trim(),
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj;

function DefaultDemo() {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>Options</DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content>
          <DropdownMenu.Label>Actions</DropdownMenu.Label>
          <DropdownMenu.Item>New file</DropdownMenu.Item>
          <DropdownMenu.Item>Open…</DropdownMenu.Item>
          <DropdownMenu.Separator />
          <DropdownMenu.Item disabled>Save (disabled)</DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

function WithCheckboxDemo() {
  const [showGrid, setShowGrid] = useState(false);
  const [showRulers, setShowRulers] = useState(true);

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>View</DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content>
          <DropdownMenu.Label>Display</DropdownMenu.Label>
          <DropdownMenu.CheckboxItem checked={showGrid} onCheckedChange={setShowGrid}>
            <DropdownMenu.ItemIndicator>✓</DropdownMenu.ItemIndicator>
            Show Grid
          </DropdownMenu.CheckboxItem>
          <DropdownMenu.CheckboxItem checked={showRulers} onCheckedChange={setShowRulers}>
            <DropdownMenu.ItemIndicator>✓</DropdownMenu.ItemIndicator>
            Show Rulers
          </DropdownMenu.CheckboxItem>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

function WithRadioDemo() {
  const [theme, setTheme] = useState('system');

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>Theme: {theme}</DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content>
          <DropdownMenu.Label>Color Theme</DropdownMenu.Label>
          <DropdownMenu.RadioGroup value={theme} onValueChange={setTheme}>
            <DropdownMenu.RadioItem value="light">
              <DropdownMenu.ItemIndicator>●</DropdownMenu.ItemIndicator>
              Light
            </DropdownMenu.RadioItem>
            <DropdownMenu.RadioItem value="dark">
              <DropdownMenu.ItemIndicator>●</DropdownMenu.ItemIndicator>
              Dark
            </DropdownMenu.RadioItem>
            <DropdownMenu.RadioItem value="system">
              <DropdownMenu.ItemIndicator>●</DropdownMenu.ItemIndicator>
              System
            </DropdownMenu.RadioItem>
          </DropdownMenu.RadioGroup>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

function WithSubmenuDemo() {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>File</DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content>
          <DropdownMenu.Item>New file</DropdownMenu.Item>
          <DropdownMenu.Sub>
            <DropdownMenu.SubTrigger>Export as</DropdownMenu.SubTrigger>
            <DropdownMenu.Portal>
              <DropdownMenu.SubContent>
                <DropdownMenu.Item>PDF</DropdownMenu.Item>
                <DropdownMenu.Item>PNG</DropdownMenu.Item>
                <DropdownMenu.Item>SVG</DropdownMenu.Item>
              </DropdownMenu.SubContent>
            </DropdownMenu.Portal>
          </DropdownMenu.Sub>
          <DropdownMenu.Separator />
          <DropdownMenu.Item>Quit</DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '기본 드롭다운 메뉴. `Label`로 그룹 제목, `Separator`로 구분선, `disabled` 항목을 포함한 일반적인 구성.',
      },
    },
  },
  render: () => <DefaultDemo />,
};

export const WithCheckbox: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`CheckboxItem` + `ItemIndicator`를 사용한 토글 메뉴. `checked` / `onCheckedChange`로 상태를 제어한다.',
      },
    },
  },
  render: () => <WithCheckboxDemo />,
};

export const WithRadio: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`RadioGroup` + `RadioItem`으로 상호 배타적 선택 구현. `value` / `onValueChange`로 선택 상태를 관리한다.',
      },
    },
  },
  render: () => <WithRadioDemo />,
};

export const WithSubmenu: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`Sub` + `SubTrigger` + `SubContent`로 중첩 서브메뉴 구성. `ArrowRight`로 진입, `ArrowLeft`로 닫는다.',
      },
    },
  },
  render: () => <WithSubmenuDemo />,
};
