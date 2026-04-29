import { Switch, type SwitchSize } from '@gugbab-ui/styled-mui';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Stateful/Switch',
  component: Switch.Root,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
**Switch** — on/off 두 가지 상태를 전환하는 토글 스위치 컴포넌트. 네이티브 \`<button role="switch">\`를 기반으로 키보드·스크린 리더를 완전 지원한다.

### 컴파운드 구조

| 키 | 역할 |
| -- | ---- |
| \`Switch.Root\` | 버튼 래퍼. \`checked\` / \`defaultChecked\` / \`disabled\` / \`size\` prop 수신 |
| \`Switch.Thumb\` | 슬라이딩 원형 핸들. CSS transition으로 위치가 전환된다 |

### Props (Root)

| Prop | 타입 | 기본값 | 설명 |
| ---- | ---- | ------ | ---- |
| \`size\` | \`'sm' \\| 'md' \\| 'lg'\` | \`'md'\` | 크기 |
| \`defaultChecked\` | \`boolean\` | — | 비제어 초기값 |
| \`checked\` | \`boolean\` | — | 제어 값 |
| \`disabled\` | \`boolean\` | — | 비활성화 |
| \`onCheckedChange\` | \`(checked: boolean) => void\` | — | 상태 변경 콜백 |

### 사용 가이드
- 반드시 인접한 \`<Label>\`이나 \`aria-label\`로 설명을 제공한다.
- 스페이스 키로 토글, 탭으로 포커스 이동이 기본 지원된다.
        `.trim(),
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj;

interface SwitchDemoProps {
  size?: SwitchSize;
  defaultChecked?: boolean;
  disabled?: boolean;
}

function Demo({ size, defaultChecked, disabled }: SwitchDemoProps) {
  return (
    <Switch.Root size={size} defaultChecked={defaultChecked} disabled={disabled}>
      <Switch.Thumb />
    </Switch.Root>
  );
}

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: '기본 md 크기, 켜진 상태. 클릭 또는 스페이스 키로 on/off 전환이 가능하다.',
      },
    },
  },
  render: () => <Demo defaultChecked />,
};

export const Sizes: Story = {
  parameters: {
    docs: {
      description: {
        story: '`size` prop으로 3단계 크기 선택. sm / md / lg 순으로 표시된다.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <Demo size="sm" defaultChecked />
      <Demo size="md" defaultChecked />
      <Demo size="lg" defaultChecked />
    </div>
  ),
};

export const Disabled: Story = {
  parameters: {
    docs: {
      description: {
        story: '`disabled` 상태. 포커스·클릭이 차단되며 시각적으로 비활성임을 나타낸다.',
      },
    },
  },
  render: () => <Demo disabled defaultChecked />,
};
