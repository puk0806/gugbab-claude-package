import { Toggle, type ToggleSize, type ToggleVariant } from '@gugbab-ui/styled-radix';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';

const meta = {
  title: 'Stateful/Toggle',
  component: Toggle,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
**Toggle** — pressed / unpressed 두 상태를 전환하는 토글 버튼. 텍스트 에디터의 Bold·Italic, 뷰 전환 버튼 등 on/off 동작이 필요한 버튼에 사용한다.

### 구조

단일 컴포넌트 (컴파운드 없음). 내부적으로 \`<button aria-pressed>\`를 렌더링한다.

| Prop | 타입 | 기본값 | 설명 |
| ---- | ---- | ------ | ---- |
| \`variant\` | \`'default' \\| 'outline'\` | \`'default'\` | 외형 스타일 |
| \`size\` | \`'sm' \\| 'md'\` | \`'md'\` | 크기 |
| \`defaultPressed\` | \`boolean\` | — | 비제어 초기 pressed 상태 |
| \`pressed\` | \`boolean\` | — | 제어 pressed 상태 |
| \`disabled\` | \`boolean\` | — | 비활성화 |
| \`onPressedChange\` | \`(pressed: boolean) => void\` | — | 상태 변경 콜백 |

### 사용 가이드
- \`aria-pressed\`가 자동으로 관리되므로 스크린 리더가 on/off 상태를 인식한다.
- 여러 Toggle을 그룹으로 묶을 때는 \`ToggleGroup\` 컴포넌트를 사용한다.
- 스페이스·엔터 키로 토글 가능.
        `.trim(),
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj;

interface ToggleDemoProps {
  size?: ToggleSize;
  variant?: ToggleVariant;
  defaultPressed?: boolean;
  disabled?: boolean;
  children?: ReactNode;
}

function Demo({ size, variant, defaultPressed, disabled, children = 'B' }: ToggleDemoProps) {
  return (
    <Toggle size={size} variant={variant} defaultPressed={defaultPressed} disabled={disabled}>
      {children}
    </Toggle>
  );
}

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '기본 default variant, md 크기, pressed 상태. 클릭·스페이스·엔터로 on/off 전환이 가능하다.',
      },
    },
  },
  render: () => <Demo defaultPressed>Bold</Demo>,
};

export const Variants: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`default` — 배경 채움 스타일 / `outline` — 테두리 스타일. 둘 다 pressed 상태로 표시한다.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <Demo variant="default" defaultPressed>
        Default
      </Demo>
      <Demo variant="outline" defaultPressed>
        Outline
      </Demo>
    </div>
  ),
};

export const Sizes: Story = {
  parameters: {
    docs: {
      description: {
        story: '`size` prop으로 2단계 크기 선택. sm / md 순으로 표시된다.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <Demo size="sm" defaultPressed>
        Sm
      </Demo>
      <Demo size="md" defaultPressed>
        Md
      </Demo>
    </div>
  ),
};

export const Disabled: Story = {
  parameters: {
    docs: {
      description: {
        story: '`disabled` 상태. 포커스·클릭이 차단되며 pressed 상태도 변경되지 않는다.',
      },
    },
  },
  render: () => (
    <Demo disabled defaultPressed>
      Disabled
    </Demo>
  ),
};
