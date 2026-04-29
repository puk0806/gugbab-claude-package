import { OneTimePasswordField } from '@gugbab-ui/styled-radix';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Forms/OneTimePasswordField',
  component: OneTimePasswordField.Root,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
**OneTimePasswordField** — SMS·이메일 인증 코드 입력에 최적화된 OTP 필드 컴포넌트. 각 자리에 개별 Input을 배치하며, 입력 시 자동으로 다음 칸으로 포커스가 이동한다.

### 컴파운드 구조

| 키                                 | 역할                                                                                  |
| ---------------------------------- | ------------------------------------------------------------------------------------- |
| \`OneTimePasswordField.Root\`      | 루트 컨테이너. \`maxLength\`(자릿수), \`type\`(\`'numeric'\`|\`'alphanumeric'\`), \`disabled\` 수신. |
| \`OneTimePasswordField.Input\`     | 단일 자리 입력 칸. \`maxLength\` 개수만큼 반복 렌더링한다.                            |
| \`OneTimePasswordField.HiddenInput\` | 폼 제출용 숨김 \`<input>\`. \`name\` prop으로 폼 데이터 키를 지정한다.               |

### 사용 가이드
- \`Root\`에 \`aria-label="인증 코드 입력"\`을 추가해 스크린리더에 목적을 전달한다.
- \`HiddenInput\`의 \`name\` prop은 폼 제출 시 전체 OTP 값을 단일 필드로 수집하는 데 사용된다.
- \`Input\`을 배열 인덱스로 렌더링할 때 슬롯 위치가 고정 identity이므로 index key가 허용된다.
- 붙여넣기 시 자동으로 각 슬롯에 분배된다.
        `.trim(),
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj;

interface DemoProps {
  length?: number;
  disabled?: boolean;
  type?: 'numeric' | 'alphanumeric';
}

function Demo({ length = 6, disabled, type }: DemoProps) {
  return (
    <OneTimePasswordField.Root
      maxLength={length}
      type={type}
      disabled={disabled}
      style={{ display: 'flex', gap: 8 }}
      aria-label="인증 코드 입력"
    >
      {Array.from({ length }, (_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length OTP slots, position is identity
        <OneTimePasswordField.Input key={i} style={{ width: 40, textAlign: 'center' }} />
      ))}
      <OneTimePasswordField.HiddenInput name="otp" />
    </OneTimePasswordField.Root>
  );
}

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '6자리 숫자 OTP 기본 상태. 첫 번째 칸에 포커스 후 입력하면 자동으로 다음 칸으로 이동한다.',
      },
    },
  },
  render: () => <Demo />,
};

export const FourDigit: Story = {
  parameters: {
    docs: {
      description: {
        story: '`maxLength={4}`로 4자리 PIN 코드 입력에 적합한 짧은 OTP 레이아웃.',
      },
    },
  },
  render: () => <Demo length={4} />,
};

export const Alphanumeric: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`type="alphanumeric"`으로 숫자 + 영문자 입력을 허용하는 모드. 이메일 인증 코드 등에 활용한다.',
      },
    },
  },
  render: () => <Demo type="alphanumeric" />,
};

export const Disabled: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`disabled` prop으로 모든 슬롯 입력을 차단한 상태. 인증 요청 처리 중 UI 잠금 등에 사용한다.',
      },
    },
  },
  render: () => <Demo disabled />,
};
