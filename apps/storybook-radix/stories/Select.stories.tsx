import { Select, type SelectSize } from '@gugbab-ui/styled-radix';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Forms/Select',
  component: Select.Root,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
**Select** — 목록에서 단일 항목을 선택하는 드롭다운 컴포넌트. Radix UI Select 기반으로 접근성과 키보드 탐색을 기본 제공한다.

### 컴파운드 구조

| 키                        | 역할                                                                      |
| ------------------------- | ------------------------------------------------------------------------- |
| \`Select.Root\`           | 상태 관리 루트. \`value\`, \`onValueChange\`, \`disabled\` 수신.          |
| \`Select.Trigger\`        | 드롭다운을 여는 버튼. \`size\`, \`disabled\` prop 지원.                   |
| \`Select.Value\`          | 선택된 값 표시 영역. \`placeholder\`로 미선택 시 안내 문구 설정.          |
| \`Select.Portal\`         | Content를 \`document.body\`에 포탈 렌더링하여 z-index 충돌 방지.         |
| \`Select.Content\`        | 드롭다운 패널 래퍼.                                                       |
| \`Select.Viewport\`       | 스크롤 가능한 아이템 목록 영역.                                           |
| \`Select.Item\`           | 개별 선택 항목. \`value\` prop 필수.                                      |
| \`Select.ItemText\`       | 아이템 표시 텍스트. typeahead 검색에 사용된다.                            |

### 키보드 단축키
| 키                      | 동작                              |
| ----------------------- | --------------------------------- |
| \`Space\` / \`Enter\`  | 드롭다운 열기 / 항목 선택         |
| \`↑\` / \`↓\`         | 이전 / 다음 항목으로 이동         |
| \`타이핑\`              | typeahead — 첫 글자로 항목 탐색   |
| \`Escape\`              | 드롭다운 닫기                     |
        `.trim(),
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj;

const FRUITS = ['Apple', 'Banana', 'Cherry', 'Durian', 'Elderberry'];

interface DemoProps {
  size?: SelectSize;
  placeholder?: string;
  disabled?: boolean;
}

function Demo({ size, placeholder = '과일을 선택하세요…', disabled }: DemoProps) {
  return (
    <Select.Root>
      <Select.Trigger size={size} disabled={disabled} style={{ width: 220 }}>
        <Select.Value placeholder={placeholder} />
      </Select.Trigger>
      <Select.Portal>
        <Select.Content>
          <Select.Viewport>
            {FRUITS.map((fruit) => (
              <Select.Item key={fruit} value={fruit.toLowerCase()}>
                <Select.ItemText>{fruit}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '기본 Select. Trigger를 클릭하거나 Space/Enter로 드롭다운을 열어 항목을 선택할 수 있다.',
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
          '`size` prop으로 `sm` / `md` 두 단계 크기를 선택. Trigger의 높이와 폰트 크기가 변경된다.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Demo size="sm" placeholder="Small" />
      <Demo size="md" placeholder="Medium" />
    </div>
  ),
};

export const Placeholder: Story = {
  parameters: {
    docs: {
      description: {
        story: '`placeholder` prop으로 미선택 상태의 안내 문구를 커스터마이즈한 예시.',
      },
    },
  },
  render: () => <Demo placeholder="즐겨 먹는 과일을 골라보세요…" />,
};

export const Disabled: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`disabled` prop으로 Trigger를 비활성화. 클릭과 키보드 조작이 차단되며 시각적으로 구분된다.',
      },
    },
  },
  render: () => <Demo disabled placeholder="선택 불가" />,
};
