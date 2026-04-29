import { Progress, type ProgressSize } from '@gugbab-ui/styled-mui';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Stateful/Progress',
  component: Progress.Root,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
**Progress** — 작업 진행률을 시각적으로 표시하는 진행 바 컴포넌트. determinate(수치 진행)와 indeterminate(불확정 진행) 두 모드를 지원한다.

### 컴파운드 구조

| 키 | 역할 |
| -- | ---- |
| \`Progress.Root\` | 트랙(배경) 래퍼. \`value\` / \`max\` / \`size\` prop 수신 |
| \`Progress.Indicator\` | 실제 진행 바. CSS transform으로 너비가 애니메이션된다 |

### Props (Root)

| Prop | 타입 | 기본값 | 설명 |
| ---- | ---- | ------ | ---- |
| \`value\` | \`number \\| null\` | \`0\` | 현재 진행값 (0~\`max\`). \`null\`이면 indeterminate |
| \`max\` | \`number\` | \`100\` | 최대값 |
| \`size\` | \`'sm' \\| 'md'\` | \`'md'\` | 트랙 두께 |

### 사용 가이드
- \`value={null}\`이면 indeterminate 모드로 CSS 애니메이션이 자동 적용된다.
- 내부적으로 \`role="progressbar"\`와 \`aria-valuenow\` / \`aria-valuemax\`가 자동 설정된다.
- 파일 업로드, 단계별 온보딩, API 로딩 상태 표시에 활용한다.
        `.trim(),
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj;

interface ProgressDemoProps {
  size?: ProgressSize;
  value?: number | null;
}

function Demo({ size, value }: ProgressDemoProps) {
  return (
    <div style={{ width: 320 }}>
      <Progress.Root size={size} value={value}>
        <Progress.Indicator />
      </Progress.Root>
    </div>
  );
}

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: '`value={60}` — 60% 진행 상태. 기본 md 크기로 표시된다.',
      },
    },
  },
  render: () => <Demo value={60} />,
};

export const Sizes: Story = {
  parameters: {
    docs: {
      description: {
        story: '`size` prop으로 2단계 두께 선택. sm(얇음) / md(보통) 순으로 표시된다.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: 320 }}>
      <Demo size="sm" value={40} />
      <Demo size="md" value={70} />
    </div>
  ),
};

export const Indeterminate: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`value={null}` — indeterminate 모드. 진행률을 알 수 없는 로딩 상태에서 CSS 애니메이션이 반복된다.',
      },
    },
  },
  render: () => <Demo value={null} />,
};
