import { Tooltip } from '@gugbab-ui/styled-radix';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Overlays/Tooltip',
  component: Tooltip.Root,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
**Tooltip** — 버튼·아이콘 등 UI 요소에 짧은 안내 텍스트를 보여주는 비모달 툴팁. 반드시 \`Tooltip.Provider\`로 감싸야 한다.

### 컴파운드 구조

| 키                  | 역할                                                                           |
| ------------------- | ------------------------------------------------------------------------------ |
| \`Tooltip.Provider\`| **필수** 루트 래퍼. \`delayDuration\` / \`skipDelayDuration\`을 전역 설정.     |
| \`Tooltip.Root\`    | 개별 툴팁의 상태 컨텍스트. \`delayDuration\`으로 개별 지연 시간 오버라이드.    |
| \`Tooltip.Trigger\` | hover / focus 시 툴팁을 여는 요소.                                             |
| \`Tooltip.Portal\`  | \`document.body\`에 포탈 렌더링.                                               |
| \`Tooltip.Content\` | 툴팁 텍스트 본체. \`side\` / \`align\` / \`sideOffset\` 위치 조정 가능.       |

### 접근성 · 키보드

- **Tab 포커스**로도 툴팁 열림 (키보드 사용자 지원)
- **Escape** 키로 즉시 닫힘
- \`Tooltip.Trigger\`의 자식이 \`<button>\`이 아닐 경우 \`asChild\`로 포커스 가능 요소로 교체 권장
- 툴팁 텍스트는 트리거의 \`aria-describedby\`에 자동 연결
- \`disabled\` 버튼 자체는 hover/focus 이벤트가 발생하지 않는다. \`<span>\`으로 감싼 뒤 \`asChild\`와 함께 쓰면 비활성 버튼에도 안내가 노출된다.

### 주요 prop

| prop                      | 위치                | 기본값  | 설명                                      |
| ------------------------- | ------------------- | ------- | ----------------------------------------- |
| \`delayDuration\`         | \`Provider\` / \`Root\` | \`700\` | 툴팁 열림 지연(ms). Root가 우선 적용.   |
| \`skipDelayDuration\`     | \`Provider\`        | \`300\` | 연속 hover 시 지연 생략 시간(ms)          |
| \`disableHoverableContent\`| \`Provider\`       | \`false\`| 툴팁 콘텐츠 위에 마우스 이동 시 닫힘 여부|
        `.trim(),
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj;

interface DemoProps {
  delayDuration?: number;
  label?: string;
  triggerLabel?: string;
}

function Demo({
  delayDuration,
  label = '도움말 툴팁 텍스트',
  triggerLabel = '마우스를 올려보세요',
}: DemoProps) {
  return (
    <Tooltip.Provider>
      <Tooltip.Root delayDuration={delayDuration}>
        <Tooltip.Trigger>{triggerLabel}</Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content>{label}</Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: '기본 Tooltip. 트리거에 마우스를 올리거나 Tab 포커스 시 안내 텍스트가 나타난다.',
      },
    },
  },
  render: () => <Demo />,
};

export const DelayedOpen: Story = {
  parameters: {
    docs: {
      description: {
        story: '`delayDuration={800}` 적용. 빠른 마우스 이동 시 불필요한 툴팁 노출을 방지.',
      },
    },
  },
  render: () => (
    <Demo delayDuration={800} triggerLabel="800ms 지연 툴팁" label="800ms 후에 열립니다" />
  ),
};

export const MultipleTooltips: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '하나의 `Tooltip.Provider` 아래 여러 Tooltip. Provider의 `skipDelayDuration`으로 연속 hover 시 지연 생략.',
      },
    },
  },
  render: () => (
    <Tooltip.Provider>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {[
          { trigger: '저장', tip: '변경 사항 저장 (Ctrl+S)' },
          { trigger: '편집', tip: '항목 편집' },
          { trigger: '삭제', tip: '영구 삭제' },
          { trigger: '공유', tip: '다른 사람과 공유' },
        ].map(({ trigger, tip }) => (
          <Tooltip.Root key={trigger}>
            <Tooltip.Trigger>{trigger}</Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content>{tip}</Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        ))}
      </div>
    </Tooltip.Provider>
  ),
};
