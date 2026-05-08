import { Collapsible } from '@gugbab/styled-mui';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Stateful/Collapsible',
  component: Collapsible.Root,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
**Collapsible** — 단일 섹션을 펼치고 접는 컴포넌트. 트리거 버튼을 클릭하면 콘텐츠가 토글되며, WAI-ARIA \`button\` + \`region\` 패턴을 준수한다.

### 컴파운드 구조

| 키                      | 역할                                                                                    |
| ----------------------- | --------------------------------------------------------------------------------------- |
| \`Collapsible.Root\`    | 루트 컨테이너. \`defaultOpen\` / \`open\` / \`onOpenChange\` / \`disabled\` 처리.       |
| \`Collapsible.Trigger\` | 펼치기/접기 버튼. \`aria-expanded\` 상태 자동 반영. \`<button>\` 렌더.                  |
| \`Collapsible.Content\` | 토글 대상 콘텐츠 영역. 접혔을 때 DOM에서 숨김 처리되어 스크린 리더에 노출되지 않는다.   |

### 사용 가이드

- 여러 패널을 독립적으로 열고 싶다면 \`Collapsible\`을 반복 배치한다. 연동된 단일·다중 패널이 필요하면 \`Accordion\`을 사용한다.
- \`disabled=true\` 시 트리거가 비활성화되어 키보드·마우스 모두 반응하지 않는다.
- 키보드: **Space / Enter** 로 트리거 활성화.
        `.trim(),
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj;

interface DemoProps {
  defaultOpen?: boolean;
  disabled?: boolean;
}

function Demo({ defaultOpen = false, disabled }: DemoProps) {
  return (
    <Collapsible.Root defaultOpen={defaultOpen} disabled={disabled} style={{ width: 320 }}>
      <Collapsible.Trigger style={{ width: '100%', textAlign: 'left' }}>
        Toggle section
      </Collapsible.Trigger>
      <Collapsible.Content>
        <p style={{ margin: '8px 0 0' }}>
          This content is revealed when the trigger is activated. It can contain any content you
          need.
        </p>
      </Collapsible.Content>
    </Collapsible.Root>
  );
}

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`defaultOpen=false` 초기 상태. 트리거 클릭 또는 Space / Enter 키로 콘텐츠를 펼친다.',
      },
    },
  },
  render: () => <Demo />,
};

export const DefaultOpen: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`defaultOpen=true` — 처음부터 콘텐츠가 펼쳐진 상태로 렌더된다. 초기 노출이 필요한 FAQ 섹션에 적합.',
      },
    },
  },
  render: () => <Demo defaultOpen />,
};

export const Disabled: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`disabled=true` — 트리거가 비활성화되어 열림 상태가 고정된다. 접근성상 `aria-disabled` 가 함께 반영된다.',
      },
    },
  },
  render: () => <Demo defaultOpen disabled />,
};
