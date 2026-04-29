import { Separator } from '@gugbab-ui/styled-radix';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Primitives/Separator',
  component: Separator,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
**Separator** — 콘텐츠 영역을 시각적으로 구분하는 선(divider) 컴포넌트.

### 구조

단일 컴포넌트. 내부적으로 \`role="separator"\` 또는 \`role="none"\`을 자동 부여한다.

| Prop | 타입 | 기본값 | 설명 |
| ---- | ---- | ------ | ---- |
| \`orientation\` | \`'horizontal' \\| 'vertical'\` | \`'horizontal'\` | 선 방향 |
| \`decorative\` | \`boolean\` | \`false\` | \`true\`이면 \`aria-hidden\`이 추가되어 스크린 리더가 무시 |

### 사용 가이드
- 내용 분리 의미가 있으면 \`decorative={false}\`(기본)로 두어 스크린 리더가 구분선을 인지하게 한다.
- 단순 시각 장식일 때는 \`decorative\`를 \`true\`로 설정한다.
- 수직 구분선 사용 시 부모 컨테이너의 높이가 명시되어야 선이 표시된다.
        `.trim(),
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Separator>;

export default meta;
type Story = StoryObj;

export const Horizontal: Story = {
  parameters: {
    docs: {
      description: {
        story: '기본 가로 구분선. 섹션 간 콘텐츠를 상하로 분리할 때 사용한다.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: 300 }}>
      <span>Section A</span>
      <Separator orientation="horizontal" />
      <span>Section B</span>
    </div>
  ),
};

export const Vertical: Story = {
  parameters: {
    docs: {
      description: {
        story: '수직 구분선. 인라인 항목(예: 내비게이션 링크, 툴바 버튼) 사이를 좌우로 분리한다.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, height: 40 }}>
      <span>Left</span>
      <Separator orientation="vertical" />
      <span>Right</span>
    </div>
  ),
};

export const Decorative: Story = {
  parameters: {
    docs: {
      description: {
        story: '`decorative` 모드. `aria-hidden`이 추가되어 스크린 리더가 구분선을 건너뛴다.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: 300 }}>
      <span>시각 장식용 구분선 위</span>
      <Separator orientation="horizontal" decorative />
      <span>시각 장식용 구분선 아래</span>
    </div>
  ),
};
