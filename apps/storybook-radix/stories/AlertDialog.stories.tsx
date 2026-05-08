import { AlertDialog, type AlertDialogActionVariant } from '@gugbab/styled-radix';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Overlays/AlertDialog',
  component: AlertDialog.Root,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
**AlertDialog** — 삭제·초기화 등 파괴적이거나 되돌릴 수 없는 액션을 실행하기 전 명시적 사용자 확인을 받는 모달. 일반 Dialog와 달리 \`role="alertdialog"\`가 지정되어 스크린 리더가 즉시 읽는다.

### 컴파운드 구조

| 키                        | 역할                                                                 |
| ------------------------- | -------------------------------------------------------------------- |
| \`AlertDialog.Root\`      | 상태 컨텍스트 루트.                                                  |
| \`AlertDialog.Trigger\`   | 클릭 시 AlertDialog를 여는 버튼.                                     |
| \`AlertDialog.Portal\`    | \`document.body\`에 포탈 렌더링.                                     |
| \`AlertDialog.Overlay\`   | 배경 딤 오버레이. **클릭해도 닫히지 않음** (의도적 UX).              |
| \`AlertDialog.Content\`   | AlertDialog 본체. \`size\`로 너비 조절.                              |
| \`AlertDialog.Title\`     | 제목. \`aria-labelledby\` 자동 연결.                                 |
| \`AlertDialog.Description\`| 부가 설명. \`aria-describedby\` 자동 연결.                          |
| \`AlertDialog.Cancel\`    | 취소 버튼. 기본 포커스 위치 — 실수 방지.                             |
| \`AlertDialog.Action\`    | 확인 버튼. \`variant\`로 \`accent\` / \`danger\` 스타일 선택.       |

### 접근성 · 키보드

- **Escape**로 닫힘 (Cancel과 동일 효과)
- 열릴 때 **Cancel 버튼**에 기본 포커스 — 실수로 위험 액션 실행 방지
- 닫힐 때 트리거 버튼으로 포커스 복귀
- 오버레이 클릭으로는 닫히지 않음 (사용자가 명시적으로 선택해야 함)

### 주요 prop

| prop        | 위치                    | 설명                                 |
| ----------- | ----------------------- | ------------------------------------ |
| \`variant\` | \`AlertDialog.Action\`  | \`'accent'\`(기본) / \`'danger'\`    |
| \`size\`    | \`AlertDialog.Content\` | 다이얼로그 너비 단계                 |
        `.trim(),
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj;

interface DemoProps {
  actionVariant?: AlertDialogActionVariant;
  triggerLabel?: string;
  title?: string;
  description?: string;
  actionLabel?: string;
}

function Demo({
  actionVariant = 'accent',
  triggerLabel = '확인 다이얼로그 열기',
  title = '작업 확인',
  description = '이 작업은 즉시 적용됩니다. 계속 진행하시겠습니까?',
  actionLabel = '확인',
}: DemoProps) {
  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger>{triggerLabel}</AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay />
        <AlertDialog.Content>
          <AlertDialog.Title>{title}</AlertDialog.Title>
          <AlertDialog.Description>{description}</AlertDialog.Description>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
            <AlertDialog.Cancel>취소</AlertDialog.Cancel>
            <AlertDialog.Action variant={actionVariant}>{actionLabel}</AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: '기본 AlertDialog. `accent` variant Action 버튼, 취소 버튼에 기본 포커스.',
      },
    },
  },
  render: () => <Demo />,
};

export const Destructive: Story = {
  parameters: {
    docs: {
      description: {
        story: '`variant="danger"` Action으로 위험 액션 강조. 계정 삭제 등 복구 불가 작업에 사용.',
      },
    },
  },
  render: () => (
    <Demo
      actionVariant="danger"
      triggerLabel="계정 삭제"
      title="계정을 삭제하시겠습니까?"
      description="계정과 관련된 모든 데이터가 영구적으로 삭제됩니다. 이 작업은 되돌릴 수 없습니다."
      actionLabel="삭제"
    />
  ),
};
