import { Breadcrumbs, type BreadcrumbsSeparatorVariant } from '@gugbab-ui/styled-mui';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Navigation/Breadcrumbs',
  component: Breadcrumbs.Root,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
**Breadcrumbs** — 현재 페이지가 사이트 계층 구조에서 어느 위치에 있는지 보여주는 보조 네비게이션 컴포넌트. 깊은 계층의 페이지에서 상위 경로를 빠르게 탐색할 수 있다.

### 컴파운드 구조

| 키                        | 역할                                                              |
| ------------------------- | ----------------------------------------------------------------- |
| \`Breadcrumbs.Root\`      | \`<nav>\` 래퍼. \`separator\` prop으로 구분자 모양 선택.          |
| \`Breadcrumbs.List\`      | \`<ol>\` 목록 컨테이너.                                           |
| \`Breadcrumbs.Item\`      | \`<li>\` 항목. 마지막 항목에 \`current\` prop 추가.               |
| \`Breadcrumbs.Link\`      | 상위 계층으로 이동하는 \`<a>\` 링크.                              |
| \`Breadcrumbs.Separator\` | 항목 사이 시각적 구분자. \`separator\` 변형에 따라 자동 렌더링.   |
| \`Breadcrumbs.Page\`      | 현재 페이지 텍스트. 링크가 아닌 \`<span>\`으로 렌더링된다.        |

### 접근성

- \`Root\`는 \`aria-label="breadcrumb"\`이 포함된 \`<nav>\`로 렌더링되어 스크린 리더가 탐색 영역임을 인식한다.
- 마지막 \`Item\`의 \`current\` prop은 \`aria-current="page"\`를 자동으로 추가한다.

### 주요 prop

- \`separator\` — \`'chevron' | 'slash'\` (기본값 \`'chevron'\`)
        `.trim(),
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj;

interface DemoProps {
  separator?: BreadcrumbsSeparatorVariant;
  crumbs: Array<{ label: string; href?: string }>;
}

function Demo({ separator, crumbs }: DemoProps) {
  return (
    <Breadcrumbs.Root separator={separator}>
      <Breadcrumbs.List>
        {crumbs.map((crumb, idx) => {
          const isLast = idx === crumbs.length - 1;
          return (
            <Breadcrumbs.Item key={crumb.label} current={isLast}>
              {isLast ? (
                <Breadcrumbs.Page>{crumb.label}</Breadcrumbs.Page>
              ) : (
                <>
                  <Breadcrumbs.Link href={crumb.href ?? '#'}>{crumb.label}</Breadcrumbs.Link>
                  <Breadcrumbs.Separator />
                </>
              )}
            </Breadcrumbs.Item>
          );
        })}
      </Breadcrumbs.List>
    </Breadcrumbs.Root>
  );
}

const SHORT_CRUMBS = [
  { label: 'Home', href: '/' },
  { label: 'Products', href: '/products' },
  { label: 'Detail' },
];

const LONG_CRUMBS = [
  { label: 'Home', href: '/' },
  { label: 'Category', href: '/category' },
  { label: 'Sub-Category', href: '/category/sub' },
  { label: 'Product Line', href: '/category/sub/line' },
  { label: 'Item Detail' },
];

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '기본 chevron 구분자를 사용한 3단계 경로. 마지막 항목은 링크 없는 현재 페이지로 표시된다.',
      },
    },
  },
  render: () => <Demo crumbs={SHORT_CRUMBS} />,
};

export const WithSlashSeparator: Story = {
  parameters: {
    docs: {
      description: {
        story: '`separator="slash"` 옵션. URL 경로처럼 보이는 슬래시(`/`) 구분자로 렌더링된다.',
      },
    },
  },
  render: () => <Demo separator="slash" crumbs={SHORT_CRUMBS} />,
};

export const Long: Story = {
  parameters: {
    docs: {
      description: {
        story: '5단계 계층 경로. 깊은 페이지 구조에서 상위 경로를 모두 노출할 때의 레이아웃.',
      },
    },
  },
  render: () => <Demo crumbs={LONG_CRUMBS} />,
};
