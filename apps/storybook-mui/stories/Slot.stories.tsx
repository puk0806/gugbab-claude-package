import { Slot } from '@gugbab-ui/styled-mui';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Primitives/Slot',
  component: Slot,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
**Slot** — Radix UI의 \`asChild\` 패턴을 구현하는 핵심 프리미티브. 자신의 props·ref·className을 단일 자식 엘리먼트에 병합(merge)하여 전달한다.

### 구조

단일 컴포넌트. 자식이 반드시 1개여야 하며, 해당 자식의 DOM 엘리먼트에 Slot의 모든 props가 합쳐진다.

| 동작 | 설명 |
| ---- | ---- |
| className 병합 | Slot + 자식 className이 공백으로 합쳐진다 |
| 이벤트 핸들러 체이닝 | 자식 핸들러가 먼저 실행된 뒤 Slot 핸들러가 실행된다 |
| ref 포워딩 | Slot의 ref가 자식의 DOM 노드로 연결된다 |

### 사용 가이드
- 컴포넌트 라이브러리에서 \`asChild\` prop을 구현할 때 \`Slot\`으로 조건 분기한다.
- 자식이 React 엘리먼트가 아닌 경우(문자열, 배열 등) 에러가 발생하므로 단일 엘리먼트만 전달한다.
- 이벤트 핸들러는 자식이 먼저 실행되므로 자식에서 \`e.stopPropagation()\`을 호출하면 Slot 핸들러는 실행되지 않는다.
        `.trim(),
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Slot>;

export default meta;
type Story = StoryObj;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Slot이 자식 button을 그대로 렌더링하면서 Slot의 className을 함께 전달하는 기본 동작.',
      },
    },
  },
  render: () => (
    <Slot className="slot-wrapper">
      <button type="button">Custom child rendered through Slot</button>
    </Slot>
  ),
};

export const ClassMerge: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Slot의 `from-slot` className과 자식의 `from-child` className이 하나의 엘리먼트에 병합된다.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <p style={{ fontSize: 12, margin: 0 }}>
        개발자 도구로 버튼 검사 시 className이 "from-slot from-child"로 합쳐진 것을 확인할 수 있다.
      </p>
      <Slot className="from-slot">
        <button type="button" className="from-child">
          Button (merged classes)
        </button>
      </Slot>
    </div>
  ),
};

export const EventChaining: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '이벤트 핸들러 체이닝. 콘솔을 열면 자식 핸들러 → Slot 핸들러 순으로 실행되는 것을 확인할 수 있다.',
      },
    },
  },
  render: () => (
    <Slot onClick={() => console.log('slot handler fired')}>
      <button type="button" onClick={() => console.log('child handler fired first')}>
        Click — check console for chain order
      </button>
    </Slot>
  ),
};
