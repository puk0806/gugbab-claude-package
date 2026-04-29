import { Tabs, type TabsSize, type TabsVariant } from '@gugbab-ui/styled-radix';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Stateful/Tabs',
  component: Tabs.Root,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
**Tabs** — 여러 콘텐츠 패널을 탭으로 전환하는 컴포넌트. WAI-ARIA Tabs 패턴을 준수하며 수평·수직 방향과 두 가지 시각 스타일을 지원한다.

### 컴파운드 구조

| 키               | 역할                                                                                    |
| ---------------- | --------------------------------------------------------------------------------------- |
| \`Tabs.Root\`    | 루트 컨테이너. \`defaultValue\` / \`value\` / \`onValueChange\` / \`orientation\` / \`variant\` / \`size\` 처리. |
| \`Tabs.List\`    | 탭 버튼들을 감싸는 리스트. \`role="tablist"\` 렌더. \`aria-label\` 제공을 권장.         |
| \`Tabs.Trigger\` | 개별 탭 버튼. \`value\` prop 필수. 선택 시 \`aria-selected="true"\` 반영.               |
| \`Tabs.Content\` | 탭 패널 영역. 연결된 \`Trigger\`의 \`value\`와 일치할 때 노출.                          |

### 사용 가이드

- \`orientation="vertical"\` 시 \`List\`와 \`Content\`를 나란히 배치하려면 래퍼에 \`display: flex\`를 적용한다.
- 키보드: **Arrow Left / Right** (수평) 또는 **Arrow Up / Down** (수직) 으로 탭 이동, **Home / End** 로 첫·끝 탭 이동.
- \`variant\`: \`'underline'\`(밑줄 강조) | \`'pills'\`(알약형 배경).
- \`size\`: \`'sm'\` | \`'md'\` (기본값 \`'md'\`).
        `.trim(),
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj;

const TAB_ITEMS = [
  { value: 'account', label: 'Account', content: 'Manage your account settings and preferences.' },
  { value: 'password', label: 'Password', content: 'Change your password and security options.' },
  {
    value: 'notifications',
    label: 'Notifications',
    content: 'Configure how and when you receive notifications.',
  },
] as const;

interface DemoProps {
  orientation?: 'horizontal' | 'vertical';
  variant?: TabsVariant;
  size?: TabsSize;
}

function Demo({ orientation = 'horizontal', variant, size }: DemoProps) {
  return (
    <Tabs.Root defaultValue="account" orientation={orientation} variant={variant} size={size}>
      <Tabs.List aria-label="tab navigation">
        {TAB_ITEMS.map((tab) => (
          <Tabs.Trigger key={tab.value} value={tab.value}>
            {tab.label}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      {TAB_ITEMS.map((tab) => (
        <Tabs.Content key={tab.value} value={tab.value}>
          <p>{tab.content}</p>
        </Tabs.Content>
      ))}
    </Tabs.Root>
  );
}

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`orientation="horizontal"` + `variant="underline"` 기본 상태. Account 탭이 초기 선택되어 콘텐츠가 노출된다.',
      },
    },
  },
  render: () => <Demo />,
};

export const Vertical: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`orientation="vertical"` — 탭 리스트가 세로로 배치되고 Arrow Up / Down 키로 이동한다.',
      },
    },
  },
  render: () => <Demo orientation="vertical" />,
};

export const Variants: Story = {
  parameters: {
    docs: {
      description: {
        story: '`underline`(하단 밑줄 강조)과 `pills`(선택 탭에 배경 채움) 두 스타일 비교.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <Demo variant="underline" />
      <Demo variant="pills" />
    </div>
  ),
};
