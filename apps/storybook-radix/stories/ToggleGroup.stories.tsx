import {
  ToggleGroup,
  type ToggleGroupSize,
  type ToggleGroupVariant,
} from '@gugbab-ui/styled-radix';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Stateful/ToggleGroup',
  component: ToggleGroup.Root,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
**ToggleGroup** — 여러 버튼을 묶어 단일 선택(\`single\`) 또는 다중 선택(\`multiple\`) 토글 동작을 제공하는 컴포넌트. 텍스트 서식 툴바나 필터 버튼 그룹에 적합하다.

### 컴파운드 구조

| 키                   | 역할                                                                              |
| -------------------- | --------------------------------------------------------------------------------- |
| \`ToggleGroup.Root\` | 그룹 컨테이너. \`type\`(필수) / \`variant\` / \`size\` / \`value\` / \`onValueChange\` 처리. |
| \`ToggleGroup.Item\` | 개별 토글 버튼. \`value\` prop 필수. 선택 시 \`aria-pressed\` 상태 반영.          |

### 주요 prop

- \`type\`: \`'single'\` — 하나만 선택, \`'multiple'\` — 여러 개 동시 선택.
- \`variant\`: \`'default'\` | \`'outline'\` (기본값 \`'default'\`).
- \`size\`: \`'sm'\` | \`'md'\` (기본값 \`'md'\`).
- 키보드: **Tab** 으로 그룹 진입 후 **Arrow** 키로 항목 이동, **Space / Enter** 로 토글.
        `.trim(),
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj;

interface DemoProps {
  size?: ToggleGroupSize;
  variant?: ToggleGroupVariant;
  type: 'single' | 'multiple';
}

function Demo({ size, variant, type }: DemoProps) {
  const items = ['Bold', 'Italic', 'Underline'] as const;
  return (
    <ToggleGroup.Root type={type} size={size} variant={variant} aria-label="text formatting">
      {items.map((label) => (
        <ToggleGroup.Item key={label} value={label.toLowerCase()} aria-label={label}>
          {label}
        </ToggleGroup.Item>
      ))}
    </ToggleGroup.Root>
  );
}

export const Single: Story = {
  parameters: {
    docs: {
      description: {
        story: '`type="single"` — 항목 중 하나만 활성화. 이미 선택된 항목 재클릭 시 선택 해제된다.',
      },
    },
  },
  render: () => <Demo type="single" />,
};

export const Multiple: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`type="multiple"` — 여러 항목을 동시에 활성화 가능. Bold + Italic 동시 선택 같은 텍스트 서식에 적합.',
      },
    },
  },
  render: () => <Demo type="multiple" />,
};

export const Variants: Story = {
  parameters: {
    docs: {
      description: {
        story: '`variant` 비교. `default`(채움 배경)와 `outline`(테두리 강조) 두 가지 스타일.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Demo type="single" variant="default" />
      <Demo type="single" variant="outline" />
    </div>
  ),
};

export const Sizes: Story = {
  parameters: {
    docs: {
      description: {
        story: '`size` 비교. `sm` / `md` 두 단계. 버튼 높이와 패딩이 토큰 기반으로 조정된다.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Demo type="single" size="sm" />
      <Demo type="single" size="md" />
    </div>
  ),
};
