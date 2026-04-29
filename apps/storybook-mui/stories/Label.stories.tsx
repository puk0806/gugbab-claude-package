import { Label } from '@gugbab-ui/styled-mui';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Primitives/Label',
  component: Label,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
**Label** — HTML \`<label>\` 래퍼 컴포넌트. \`htmlFor\`로 폼 컨트롤과 연결하면 클릭 시 해당 input에 포커스가 이동한다.

### 구조

단일 컴포넌트 (컴파운드 없음). 내부적으로 \`@gugbab-ui/headless\`의 \`Label\` 헤드리스 컴포넌트를 래핑한다.

| Prop | 타입 | 설명 |
| ---- | ---- | ---- |
| \`htmlFor\` | \`string\` | 연결할 input의 \`id\` 값 |
| \`children\` | \`ReactNode\` | 라벨 텍스트·아이콘 |

### 사용 가이드
- \`htmlFor\`와 input의 \`id\`를 반드시 일치시켜야 클릭 연결과 스크린 리더 연결이 동시에 작동한다.
- disabled input과 쌍을 이룰 때는 라벨에도 시각적으로 비활성 스타일(opacity, cursor)을 적용한다.
- 아이콘만 있는 input에는 \`VisuallyHidden\` 안에 \`Label\`을 넣어 접근성을 유지한다.
        `.trim(),
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '텍스트만 있는 기본 라벨. 단독으로도 스타일이 적용되며 연결된 input 없이도 표시된다.',
      },
    },
  },
  render: () => <Label>First name</Label>,
};

export const WithInput: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`htmlFor`로 input과 연결. 라벨 클릭 시 input이 포커스를 받고 스크린 리더도 연결 관계를 인식한다.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Label htmlFor="demo-input">Email address</Label>
      <input id="demo-input" type="email" placeholder="you@example.com" />
    </div>
  ),
};

export const Disabled: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'disabled input과 쌍을 이루는 라벨. opacity와 cursor를 통해 상태를 시각적으로 전달한다.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <input id="demo-disabled" type="checkbox" disabled />
      <Label htmlFor="demo-disabled" style={{ opacity: 0.5, cursor: 'not-allowed' }}>
        Accept terms (disabled)
      </Label>
    </div>
  ),
};
