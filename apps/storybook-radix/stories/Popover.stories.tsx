import { Popover } from '@gugbab-ui/styled-radix';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Overlays/Popover',
  component: Popover.Root,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
**Popover** — 트리거 요소 근처에 부유하는 비모달 패널. 폼·설정·추가 정보 등을 인라인으로 제공할 때 사용한다. Floating UI 기반으로 화면 경계를 벗어나면 자동으로 위치를 조정한다.

### 컴파운드 구조

| 키                 | 역할                                                                      |
| ------------------ | ------------------------------------------------------------------------- |
| \`Popover.Root\`   | 상태 컨텍스트 루트. \`open\` / \`onOpenChange\`로 제어 가능.              |
| \`Popover.Trigger\`| 클릭 시 Popover를 여는 버튼.                                              |
| \`Popover.Anchor\` | 트리거와 다른 위치에 Popover를 정박할 때 사용 (선택).                     |
| \`Popover.Portal\` | \`document.body\`에 포탈 렌더링.                                          |
| \`Popover.Content\`| Popover 본체. \`side\` / \`align\` / \`sideOffset\` prop으로 위치 세밀 조정. |
| \`Popover.Close\`  | 클릭 시 Popover를 닫는 버튼.                                              |

### 접근성 · 키보드

- **Escape** 키로 닫히며 트리거로 포커스 복귀
- 콘텐츠 외부 클릭(outside click)으로 자동 닫힘
- \`Popover.Content\`에 포커스 트랩 없음 — 비모달 패턴

### 주요 prop

| prop          | 위치               | 설명                              |
| ------------- | ------------------ | --------------------------------- |
| \`side\`      | \`Popover.Content\`| \`top\`/\`right\`/\`bottom\`/\`left\` |
| \`align\`     | \`Popover.Content\`| \`start\`/\`center\`/\`end\`     |
| \`sideOffset\`| \`Popover.Content\`| 트리거와의 픽셀 간격              |
        `.trim(),
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj;

interface DemoProps {
  useAnchor?: boolean;
}

function Demo({ useAnchor = false }: DemoProps) {
  return (
    <Popover.Root>
      {useAnchor ? (
        <Popover.Anchor
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            border: '2px dashed #aaa',
            padding: '8px 12px',
            borderRadius: 4,
          }}
        >
          <span>앵커 요소</span>
          <Popover.Trigger>열기</Popover.Trigger>
        </Popover.Anchor>
      ) : (
        <Popover.Trigger>Popover 열기</Popover.Trigger>
      )}
      <Popover.Portal>
        <Popover.Content style={{ padding: 16, minWidth: 220 }}>
          <div style={{ marginBottom: 12, fontWeight: 600 }}>설정</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13 }}>
              이름
              <input
                type="text"
                defaultValue="Gugbab UI"
                style={{ padding: '4px 8px', border: '1px solid #ccc', borderRadius: 4 }}
              />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13 }}>
              이메일
              <input
                type="email"
                defaultValue="hello@example.com"
                style={{ padding: '4px 8px', border: '1px solid #ccc', borderRadius: 4 }}
              />
            </label>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
            <Popover.Close>저장 후 닫기</Popover.Close>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '기본 Popover. 트리거 버튼 클릭 시 폼 패널이 부유하여 나타나고, 외부 클릭 또는 Escape로 닫힌다.',
      },
    },
  },
  render: () => <Demo />,
};

export const WithAnchor: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`Popover.Anchor`로 Popover 위치 기준점을 트리거와 분리. 커스텀 인풋·컨테이너 기준 정박에 유용.',
      },
    },
  },
  render: () => <Demo useAnchor />,
};
