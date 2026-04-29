import { VisuallyHidden } from '@gugbab-ui/styled-radix';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Primitives/VisuallyHidden',
  component: VisuallyHidden,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
**VisuallyHidden** — 화면에서는 보이지 않지만 스크린 리더에는 정상적으로 읽히는 접근성 전용 컴포넌트.

### 구조

단일 컴포넌트. CSS clip/overflow 기법으로 시각적으로 숨기며 \`display: none\`이나 \`visibility: hidden\`과 달리 접근성 트리에서 제거되지 않는다.

### 사용 가이드
- 아이콘 전용 버튼에 의미 있는 텍스트를 제공할 때 사용한다 (예: 닫기 버튼의 "Close dialog").
- \`<label>\` 안에서 사용하면 input을 시각적 라벨 없이 접근성 있게 만들 수 있다.
- \`aria-label\`이 이미 있는 요소에 중복 사용하면 스크린 리더가 두 번 읽을 수 있으니 하나만 선택한다.
- \`display: none\` 또는 \`opacity: 0\`으로는 절대 대체하지 않는다 — 스크린 리더가 읽지 못한다.
        `.trim(),
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof VisuallyHidden>;

export default meta;
type Story = StoryObj;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '아이콘 버튼에 숨겨진 텍스트 제공. 화면에는 ✕만 보이지만 스크린 리더는 "Close dialog"를 읽는다.',
      },
    },
  },
  render: () => (
    <button type="button" aria-label="Close dialog">
      <VisuallyHidden>Close dialog</VisuallyHidden>
      <span aria-hidden>✕</span>
    </button>
  ),
};

export const WithLabelledInput: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '검색창의 label을 시각적으로 숨김. placeholder가 있어 디자인을 깨지 않으면서 접근성을 유지한다.',
      },
    },
  },
  render: () => (
    <div>
      <label htmlFor="hidden-label-input">
        <VisuallyHidden>Search query</VisuallyHidden>
      </label>
      <input
        id="hidden-label-input"
        type="search"
        placeholder="Search… (label is visually hidden)"
      />
    </div>
  ),
};
