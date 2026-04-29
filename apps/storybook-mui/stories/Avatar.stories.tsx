import { Avatar, type AvatarSize } from '@gugbab-ui/styled-mui';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Primitives/Avatar',
  component: Avatar.Root,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
**Avatar** — 사용자 프로필을 표시하는 작은 원형(또는 사각) 아이덴티티 컴포넌트. 이미지 로드가 실패하거나 늦어지면 자동으로 폴백 콘텐츠가 노출된다.

### 컴파운드 구조

| 키                  | 역할                                                                       |
| ------------------- | -------------------------------------------------------------------------- |
| \`Avatar.Root\`     | 래퍼. \`size\` prop으로 \`sm\` / \`md\` / \`lg\` 사이즈 지정.              |
| \`Avatar.Image\`    | 실제 \`<img>\`. 로드 상태에 따라 자동으로 노출되며 실패 시 사라진다.       |
| \`Avatar.Fallback\` | 이미지가 없거나 로딩 중일 때 보일 대체 콘텐츠 (이니셜·아이콘 등).          |

### 사용 가이드
- 이미지 URL이 있어도 항상 \`Avatar.Fallback\`을 함께 두어 네트워크 실패에 대비한다.
- \`Avatar.Fallback\`의 \`delayMs\`는 이미지 로딩이 매우 짧을 때 폴백이 깜빡이는 현상을 막는다.
- \`Avatar.Image\`에는 의미 있는 \`alt\`를 넣되, 같은 화면에 사용자명이 별도로 노출되면 빈 문자열로 둔다.
        `.trim(),
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj;

interface DemoProps {
  size?: AvatarSize;
  src?: string;
  fallback?: string;
}

function Demo({ size, src, fallback = 'JD' }: DemoProps) {
  return (
    <Avatar.Root size={size}>
      {src ? <Avatar.Image src={src} alt="user avatar" /> : null}
      <Avatar.Fallback delayMs={src ? 600 : 0}>{fallback}</Avatar.Fallback>
    </Avatar.Root>
  );
}

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '이미지가 정상 로드된 기본 상태. 로드되는 동안 600ms 지연 후 폴백이 노출되어 깜빡임을 방지한다.',
      },
    },
  },
  render: () => <Demo src="https://i.pravatar.cc/80?u=1" />,
};

export const Sizes: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`size` prop으로 3단계 크기 선택. CSS 변수(`--gugbab-space-*`) 기반이라 토큰만 바꾸면 일괄 조정된다.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <Demo size="sm" src="https://i.pravatar.cc/80?u=1" />
      <Demo size="md" src="https://i.pravatar.cc/80?u=2" />
      <Demo size="lg" src="https://i.pravatar.cc/80?u=3" />
    </div>
  ),
};

export const FallbackOnly: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`Image` 없이 `Fallback`만 노출. 사용자가 프로필 이미지를 등록하지 않은 일반 케이스.',
      },
    },
  },
  render: () => <Demo fallback="GB" />,
};
