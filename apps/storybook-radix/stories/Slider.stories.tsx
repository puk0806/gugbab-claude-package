import { Slider, type SliderSize } from '@gugbab-ui/styled-radix';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Forms/Slider',
  component: Slider.Root,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
**Slider** — 드래그 또는 키보드로 숫자 값을 선택하는 범위 입력 컴포넌트. 단일 thumb와 다중 thumb(범위 선택) 모드를 모두 지원한다.

### 컴파운드 구조

| 키                | 역할                                                                 |
| ----------------- | -------------------------------------------------------------------- |
| \`Slider.Root\`   | 루트 컨테이너. \`defaultValue\`, \`min\`, \`max\`, \`step\`, \`size\`, \`disabled\` 수신. |
| \`Slider.Track\`  | 슬라이더 트랙(배경 바). \`Range\`의 부모 역할.                        |
| \`Slider.Range\`  | 선택된 범위를 시각적으로 채우는 영역.                                 |
| \`Slider.Thumb\`  | 드래그 가능한 핸들. \`defaultValue\` 배열 길이만큼 렌더링한다.        |

### 사용 가이드
- \`defaultValue\`는 배열로 전달한다. 단일 값이면 \`[40]\`, 범위 선택이면 \`[20, 80]\`.
- 다중 thumb는 \`defaultValue\` 길이에 맞춰 \`Slider.Thumb\`를 반복 렌더링한다.
- \`aria-label\` 또는 \`aria-labelledby\`를 Root에 반드시 제공한다.

### 키보드 단축키
| 키                           | 동작                   |
| ---------------------------- | ---------------------- |
| \`←\` / \`→\`               | ±step 이동             |
| \`PageUp\` / \`PageDown\`   | ±10 단위 이동          |
| \`Home\` / \`End\`          | 최솟값 / 최댓값으로 이동 |
        `.trim(),
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj;

interface DemoProps {
  size?: SliderSize;
  defaultValue?: number[];
  disabled?: boolean;
}

function Demo({ size, defaultValue = [40], disabled }: DemoProps) {
  return (
    <Slider.Root
      size={size}
      defaultValue={defaultValue}
      disabled={disabled}
      style={{ width: 240 }}
      aria-label="value"
    >
      <Slider.Track>
        <Slider.Range />
      </Slider.Track>
      {defaultValue.map((_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: thumb count is fixed by defaultValue length, position is identity
        <Slider.Thumb key={i} />
      ))}
    </Slider.Root>
  );
}

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: '단일 thumb 기본 슬라이더. `defaultValue={[40]}`으로 초기값을 40으로 설정한 상태.',
      },
    },
  },
  render: () => <Demo />,
};

export const Range: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '두 개의 thumb로 범위를 선택하는 모드. `defaultValue={[20, 80]}`으로 양쪽 핸들을 초기화한다.',
      },
    },
  },
  render: () => <Demo defaultValue={[20, 80]} />,
};

export const Sizes: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`size` prop으로 `sm` / `md` 두 가지 크기를 선택. 트랙 두께와 thumb 크기가 함께 변경된다.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: 240 }}>
      <Demo size="sm" />
      <Demo size="md" />
    </div>
  ),
};

export const Disabled: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`disabled` prop 적용 상태. 드래그 및 키보드 조작이 차단되며 시각적으로 비활성 처리된다.',
      },
    },
  },
  render: () => <Demo disabled defaultValue={[60]} />,
};
