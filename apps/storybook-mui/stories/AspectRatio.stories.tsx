import { AspectRatio } from '@gugbab/styled-mui';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Primitives/AspectRatio',
  component: AspectRatio,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
**AspectRatio** — 자식 콘텐츠의 가로·세로 비율을 강제 유지하는 컨테이너. 이미지·비디오·썸네일에서 레이아웃 시프트 없이 비율을 보장한다.

### 구조

단일 컴포넌트. padding-top trick으로 비율을 구현하며 자식은 절대 위치로 채워진다.

| Prop | 타입 | 기본값 | 설명 |
| ---- | ---- | ------ | ---- |
| \`ratio\` | \`number\` | \`1\` | 가로 / 세로 비율 (예: \`16/9\`, \`4/3\`, \`1\`) |

### 사용 가이드
- 자식 \`<img>\`에는 \`width: 100%; height: 100%; object-fit: cover\`를 적용해야 비율에 맞게 채워진다.
- 부모 컨테이너에 \`width\`를 명시해야 비율이 올바르게 계산된다.
- 자식이 없어도 비율 크기만큼 빈 공간이 확보되므로 스켈레톤 UI 구현에도 활용할 수 있다.
        `.trim(),
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof AspectRatio>;

export default meta;
type Story = StoryObj;

export const SixteenByNine: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`ratio={16 / 9}` — 와이드스크린 비율. 유튜브 썸네일·히어로 이미지에 가장 널리 쓰인다.',
      },
    },
  },
  render: () => (
    <div style={{ width: 480 }}>
      <AspectRatio ratio={16 / 9}>
        <img
          src="https://images.unsplash.com/photo-1535025183041-0991a977e25b?w=800&auto=format"
          alt="Landscape"
          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }}
        />
      </AspectRatio>
    </div>
  ),
};

export const FourByThree: Story = {
  parameters: {
    docs: {
      description: {
        story: '`ratio={4 / 3}` — 전통 사진·슬라이드 비율. 16:9보다 세로가 조금 더 길다.',
      },
    },
  },
  render: () => (
    <div style={{ width: 360 }}>
      <AspectRatio ratio={4 / 3}>
        <img
          src="https://images.unsplash.com/photo-1535025183041-0991a977e25b?w=800&auto=format"
          alt="Landscape 4:3"
          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }}
        />
      </AspectRatio>
    </div>
  ),
};

export const Square: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`ratio={1}` — 정사각형. 프로필 이미지·카드 썸네일 등 1:1 비율이 필요한 경우에 사용한다.',
      },
    },
  },
  render: () => (
    <div style={{ width: 240 }}>
      <AspectRatio ratio={1}>
        <img
          src="https://images.unsplash.com/photo-1535025183041-0991a977e25b?w=800&auto=format"
          alt="Square"
          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }}
        />
      </AspectRatio>
    </div>
  ),
};
