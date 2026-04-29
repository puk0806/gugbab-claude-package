import { Toolbar } from '@gugbab-ui/styled-mui';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

const meta = {
  title: 'Navigation/Toolbar',
  component: Toolbar.Root,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
**Toolbar** — 관련 동작 버튼을 한 줄로 묶어 표시하는 컴포넌트. 텍스트 에디터, 이미지 편집기, 필터 패널 등 여러 동작이 밀집된 UI에 사용된다.

### 컴파운드 구조

| 키                      | 역할                                                                              |
| ----------------------- | --------------------------------------------------------------------------------- |
| \`Toolbar.Root\`        | 컨테이너. \`orientation\` prop으로 수평·수직 배치 선택.                           |
| \`Toolbar.Button\`      | 일반 동작 버튼. 단독 실행 동작(굵게, 취소선 등)에 사용.                           |
| \`Toolbar.ToggleGroup\` | 토글 버튼 그룹. \`type="single"\`(단일 선택)·\`type="multiple"\`(복수 선택) 지원. |
| \`Toolbar.ToggleItem\`  | 그룹 내 개별 토글 버튼. \`value\` prop 필수.                                      |
| \`Toolbar.Separator\`   | 버튼 그룹 사이의 시각적 구분선.                                                   |
| \`Toolbar.Link\`        | 툴바 안에 위치하는 인라인 링크.                                                   |

### 접근성

- \`Root\`에 \`aria-label\`을 지정해 툴바 영역의 역할을 스크린 리더에 전달한다.
- 화살표 키로 버튼 간 포커스 이동, \`Tab\`으로 툴바 진입·이탈이 지원된다.

### 주요 prop

- \`orientation\` — \`'horizontal' | 'vertical'\` (기본값 \`'horizontal'\`)
- \`ToggleGroup.type\` — \`'single' | 'multiple'\`
        `.trim(),
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj;

function EditorToolbar({
  orientation = 'horizontal',
}: {
  orientation?: 'horizontal' | 'vertical';
}) {
  const [alignment, setAlignment] = useState<string>('left');

  return (
    <Toolbar.Root orientation={orientation} aria-label="Text editor toolbar">
      <Toolbar.Button aria-label="Bold">B</Toolbar.Button>
      <Toolbar.Button aria-label="Italic">I</Toolbar.Button>
      <Toolbar.Button aria-label="Underline">U</Toolbar.Button>

      <Toolbar.Separator />

      <Toolbar.ToggleGroup
        type="single"
        value={alignment}
        onValueChange={(v) => {
          if (v) setAlignment(v);
        }}
        aria-label="Text alignment"
      >
        <Toolbar.ToggleItem value="left" aria-label="Align left">
          ←
        </Toolbar.ToggleItem>
        <Toolbar.ToggleItem value="center" aria-label="Align center">
          ↔
        </Toolbar.ToggleItem>
        <Toolbar.ToggleItem value="right" aria-label="Align right">
          →
        </Toolbar.ToggleItem>
      </Toolbar.ToggleGroup>

      <Toolbar.Separator />

      <Toolbar.Link href="#" aria-label="Open link">
        Link
      </Toolbar.Link>
    </Toolbar.Root>
  );
}

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '텍스트 에디터 툴바 패턴. 단독 버튼, 단일 선택 토글 그룹, 구분선, 링크가 수평으로 배치된다.',
      },
    },
  },
  render: () => <EditorToolbar />,
};

export const Vertical: Story = {
  parameters: {
    docs: {
      description: {
        story: '`orientation="vertical"` 설정. 사이드 패널이나 세로 레이아웃에 적합한 수직 배치.',
      },
    },
  },
  render: () => <EditorToolbar orientation="vertical" />,
};

export const MultiSelect: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`type="multiple"` ToggleGroup으로 굵게·기울임·밑줄을 동시에 선택할 수 있는 서식 툴바.',
      },
    },
  },
  render: () => {
    const [formats, setFormats] = useState<string[]>([]);
    return (
      <Toolbar.Root aria-label="Text formatting toolbar">
        <Toolbar.ToggleGroup
          type="multiple"
          value={formats}
          onValueChange={setFormats}
          aria-label="Text formatting"
        >
          <Toolbar.ToggleItem value="bold" aria-label="Bold">
            B
          </Toolbar.ToggleItem>
          <Toolbar.ToggleItem value="italic" aria-label="Italic">
            I
          </Toolbar.ToggleItem>
          <Toolbar.ToggleItem value="underline" aria-label="Underline">
            U
          </Toolbar.ToggleItem>
          <Toolbar.ToggleItem value="strikethrough" aria-label="Strikethrough">
            S
          </Toolbar.ToggleItem>
        </Toolbar.ToggleGroup>

        <Toolbar.Separator />

        <Toolbar.Button aria-label="Clear formatting">Clear</Toolbar.Button>
      </Toolbar.Root>
    );
  },
};
