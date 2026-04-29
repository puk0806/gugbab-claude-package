import { Combobox, type ComboboxSize } from '@gugbab-ui/styled-radix';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Forms/Combobox',
  component: Combobox.Root,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
**Combobox** — 텍스트 입력과 드롭다운 목록을 결합한 자동완성 컴포넌트. 사용자가 직접 타이핑하거나 버튼으로 목록을 열어 항목을 선택할 수 있다.

### 컴파운드 구조

| 키                     | 역할                                                                      |
| ---------------------- | ------------------------------------------------------------------------- |
| \`Combobox.Root\`      | 상태 관리 루트. \`value\`, \`onValueChange\` 등 제어 prop 수신.           |
| \`Combobox.Anchor\`    | Input과 Trigger를 묶는 포지셔닝 앵커. Content의 기준 위치가 된다.        |
| \`Combobox.Input\`     | 텍스트 입력 필드. \`size\`, \`placeholder\`, \`disabled\` 지원.           |
| \`Combobox.Trigger\`   | 드롭다운 토글 버튼. Input 우측에 배치한다.                                |
| \`Combobox.Portal\`    | Content를 \`document.body\`에 포탈 렌더링하여 z-index 충돌 방지.         |
| \`Combobox.Content\`   | 드롭다운 목록 패널.                                                       |
| \`Combobox.Item\`      | 개별 선택 항목. \`value\` prop 필수.                                      |

### 사용 가이드
- Input에서 타이핑하면 외부 상태로 목록을 필터링하고, 필터된 항목만 \`Combobox.Item\`으로 렌더링한다.
- \`Combobox.Anchor\`에 \`display: flex\`를 적용해 Input과 Trigger를 나란히 배치한다.
- 접근성: Input에 \`aria-label\` 또는 연결된 \`<label>\`을 제공한다.
        `.trim(),
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj;

const FRAMEWORKS = [
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue' },
  { value: 'angular', label: 'Angular' },
  { value: 'svelte', label: 'Svelte' },
  { value: 'solid', label: 'Solid' },
];

interface DemoProps {
  size?: ComboboxSize;
  disabled?: boolean;
}

function Demo({ size, disabled }: DemoProps) {
  return (
    <Combobox.Root>
      <Combobox.Anchor style={{ display: 'flex', width: 220 }}>
        <Combobox.Input
          size={size}
          disabled={disabled}
          placeholder="프레임워크 검색…"
          style={{ flex: 1 }}
        />
        <Combobox.Trigger aria-label="목록 열기" disabled={disabled}>
          ▾
        </Combobox.Trigger>
      </Combobox.Anchor>
      <Combobox.Portal>
        <Combobox.Content style={{ minWidth: 220 }}>
          {FRAMEWORKS.map((fw) => (
            <Combobox.Item key={fw.value} value={fw.value}>
              {fw.label}
            </Combobox.Item>
          ))}
        </Combobox.Content>
      </Combobox.Portal>
    </Combobox.Root>
  );
}

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '기본 Combobox. Input에 타이핑하거나 ▾ 버튼으로 목록을 열어 프레임워크를 선택할 수 있다.',
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
          '`size` prop으로 `sm` / `md` 두 단계 크기 비교. Input 높이와 폰트 크기가 함께 변경된다.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
          '`disabled` prop으로 Input과 Trigger를 동시에 비활성화. 입력과 드롭다운 열기가 모두 차단된다.',
      },
    },
  },
  render: () => <Demo disabled />,
};
