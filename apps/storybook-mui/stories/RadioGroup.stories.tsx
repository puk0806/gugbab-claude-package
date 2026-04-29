import { RadioGroup, type RadioGroupSize } from '@gugbab-ui/styled-mui';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Stateful/RadioGroup',
  component: RadioGroup.Root,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
**RadioGroup** — 하나의 값만 선택 가능한 라디오 버튼 그룹. Radix UI \`RadioGroup\` 헤드리스 위에 MUI 스타일을 입힌 컴파운드 컴포넌트다.

### 컴파운드 구조

| 키                       | 역할                                                                 |
| ------------------------ | -------------------------------------------------------------------- |
| \`RadioGroup.Root\`      | 그룹 컨테이너. \`defaultValue\` / \`value\` / \`onValueChange\` / \`disabled\` / \`size\` 처리. |
| \`RadioGroup.Item\`      | 개별 라디오 버튼. \`value\` prop 필수. \`<button role="radio">\` 렌더. |
| \`RadioGroup.Indicator\` | 선택 상태를 나타내는 내부 원형 인디케이터. \`Item\` 안에 배치.        |

### 사용 가이드

- \`<label htmlFor={id}>\` + \`<RadioGroup.Item id={id}>\` 쌍으로 클릭 영역을 확보한다.
- 키보드: **Arrow Up / Down / Left / Right** 로 항목 이동, **Space** 로 선택.
- 그룹 전체 비활성화는 \`Root\`의 \`disabled\`, 개별 비활성화는 \`Item\`의 \`disabled\`.
- \`size\`: \`sm\` | \`md\` (기본값 \`md\`).
        `.trim(),
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj;

interface DemoProps {
  size?: RadioGroupSize;
  defaultValue?: string;
  disabled?: boolean;
}

function Demo({ size, defaultValue = 'a', disabled }: DemoProps) {
  return (
    <RadioGroup.Root
      size={size}
      defaultValue={defaultValue}
      disabled={disabled}
      aria-label="example"
    >
      {(['a', 'b', 'c'] as const).map((v) => {
        const id = `radio-${v}`;
        return (
          <div key={v} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <RadioGroup.Item id={id} value={v}>
              <RadioGroup.Indicator />
            </RadioGroup.Item>
            <label htmlFor={id}>Option {v.toUpperCase()}</label>
          </div>
        );
      })}
    </RadioGroup.Root>
  );
}

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`defaultValue="a"`로 첫 번째 항목이 미리 선택된 기본 상태. Arrow 키로 항목 간 이동이 가능하다.',
      },
    },
  },
  render: () => <Demo />,
};

export const Sizes: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`size` prop으로 `sm` / `md` 두 단계 크기 비교. 버튼과 인디케이터 크기가 함께 조정된다.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', gap: 24 }}>
      <Demo size="sm" />
      <Demo size="md" />
    </div>
  ),
};

export const Disabled: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`Root`에 `disabled`를 주면 그룹 전체가 비활성화된다. 선택 값은 유지되지만 변경 불가.',
      },
    },
  },
  render: () => <Demo disabled />,
};
