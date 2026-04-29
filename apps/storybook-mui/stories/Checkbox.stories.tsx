import { Checkbox, type CheckboxSize, type CheckedState } from '@gugbab-ui/styled-mui';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Stateful/Checkbox',
  component: Checkbox.Root,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
**Checkbox** — true / false / indeterminate 3가지 상태를 지원하는 체크박스 컴포넌트. 네이티브 \`<button role="checkbox">\` 기반으로 키보드·스크린 리더를 완전 지원한다.

### 컴파운드 구조

| 키 | 역할 |
| -- | ---- |
| \`Checkbox.Root\` | 버튼 래퍼. 체크 상태·크기·비활성화 prop 수신 |
| \`Checkbox.Indicator\` | 체크 아이콘 표시 영역. \`forceMount\`로 항상 렌더링 강제 가능 |

### Props (Root)

| Prop | 타입 | 기본값 | 설명 |
| ---- | ---- | ------ | ---- |
| \`size\` | \`'sm' \\| 'md' \\| 'lg'\` | \`'md'\` | 크기 |
| \`checked\` | \`CheckedState\` | — | 제어 값 (\`true \\| false \\| 'indeterminate'\`) |
| \`defaultChecked\` | \`boolean\` | — | 비제어 초기값 |
| \`disabled\` | \`boolean\` | — | 비활성화 |
| \`onCheckedChange\` | \`(checked: CheckedState) => void\` | — | 상태 변경 콜백 |

### 사용 가이드
- \`indeterminate\` 상태는 그룹 체크박스에서 일부만 선택됐을 때 부모 체크박스에 사용한다.
- 반드시 인접한 \`<Label>\`이나 \`aria-label\`로 설명을 제공한다.
- 스페이스 키로 토글 지원.
        `.trim(),
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj;

interface CheckboxDemoProps {
  size?: CheckboxSize;
  checked?: CheckedState;
  defaultChecked?: boolean;
  disabled?: boolean;
}

function Demo({ size, checked, defaultChecked, disabled }: CheckboxDemoProps) {
  return (
    <Checkbox.Root
      size={size}
      checked={checked}
      defaultChecked={defaultChecked}
      disabled={disabled}
    >
      <Checkbox.Indicator />
    </Checkbox.Root>
  );
}

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: '기본 md 크기, 체크된 상태. 클릭 또는 스페이스 키로 on/off 전환이 가능하다.',
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

export const Indeterminate: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`checked="indeterminate"` — 일부 선택 상태. 그룹 체크박스의 부모 항목에 주로 활용한다.',
      },
    },
  },
  render: () => <Demo checked="indeterminate" />,
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
