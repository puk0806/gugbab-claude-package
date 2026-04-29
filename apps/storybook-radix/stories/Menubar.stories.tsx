import { Menubar } from '@gugbab-ui/styled-radix';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

const meta = {
  title: 'Menus/Menubar',
  component: Menubar.Root,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
**Menubar** — 데스크톱 애플리케이션의 메뉴 바(File / Edit / View…)를 구현하는 컴포넌트. 여러 개의 \`Menu\`를 수평으로 나열하고 키보드로 이동할 수 있다.

### 컴파운드 구조

| 키                          | 역할                                                              |
| --------------------------- | ----------------------------------------------------------------- |
| \`Menubar.Root\`            | 전체 메뉴 바 컨테이너. 수평 레이아웃 제공                         |
| \`Menubar.Menu\`            | 개별 메뉴 단위. **\`value\` prop 필수** (고유 식별자)             |
| \`Menubar.Trigger\`         | 각 메뉴를 여닫는 버튼 (메뉴 바 탭)                               |
| \`Menubar.Portal\`          | 메뉴 패널을 \`document.body\`에 포탈로 렌더링                     |
| \`Menubar.Content\`         | 메뉴 패널                                                         |
| \`Menubar.Item\`            | 기본 메뉴 항목. \`disabled\` prop 지원                            |
| \`Menubar.Label\`           | 항목 그룹 제목 (비선택, 시각적 구분)                              |
| \`Menubar.Separator\`       | 항목 사이 구분선                                                  |
| \`Menubar.CheckboxItem\`    | 체크박스 형태 항목. \`checked\` / \`onCheckedChange\` 제어        |
| \`Menubar.RadioGroup\`      | 라디오 그룹 컨테이너. \`value\` / \`onValueChange\` 제어         |
| \`Menubar.RadioItem\`       | 라디오 형태 항목. \`value\` 필수                                  |
| \`Menubar.ItemIndicator\`   | CheckboxItem/RadioItem 선택 시 나타나는 인디케이터                |
| \`Menubar.Sub\`             | 서브메뉴 컨텍스트 제공자                                          |
| \`Menubar.SubTrigger\`      | 서브메뉴를 여는 트리거 항목                                       |
| \`Menubar.SubContent\`      | 서브메뉴 패널                                                     |

### 접근성 · 키보드

- \`ArrowLeft\` / \`ArrowRight\`: 메뉴 바 내 메뉴 간 이동
- \`ArrowDown\` / \`Enter\`: 열린 메뉴 Content로 진입
- \`ArrowDown\` / \`ArrowUp\`: 메뉴 항목 이동
- \`Enter\` / \`Space\`: 항목 선택
- \`Escape\`: 현재 메뉴 닫기 (메뉴 바 포커스 유지)
- \`Tab\`: 메뉴 바 전체 탈출
- Typeahead: 문자 입력 시 해당 문자로 시작하는 항목으로 포커스 이동

### 주요 prop

- \`Menubar.Menu\` — \`value\`: 각 메뉴의 고유 문자열 식별자 (필수)
- \`Menubar.Root\` — \`value\` / \`onValueChange\`: 현재 열린 메뉴를 외부에서 제어 가능
- \`Menubar.Item\` — \`disabled\`: 비활성화, \`onSelect\`: 선택 콜백
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
    <Menubar.Root>
      <Menubar.Menu value="file">
        <Menubar.Trigger>File</Menubar.Trigger>
        <Menubar.Portal>
          <Menubar.Content>
            <Menubar.Item>New File</Menubar.Item>
            <Menubar.Item>Open…</Menubar.Item>
            <Menubar.Separator />
            <Menubar.Item>Save</Menubar.Item>
            <Menubar.Item>Save As…</Menubar.Item>
            <Menubar.Separator />
            <Menubar.Item disabled>Print… (disabled)</Menubar.Item>
          </Menubar.Content>
        </Menubar.Portal>
      </Menubar.Menu>

      <Menubar.Menu value="edit">
        <Menubar.Trigger>Edit</Menubar.Trigger>
        <Menubar.Portal>
          <Menubar.Content>
            <Menubar.Item>Undo</Menubar.Item>
            <Menubar.Item>Redo</Menubar.Item>
            <Menubar.Separator />
            <Menubar.Item>Cut</Menubar.Item>
            <Menubar.Item>Copy</Menubar.Item>
            <Menubar.Item>Paste</Menubar.Item>
          </Menubar.Content>
        </Menubar.Portal>
      </Menubar.Menu>

      <Menubar.Menu value="view">
        <Menubar.Trigger>View</Menubar.Trigger>
        <Menubar.Portal>
          <Menubar.Content>
            <Menubar.Item>Zoom In</Menubar.Item>
            <Menubar.Item>Zoom Out</Menubar.Item>
            <Menubar.Separator />
            <Menubar.Item>Reset Zoom</Menubar.Item>
          </Menubar.Content>
        </Menubar.Portal>
      </Menubar.Menu>
    </Menubar.Root>
  );
}

function WithCheckboxDemo() {
  const [showStatusBar, setShowStatusBar] = useState(true);
  const [showSidebar, setShowSidebar] = useState(false);
  const [wordWrap, setWordWrap] = useState(false);

  return (
    <Menubar.Root>
      <Menubar.Menu value="file">
        <Menubar.Trigger>File</Menubar.Trigger>
        <Menubar.Portal>
          <Menubar.Content>
            <Menubar.Item>New File</Menubar.Item>
            <Menubar.Item>Open…</Menubar.Item>
            <Menubar.Separator />
            <Menubar.Item>Save</Menubar.Item>
          </Menubar.Content>
        </Menubar.Portal>
      </Menubar.Menu>

      <Menubar.Menu value="edit">
        <Menubar.Trigger>Edit</Menubar.Trigger>
        <Menubar.Portal>
          <Menubar.Content>
            <Menubar.Item>Undo</Menubar.Item>
            <Menubar.Item>Redo</Menubar.Item>
            <Menubar.Separator />
            <Menubar.Item>Cut</Menubar.Item>
            <Menubar.Item>Copy</Menubar.Item>
            <Menubar.Item>Paste</Menubar.Item>
          </Menubar.Content>
        </Menubar.Portal>
      </Menubar.Menu>

      <Menubar.Menu value="view">
        <Menubar.Trigger>View</Menubar.Trigger>
        <Menubar.Portal>
          <Menubar.Content>
            <Menubar.Label>Layout</Menubar.Label>
            <Menubar.CheckboxItem checked={showStatusBar} onCheckedChange={setShowStatusBar}>
              <Menubar.ItemIndicator>✓</Menubar.ItemIndicator>
              Status Bar
            </Menubar.CheckboxItem>
            <Menubar.CheckboxItem checked={showSidebar} onCheckedChange={setShowSidebar}>
              <Menubar.ItemIndicator>✓</Menubar.ItemIndicator>
              Sidebar
            </Menubar.CheckboxItem>
            <Menubar.Separator />
            <Menubar.Label>Editor</Menubar.Label>
            <Menubar.CheckboxItem checked={wordWrap} onCheckedChange={setWordWrap}>
              <Menubar.ItemIndicator>✓</Menubar.ItemIndicator>
              Word Wrap
            </Menubar.CheckboxItem>
          </Menubar.Content>
        </Menubar.Portal>
      </Menubar.Menu>
    </Menubar.Root>
  );
}

function WithRadioDemo() {
  const [language, setLanguage] = useState('ko');
  const [zoom, setZoom] = useState('100');

  return (
    <Menubar.Root>
      <Menubar.Menu value="language">
        <Menubar.Trigger>Language</Menubar.Trigger>
        <Menubar.Portal>
          <Menubar.Content>
            <Menubar.Label>UI Language</Menubar.Label>
            <Menubar.RadioGroup value={language} onValueChange={setLanguage}>
              <Menubar.RadioItem value="ko">
                <Menubar.ItemIndicator>●</Menubar.ItemIndicator>
                한국어
              </Menubar.RadioItem>
              <Menubar.RadioItem value="en">
                <Menubar.ItemIndicator>●</Menubar.ItemIndicator>
                English
              </Menubar.RadioItem>
              <Menubar.RadioItem value="ja">
                <Menubar.ItemIndicator>●</Menubar.ItemIndicator>
                日本語
              </Menubar.RadioItem>
            </Menubar.RadioGroup>
          </Menubar.Content>
        </Menubar.Portal>
      </Menubar.Menu>

      <Menubar.Menu value="view">
        <Menubar.Trigger>View</Menubar.Trigger>
        <Menubar.Portal>
          <Menubar.Content>
            <Menubar.Label>Zoom Level</Menubar.Label>
            <Menubar.RadioGroup value={zoom} onValueChange={setZoom}>
              <Menubar.RadioItem value="75">
                <Menubar.ItemIndicator>●</Menubar.ItemIndicator>
                75%
              </Menubar.RadioItem>
              <Menubar.RadioItem value="100">
                <Menubar.ItemIndicator>●</Menubar.ItemIndicator>
                100%
              </Menubar.RadioItem>
              <Menubar.RadioItem value="150">
                <Menubar.ItemIndicator>●</Menubar.ItemIndicator>
                150%
              </Menubar.RadioItem>
            </Menubar.RadioGroup>
          </Menubar.Content>
        </Menubar.Portal>
      </Menubar.Menu>
    </Menubar.Root>
  );
}

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'File / Edit / View 3개 메뉴로 구성된 기본 메뉴 바. `ArrowLeft` / `ArrowRight`로 메뉴 간 이동, `Menubar.Menu`의 `value` prop이 필수다.',
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
          '`CheckboxItem` + `ItemIndicator`로 View 메뉴에서 UI 요소 표시 여부를 토글. `Label`로 항목 그룹을 시각적으로 구분한다.',
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
          '`RadioGroup` + `RadioItem`으로 상호 배타적 선택(언어/줌 레벨) 구현. 두 메뉴 각각에서 독립적인 라디오 상태를 관리한다.',
      },
    },
  },
  render: () => <WithRadioDemo />,
};
