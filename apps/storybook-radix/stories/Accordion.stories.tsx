import { Accordion, type AccordionVariant } from '@gugbab/styled-radix';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Stateful/Accordion',
  component: Accordion.Root,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
**Accordion** — 여러 패널을 펼치고 접을 수 있는 컴포넌트. FAQ, 설정 카테고리, 사이드바 메뉴 등에 적합하며 WAI-ARIA \`Disclosure\` 패턴을 준수한다.

### 컴파운드 구조

| 키                    | 역할                                                                                                          |
| --------------------- | ------------------------------------------------------------------------------------------------------------- |
| \`Accordion.Root\`    | 루트 컨테이너. \`type\`(필수) / \`collapsible\`(single 한정) / \`variant\` / \`value\` / \`onValueChange\` 처리. |
| \`Accordion.Item\`    | 개별 패널 단위. \`value\` prop 필수. 형제 \`Item\` 들과 독립적으로 상태를 가진다.                              |
| \`Accordion.Header\`  | 시멘틱 \`<h3>\` 헤더 래퍼. SEO 및 아웃라인 구조에 기여.                                                      |
| \`Accordion.Trigger\` | 패널을 여닫는 버튼. \`aria-expanded\` / \`aria-controls\` 자동 반영.                                         |
| \`Accordion.Content\` | 패널 콘텐츠 영역. 접혔을 때 DOM에서 숨김 처리.                                                               |

### 사용 가이드

- \`type="single"\`: 한 번에 하나의 패널만 열림. \`collapsible=true\`를 추가하면 이미 열린 패널도 닫을 수 있다.
- \`type="multiple"\`: 여러 패널 동시 열기 가능. \`collapsible\` prop은 무시된다.
- \`variant\`: \`'default'\`(구분선) | \`'outline'\`(테두리 박스).
- 키보드: **Space / Enter** 트리거 활성화, **Arrow Up / Down** 이웃 트리거 이동, **Home / End** 첫·끝 트리거.
        `.trim(),
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj;

const FAQ_ITEMS = [
  {
    value: 'q1',
    question: 'What is a headless component?',
    answer:
      'A headless component provides behavior and accessibility without any visual styling, letting consumers apply their own design.',
  },
  {
    value: 'q2',
    question: 'How do I apply custom styles?',
    answer:
      'You can wrap the headless primitives with your own CSS classes or a styled variant package like @gugbab/styled-radix.',
  },
  {
    value: 'q3',
    question: 'Is keyboard navigation supported?',
    answer:
      'Yes. All components follow WAI-ARIA patterns and support full keyboard navigation out of the box.',
  },
] as const;

interface DemoProps {
  type: 'single' | 'multiple';
  collapsible?: boolean;
  variant?: AccordionVariant;
}

function Demo({ type, collapsible = true, variant }: DemoProps) {
  return (
    <Accordion.Root
      type={type}
      collapsible={type === 'single' ? collapsible : undefined}
      variant={variant}
      style={{ width: 480 }}
    >
      {FAQ_ITEMS.map((item) => (
        <Accordion.Item key={item.value} value={item.value}>
          <Accordion.Header>
            <Accordion.Trigger style={{ width: '100%', textAlign: 'left' }}>
              {item.question}
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content>
            <p style={{ margin: '8px 0' }}>{item.answer}</p>
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}

export const SingleCollapsible: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`type="single"` + `collapsible=true` — 하나의 패널만 열리고, 이미 열린 패널을 다시 클릭해 닫을 수 있다.',
      },
    },
  },
  render: () => <Demo type="single" collapsible />,
};

export const Multiple: Story = {
  parameters: {
    docs: {
      description: {
        story: '`type="multiple"` — 여러 패널을 동시에 열 수 있다. 독립적인 FAQ 항목 나열에 적합.',
      },
    },
  },
  render: () => <Demo type="multiple" />,
};

export const Variants: Story = {
  parameters: {
    docs: {
      description: {
        story: '`default`(구분선 스타일)과 `outline`(테두리 박스 스타일) 두 가지 variant 비교.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <Demo type="single" variant="default" />
      <Demo type="single" variant="outline" />
    </div>
  ),
};
