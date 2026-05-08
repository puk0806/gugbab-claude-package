import { Dialog, type DialogSize } from '@gugbab/styled-mui';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Overlays/Dialog',
  component: Dialog.Root,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
**Dialog** — 사용자의 즉각적인 주의와 상호작용이 필요할 때 사용하는 모달 다이얼로그. 열리면 배경에 오버레이가 씌워지고 포커스가 다이얼로그 내부에 갇힌다.

### 컴파운드 구조

| 키                     | 역할                                                                 |
| ---------------------- | -------------------------------------------------------------------- |
| \`Dialog.Root\`        | 상태 컨텍스트 루트. \`open\` / \`onOpenChange\`로 제어 가능.         |
| \`Dialog.Trigger\`     | 클릭 시 다이얼로그를 여는 버튼.                                      |
| \`Dialog.Portal\`      | 다이얼로그를 \`document.body\`에 포탈 렌더링.                        |
| \`Dialog.Overlay\`     | 배경 딤 오버레이. 클릭 시 닫힘.                                      |
| \`Dialog.Content\`     | 다이얼로그 본체. \`size\`로 \`sm\` / \`md\` / \`lg\` / \`xl\` 지정. |
| \`Dialog.Title\`       | 다이얼로그 제목. \`aria-labelledby\` 자동 연결.                      |
| \`Dialog.Description\` | 부가 설명 텍스트. \`aria-describedby\` 자동 연결.                    |
| \`Dialog.Close\`       | 클릭 시 다이얼로그를 닫는 버튼.                                      |

### 접근성 · 키보드

- **Escape** 키로 닫힘
- 열릴 때 \`Dialog.Content\` 안의 첫 번째 포커스 가능 요소로 자동 이동
- 닫힐 때 트리거 버튼으로 포커스 복귀
- 내부에서 Tab / Shift+Tab 순환 (포커스 트랩)
- 배경 스크롤 자동 잠금

### 주요 prop

| prop            | 위치              | 설명                             |
| --------------- | ----------------- | -------------------------------- |
| \`open\`        | \`Dialog.Root\`   | 제어 모드 열림 상태              |
| \`onOpenChange\`| \`Dialog.Root\`   | 열림/닫힘 변경 콜백              |
| \`size\`        | \`Dialog.Content\`| 다이얼로그 너비 단계             |
        `.trim(),
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj;

interface DemoProps {
  size?: DialogSize;
  withDescription?: boolean;
}

function Demo({ size, withDescription = true }: DemoProps) {
  return (
    <Dialog.Root>
      <Dialog.Trigger>다이얼로그 열기{size ? ` (${size})` : ''}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay />
        <Dialog.Content size={size}>
          <Dialog.Title>변경 사항 저장</Dialog.Title>
          {withDescription && (
            <Dialog.Description>
              변경 사항을 저장하시겠습니까? 이 작업은 즉시 적용되며 되돌릴 수 없습니다.
            </Dialog.Description>
          )}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
            <Dialog.Close>취소</Dialog.Close>
            <Dialog.Close>저장</Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: '기본 다이얼로그. `md` 사이즈, 제목·설명·닫기 버튼을 포함한 표준 구성.',
      },
    },
  },
  render: () => <Demo />,
};

export const Sizes: Story = {
  parameters: {
    docs: {
      description: {
        story: '`size` prop으로 4단계(sm / md / lg / xl) 너비 조절. 각 버튼을 눌러 비교 가능.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      {(['sm', 'md', 'lg', 'xl'] as const).map((s) => (
        <Demo key={s} size={s} />
      ))}
    </div>
  ),
};

export const WithoutDescription: Story = {
  parameters: {
    docs: {
      description: {
        story: '`Dialog.Description` 없이 제목만 사용하는 간결한 케이스. `aria-describedby` 생략.',
      },
    },
  },
  render: () => <Demo withDescription={false} />,
};
