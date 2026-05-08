import { Skeleton } from '@gugbab-ui/styled-mui';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Primitives/Skeleton',
  component: Skeleton,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
**Skeleton** — 콘텐츠 로딩 중에 자리만 잡아주는 placeholder 컴포넌트. 데이터를 기다리는 동안 사용자가 레이아웃 변화를 인지하지 않게 한다.

### 구조

단일 컴포넌트. \`role="status"\` + \`aria-busy="true"\`가 자동 부여되어 스크린 리더가 "로딩 중"을 안내한다.

| Prop | 타입 | 기본값 | 설명 |
| ---- | ---- | ------ | ---- |
| \`variant\` | \`'rectangular' \\| 'circular' \\| 'text'\` | \`'rectangular'\` | 시각 형태 |

### 사용 가이드
- 데이터 fetching 중 실제 컴포넌트와 동일한 위치/크기를 차지하도록 \`width\`/\`height\`를 inline style 또는 className으로 지정한다.
- \`circular\`는 Avatar placeholder, \`text\`는 한 줄 텍스트, \`rectangular\`는 카드/이미지 등 일반 박스에 사용.
- \`prefers-reduced-motion\` 설정 시 shimmer 애니메이션이 자동으로 비활성화된다.
        `.trim(),
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: '기본 rectangular variant. 1em 높이의 사각 placeholder.',
      },
    },
  },
  render: () => <Skeleton style={{ width: 200 }} />,
};

export const Variants: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '세 가지 variant 비교. circular는 Avatar용, text는 한 줄 텍스트, rectangular는 일반 박스.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <Skeleton variant="circular" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: 200 }}>
        <Skeleton variant="text" />
        <Skeleton variant="rectangular" style={{ height: 60 }} />
      </div>
    </div>
  ),
};

export const Card: Story = {
  parameters: {
    docs: {
      description: {
        story: '카드 로딩 placeholder 패턴. 이미지 + 제목 + 설명을 모방한 조합.',
      },
    },
  },
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        width: 280,
        padding: 16,
        border: '1px solid var(--gugbab-color-border-subtle)',
        borderRadius: 8,
      }}
    >
      <Skeleton variant="rectangular" style={{ height: 140 }} />
      <Skeleton variant="text" style={{ width: '70%' }} />
      <Skeleton variant="text" />
      <Skeleton variant="text" style={{ width: '40%' }} />
    </div>
  ),
};
