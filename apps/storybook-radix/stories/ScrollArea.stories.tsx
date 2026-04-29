import { ScrollArea } from '@gugbab-ui/styled-radix';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Navigation/ScrollArea',
  component: ScrollArea.Root,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
**ScrollArea** — 브라우저 기본 스크롤바 대신 커스텀 스타일의 스크롤바를 제공하는 래퍼 컴포넌트. 고정 크기 컨테이너 안에 넘치는 콘텐츠를 자연스럽게 표시한다.

### 컴파운드 구조

| 키                        | 역할                                                                        |
| ------------------------- | --------------------------------------------------------------------------- |
| \`ScrollArea.Root\`       | 전체 래퍼. 고정 \`width\`·\`height\` 지정 필수.                             |
| \`ScrollArea.Viewport\`   | 실제 스크롤 가능한 콘텐츠 영역. \`overflow: hidden\` 처리가 내부에서 됨.    |
| \`ScrollArea.Scrollbar\`  | 커스텀 스크롤바 트랙. \`orientation\` prop으로 \`vertical\`·\`horizontal\` 지정. |
| \`ScrollArea.Thumb\`      | 스크롤바 핸들(드래그 가능한 부분).                                          |
| \`ScrollArea.Corner\`     | 수직·수평 스크롤바가 모두 있을 때 우측 하단 모서리 채움 영역.               |

### 사용 가이드

- \`Root\`에 **고정 크기**를 반드시 지정해야 스크롤이 발생한다.
- 수직·수평 동시 스크롤이 필요하면 \`Scrollbar\`를 두 개 배치하고 \`Corner\`를 추가한다.
- \`Viewport\` 내부 콘텐츠에 \`overflow\` 관련 스타일을 별도 지정하지 않아도 된다.

### 주요 prop

- \`Scrollbar.orientation\` — \`'vertical' | 'horizontal'\`
        `.trim(),
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj;

const LOREM =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';

const ITEMS = Array.from({ length: 50 }, (_, i) => `Item ${i + 1}`);

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '200×200 고정 영역 안에 50개 항목을 수직 스크롤로 표시. 커스텀 스크롤바가 우측에 노출된다.',
      },
    },
  },
  render: () => (
    <ScrollArea.Root style={{ width: 200, height: 200 }}>
      <ScrollArea.Viewport style={{ width: '100%', height: '100%' }}>
        <div style={{ padding: 8 }}>
          {ITEMS.map((item) => (
            <div key={item} style={{ padding: '4px 0' }}>
              {item}
            </div>
          ))}
        </div>
      </ScrollArea.Viewport>
      <ScrollArea.Scrollbar orientation="vertical">
        <ScrollArea.Thumb />
      </ScrollArea.Scrollbar>
    </ScrollArea.Root>
  ),
};

export const Horizontal: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`orientation="horizontal"` 스크롤바. `whiteSpace: nowrap` 콘텐츠를 가로로 스크롤할 때 사용한다.',
      },
    },
  },
  render: () => (
    <ScrollArea.Root style={{ width: 200, height: 200 }}>
      <ScrollArea.Viewport style={{ width: '100%', height: '100%' }}>
        <div style={{ whiteSpace: 'nowrap', padding: 8 }}>
          {ITEMS.map((item) => (
            <span key={item} style={{ display: 'inline-block', marginRight: 16 }}>
              {item}
            </span>
          ))}
        </div>
      </ScrollArea.Viewport>
      <ScrollArea.Scrollbar orientation="horizontal">
        <ScrollArea.Thumb />
      </ScrollArea.Scrollbar>
    </ScrollArea.Root>
  ),
};

export const Both: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '수직·수평 스크롤바를 동시에 사용하는 케이스. 우측 하단 모서리에 `Corner`를 추가해 겹침을 처리한다.',
      },
    },
  },
  render: () => (
    <ScrollArea.Root style={{ width: 200, height: 200 }}>
      <ScrollArea.Viewport style={{ width: '100%', height: '100%' }}>
        <div style={{ padding: 8 }}>
          <div style={{ whiteSpace: 'nowrap', width: 600 }}>
            {LOREM}
            <br />
            {LOREM}
            <br />
            {LOREM}
          </div>
        </div>
      </ScrollArea.Viewport>
      <ScrollArea.Scrollbar orientation="vertical">
        <ScrollArea.Thumb />
      </ScrollArea.Scrollbar>
      <ScrollArea.Scrollbar orientation="horizontal">
        <ScrollArea.Thumb />
      </ScrollArea.Scrollbar>
      <ScrollArea.Corner />
    </ScrollArea.Root>
  ),
};
