import { Toast } from '@gugbab-ui/styled-mui';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

const meta = {
  title: 'Navigation/Toast',
  component: Toast.Root,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
**Toast** — 사용자 동작의 결과나 시스템 알림을 비침습적으로 전달하는 알림 스낵바 컴포넌트. 일정 시간 후 자동으로 사라지며, 닫기 버튼이나 액션 버튼을 포함할 수 있다.

### 컴파운드 구조

| 키                    | 역할                                                                              |
| --------------------- | --------------------------------------------------------------------------------- |
| \`Toast.Provider\`    | 컨텍스트 공급자. **트리 최상단에 반드시 배치.** \`duration\`(ms) 기본값 설정.    |
| \`Toast.Viewport\`    | 토스트가 렌더링될 위치. 보통 화면 하단/우측 고정. \`Provider\` 아래에 위치한다.  |
| \`Toast.Root\`        | 개별 토스트 컨테이너. \`open\`·\`onOpenChange\` 로 표시 상태 제어.               |
| \`Toast.Title\`       | 토스트 제목 텍스트.                                                               |
| \`Toast.Description\` | 부가 설명 텍스트.                                                                 |
| \`Toast.Action\`      | 실행 취소 등 보조 동작 버튼. \`altText\` prop(스크린 리더용 대체 텍스트) 필수.   |
| \`Toast.Close\`       | 토스트를 즉시 닫는 버튼.                                                          |

### 사용 패턴

\`\`\`tsx
// Provider + Viewport는 레이아웃 루트에 한 번만 배치
<Toast.Provider duration={4000}>
  <App />
  <Toast.Viewport />
</Toast.Provider>

// 각 토스트는 open 상태로 트리거
<Toast.Root open={open} onOpenChange={setOpen}>
  <Toast.Title>저장됨</Toast.Title>
  <Toast.Close>✕</Toast.Close>
</Toast.Root>
\`\`\`

### 주요 prop

- \`duration\` — 자동 닫힘 시간(ms). Provider와 Root 양쪽에서 지정 가능, Root가 우선.
- \`altText\` — \`Toast.Action\` 필수 prop. 키보드 사용자가 다른 수단으로 같은 동작을 할 수 있는 방법 설명.
        `.trim(),
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj;

function SimpleDemo({ withAction = false }: { withAction?: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <Toast.Provider duration={4000}>
      <button type="button" onClick={() => setOpen(true)}>
        Show toast
      </button>

      <Toast.Root open={open} onOpenChange={setOpen}>
        <Toast.Title>Scheduled</Toast.Title>
        <Toast.Description>
          Your meeting has been scheduled for tomorrow at 10 AM.
        </Toast.Description>
        {withAction && <Toast.Action altText="Undo schedule action">Undo</Toast.Action>}
        <Toast.Close>✕</Toast.Close>
      </Toast.Root>

      <Toast.Viewport />
    </Toast.Provider>
  );
}

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '버튼 클릭 시 토스트가 나타나고 4초 후 자동으로 사라진다. 닫기 버튼으로 즉시 해제도 가능하다.',
      },
    },
  },
  render: () => <SimpleDemo />,
};

export const WithAction: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`Toast.Action`을 추가한 케이스. Undo처럼 직전 동작을 되돌릴 수 있는 버튼을 토스트 내부에 배치한다. `altText`는 스크린 리더 전용 대체 텍스트로, 키보드·스크린 리더 사용자에게 동일한 동작에 도달할 다른 경로를 안내한다.',
      },
    },
  },
  render: () => <SimpleDemo withAction />,
};

export const MultipleToasts: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '버튼 클릭마다 토스트를 큐에 추가. `Viewport`가 스택을 관리하며 닫히면 목록에서 제거된다.',
      },
    },
  },
  render: () => {
    const [toasts, setToasts] = useState<Array<{ id: number; message: string }>>([]);

    const addToast = () => {
      setToasts((prev) => [
        ...prev,
        { id: Date.now(), message: `Notification #${prev.length + 1}` },
      ]);
    };

    return (
      <Toast.Provider duration={4000}>
        <button type="button" onClick={addToast}>
          Add toast
        </button>

        {toasts.map((t) => (
          <Toast.Root
            key={t.id}
            open
            onOpenChange={(o) => {
              if (!o) setToasts((prev) => prev.filter((x) => x.id !== t.id));
            }}
          >
            <Toast.Title>{t.message}</Toast.Title>
            <Toast.Close>✕</Toast.Close>
          </Toast.Root>
        ))}

        <Toast.Viewport />
      </Toast.Provider>
    );
  },
};
