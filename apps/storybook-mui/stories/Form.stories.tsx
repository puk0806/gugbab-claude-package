import { Form, type FormFieldStatus } from '@gugbab/styled-mui';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Forms/Form',
  component: Form.Root,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
**Form** — 접근성과 검증 메시지를 내장한 컴파운드 폼 컴포넌트. 각 \`Field\`는 \`name\`으로 Label·Control·Message를 자동 연결하며, \`status\`로 시각적 상태를 표현한다.

### 컴파운드 구조

| 키                 | 역할                                                                                        |
| ------------------ | ------------------------------------------------------------------------------------------- |
| \`Form.Root\`      | \`<form>\` 래퍼. \`onSubmit\` 핸들러 연결.                                                  |
| \`Form.Field\`     | 하나의 입력 그룹. \`name\` (필수)·\`status\`(\`'default'\`|\`'error'\`|\`'success'\`|\`'warning'\`) prop. |
| \`Form.Label\`     | Field의 \`name\`에 연결된 \`<label>\`. 클릭 시 Control에 포커스 이동.                      |
| \`Form.Control\`   | 실제 \`<input>\`. Field의 \`name\`·\`status\`와 자동 연동.                                  |
| \`Form.Message\`   | 검증 메시지. \`match\` 함수가 \`true\`를 반환하거나 \`forceMatch\`이면 노출.                |
| \`Form.Submit\`    | 제출 버튼. 폼 검증 실패 시 자동 \`disabled\` 처리.                                          |

### 사용 가이드
- \`Form.Message\`의 \`match\` prop은 내장 유효성(valueMissing, typeMismatch 등)을 트리거한다. 커스텀 에러는 \`match={() => true} forceMatch\`로 항상 노출한다.
- \`status="error"\`를 Field에 적용하면 Control 테두리와 Message 색상이 에러 스타일로 전환된다.
        `.trim(),
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj;

interface DemoProps {
  nameStatus?: FormFieldStatus;
  emailStatus?: FormFieldStatus;
  showDescription?: boolean;
}

function Demo({ nameStatus = 'default', emailStatus = 'default', showDescription }: DemoProps) {
  return (
    <Form.Root
      onSubmit={(e) => e.preventDefault()}
      style={{ display: 'flex', flexDirection: 'column', gap: 16, width: 320 }}
    >
      <Form.Field name="name" status={nameStatus}>
        <Form.Label>이름</Form.Label>
        <Form.Control type="text" placeholder="홍길동" />
        {nameStatus === 'error' && (
          <Form.Message match={() => true} forceMatch>
            이름을 입력해주세요.
          </Form.Message>
        )}
        {showDescription && (
          <Form.Message match={() => true} forceMatch>
            신분증에 기재된 실명을 입력하세요.
          </Form.Message>
        )}
      </Form.Field>

      <Form.Field name="email" status={emailStatus}>
        <Form.Label>이메일</Form.Label>
        <Form.Control type="email" placeholder="you@example.com" />
        {emailStatus === 'error' && (
          <Form.Message match={() => true} forceMatch>
            올바른 이메일 주소를 입력해주세요.
          </Form.Message>
        )}
        {showDescription && (
          <Form.Message match={() => true} forceMatch>
            이메일은 외부에 공개되지 않습니다.
          </Form.Message>
        )}
      </Form.Field>

      <Form.Submit>제출</Form.Submit>
    </Form.Root>
  );
}

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '기본 폼. 이름과 이메일 두 필드가 default 상태로 표시되며 제출 버튼이 활성화된 초기 상태.',
      },
    },
  },
  render: () => <Demo />,
};

export const WithErrors: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`status="error"`를 적용한 상태. 각 Field의 테두리가 에러 색상으로 변경되고 검증 메시지가 노출된다.',
      },
    },
  },
  render: () => <Demo nameStatus="error" emailStatus="error" />,
};

export const WithDescription: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`Form.Message`로 입력 도움말을 각 필드 아래에 표시하는 패턴. `forceMatch`로 항상 노출한다.',
      },
    },
  },
  render: () => <Demo showDescription />,
};
