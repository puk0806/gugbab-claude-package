import { HoverCard } from '@gugbab/styled-radix';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Overlays/HoverCard',
  component: HoverCard.Root,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
**HoverCard** — 링크나 요소 위에 마우스를 올렸을 때 부가 정보를 보여주는 비모달 카드. 즉시 반응하지 않고 지연(delay) 후 열려 실수로 열리는 것을 방지한다.

### 컴파운드 구조

| 키                    | 역할                                                                      |
| --------------------- | ------------------------------------------------------------------------- |
| \`HoverCard.Root\`    | 상태 컨텍스트 루트. \`openDelay\` / \`closeDelay\`로 지연 시간 조정.     |
| \`HoverCard.Trigger\` | hover / focus 시 카드를 여는 요소. 일반적으로 \`<a>\` 태그.              |
| \`HoverCard.Portal\`  | \`document.body\`에 포탈 렌더링.                                          |
| \`HoverCard.Content\` | 카드 본체. \`side\` / \`align\` / \`sideOffset\` 위치 조정 prop 사용 가능.|

### 접근성 · 키보드

- 마우스 hover 외에 **Tab 포커스**로도 카드가 열림 (키보드 사용자 지원)
- 포커스를 잃거나 마우스가 벗어나면 \`closeDelay\` 후 자동 닫힘
- 카드 안으로 마우스를 이동해도 닫히지 않음 (\`disableHoverableContent\` prop으로 비활성화 가능)

### 주요 prop

| prop               | 위치                  | 기본값  | 설명                           |
| ------------------ | --------------------- | ------- | ------------------------------ |
| \`openDelay\`      | \`HoverCard.Root\`    | \`700\` | 카드 열림 지연 시간(ms)        |
| \`closeDelay\`     | \`HoverCard.Root\`    | \`300\` | 카드 닫힘 지연 시간(ms)        |
        `.trim(),
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj;

interface DemoProps {
  openDelay?: number;
  closeDelay?: number;
}

function Demo({ openDelay, closeDelay }: DemoProps) {
  return (
    <HoverCard.Root openDelay={openDelay} closeDelay={closeDelay}>
      <HoverCard.Trigger
        href="https://github.com/gugbab-ui"
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: '#1976d2', textDecoration: 'underline', cursor: 'pointer' }}
      >
        @gugbab
      </HoverCard.Trigger>
      <HoverCard.Portal>
        <HoverCard.Content style={{ padding: 16, minWidth: 240 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: '#1976d2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 700,
                fontSize: 18,
              }}
            >
              G
            </div>
            <div>
              <div style={{ fontWeight: 600 }}>Gugbab UI</div>
              <div style={{ fontSize: 12, color: '#666' }}>@gugbab</div>
            </div>
          </div>
          <p style={{ margin: 0, fontSize: 13, color: '#444', lineHeight: 1.5 }}>
            Headless, accessible, framework-agnostic UI component library built with React.
          </p>
          <div style={{ display: 'flex', gap: 16, marginTop: 10, fontSize: 12, color: '#888' }}>
            <span>
              <strong>128</strong> following
            </span>
            <span>
              <strong>4.2k</strong> followers
            </span>
          </div>
        </HoverCard.Content>
      </HoverCard.Portal>
    </HoverCard.Root>
  );
}

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: '기본 HoverCard. 링크에 마우스를 올리면 기본 지연 후 프로필 카드가 나타난다.',
      },
    },
  },
  render: () => <Demo />,
};

export const Delayed: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`openDelay={700}` / `closeDelay={400}` 설정. 빠른 마우스 이동 시 불필요한 카드 열림을 억제.',
      },
    },
  },
  render: () => <Demo openDelay={700} closeDelay={400} />,
};
