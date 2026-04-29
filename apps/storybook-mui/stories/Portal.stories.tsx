import { Portal } from '@gugbab-ui/styled-mui';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

const meta = {
  title: 'Primitives/Portal',
  component: Portal,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
**Portal** — React 자식 트리를 현재 DOM 위치가 아닌 다른 노드(기본: \`document.body\`)에 렌더링한다. 모달·툴팁·드롭다운의 z-index 충돌 문제를 해결할 때 사용한다.

### 구조

단일 컴포넌트. \`ReactDOM.createPortal\`의 선언적 래퍼이며 별도 스타일링 없이 동작만 제공한다.

| Prop | 타입 | 기본값 | 설명 |
| ---- | ---- | ------ | ---- |
| \`container\` | \`HTMLElement \\| null\` | \`document.body\` | 자식이 마운트될 DOM 노드 |
| \`children\` | \`ReactNode\` | — | 포탈로 내보낼 콘텐츠 |

### 사용 가이드
- \`position: fixed\`로 뷰포트 기준 배치 시 \`Portal\` 없이도 동작하지만, 조상에 \`overflow: hidden\`이나 \`transform\`이 있으면 잘린다 — 그때 Portal로 해결한다.
- \`container\`를 지정하지 않으면 \`document.body\`에 마운트된다.
- 컴포넌트가 언마운트되면 Portal 내용도 자동으로 제거된다.
        `.trim(),
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Portal>;

export default meta;
type Story = StoryObj;

function PortalDemo() {
  const [show, setShow] = useState(false);
  return (
    <div>
      <button type="button" onClick={() => setShow((v) => !v)}>
        {show ? 'Hide portal content' : 'Show portal content'}
      </button>
      {show && (
        <Portal>
          <div
            style={{
              position: 'fixed',
              bottom: 16,
              right: 16,
              padding: '12px 20px',
              background: '#1e1e2e',
              color: '#cdd6f4',
              borderRadius: 8,
              zIndex: 9999,
              boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
            }}
          >
            Rendered via Portal into document.body
          </div>
        </Portal>
      )}
    </div>
  );
}

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '버튼 클릭 시 콘텐츠가 `document.body`에 포탈로 마운트된다. 화면 우하단에 고정 위치로 나타난다.',
      },
    },
  },
  render: () => <PortalDemo />,
};

export const CustomContainer: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`container` prop으로 포탈 대상 노드 지정. 여기서는 `document.body`를 명시해 상단 중앙에 고정 표시한다.',
      },
    },
  },
  render: () => (
    <div
      style={{
        position: 'relative',
        border: '2px dashed currentColor',
        padding: 32,
        width: 400,
        height: 150,
      }}
    >
      <p style={{ margin: 0, fontSize: 12 }}>Parent container (overflow: hidden 시뮬레이션)</p>
      <Portal container={document.body}>
        <div
          style={{
            position: 'fixed',
            top: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '8px 16px',
            background: '#313244',
            color: '#cdd6f4',
            borderRadius: 6,
            zIndex: 9999,
          }}
        >
          Portalled to body — 조상 overflow에 영향 없음
        </div>
      </Portal>
    </div>
  ),
};
