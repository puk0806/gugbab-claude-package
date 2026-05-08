import { Pagination, type PaginationSize } from '@gugbab/styled-mui';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

const meta = {
  title: 'Navigation/Pagination',
  component: Pagination.Root,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
**Pagination** — 콘텐츠가 여러 페이지에 걸쳐 있을 때 사용자가 페이지를 이동할 수 있게 하는 네비게이션 컴포넌트. 현재 페이지 상태를 외부에서 제어(controlled)하며 접근성을 갖춘다.

### 컴파운드 구조

| 키                       | 역할                                                                          |
| ------------------------ | ----------------------------------------------------------------------------- |
| \`Pagination.Root\`      | 컨테이너. \`pageCount\`·\`page\`·\`onPageChange\`·\`size\` prop 수신.         |
| \`Pagination.List\`      | 페이지 버튼들을 감싸는 \`<ul>\`.                                               |
| \`Pagination.Item\`      | 개별 \`<li>\` 래퍼.                                                           |
| \`Pagination.Page\`      | 특정 페이지 버튼. \`page\` prop으로 이동할 번호 지정.                          |
| \`Pagination.Previous\`  | 이전 페이지 버튼. 첫 페이지에서 자동 비활성화.                                 |
| \`Pagination.Next\`      | 다음 페이지 버튼. 마지막 페이지에서 자동 비활성화.                             |
| \`Pagination.Ellipsis\`  | 생략 표시 \`…\`. 페이지가 많을 때 중간 범위를 축약한다.                        |

### 주요 prop

- \`pageCount\` — 전체 페이지 수 (필수)
- \`page\` — 현재 활성 페이지 번호 (controlled)
- \`onPageChange\` — 페이지 변경 콜백 \`(page: number) => void\`
- \`size\` — \`'sm' | 'md'\` (기본값 \`'md'\`)
        `.trim(),
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj;

interface DemoProps {
  size?: PaginationSize;
  pageCount?: number;
  defaultPage?: number;
}

function Demo({ size, pageCount = 7, defaultPage = 3 }: DemoProps) {
  const [page, setPage] = useState(defaultPage);
  const pages = Array.from({ length: pageCount }, (_, i) => i + 1);

  return (
    <Pagination.Root size={size} pageCount={pageCount} page={page} onPageChange={setPage}>
      <Pagination.List>
        <Pagination.Item>
          <Pagination.Previous />
        </Pagination.Item>
        {pages.map((p) => (
          <Pagination.Item key={p}>
            <Pagination.Page page={p}>{p}</Pagination.Page>
          </Pagination.Item>
        ))}
        <Pagination.Item>
          <Pagination.Next />
        </Pagination.Item>
      </Pagination.List>
    </Pagination.Root>
  );
}

function EllipsisDemo({ size, pageCount = 20, defaultPage = 10 }: DemoProps) {
  const [page, setPage] = useState(defaultPage);

  const items: Array<number | null> = [1, null, page - 1, page, page + 1, null, pageCount].filter(
    (v, i, arr) => {
      if (v === null) return true;
      const n = v as number;
      if (n < 1 || n > pageCount) return false;
      return arr.indexOf(v) === i;
    },
  );

  return (
    <Pagination.Root size={size} pageCount={pageCount} page={page} onPageChange={setPage}>
      <Pagination.List>
        <Pagination.Item>
          <Pagination.Previous />
        </Pagination.Item>
        {items.map((item, idx) =>
          item === null ? (
            // biome-ignore lint/suspicious/noArrayIndexKey: static ellipsis positions
            <Pagination.Item key={`ellipsis-${idx}`}>
              <Pagination.Ellipsis>…</Pagination.Ellipsis>
            </Pagination.Item>
          ) : (
            <Pagination.Item key={item}>
              <Pagination.Page page={item}>{item}</Pagination.Page>
            </Pagination.Item>
          ),
        )}
        <Pagination.Item>
          <Pagination.Next />
        </Pagination.Item>
      </Pagination.List>
    </Pagination.Root>
  );
}

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '7페이지 기본 구성. 현재 페이지(3)가 활성 상태이며 Previous/Next 버튼으로 이동할 수 있다.',
      },
    },
  },
  render: () => <Demo />,
};

export const Sizes: Story = {
  parameters: {
    docs: {
      description: {
        story: '`size` prop으로 크기 조절. `sm`은 밀도 높은 레이아웃, `md`는 일반 화면에 적합하다.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {(['sm', 'md'] as const).map((s) => (
        <Demo key={s} size={s} />
      ))}
    </div>
  ),
};

export const ManyPages: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '20페이지처럼 페이지 수가 많을 때 `Ellipsis`로 중간 범위를 생략하는 패턴. 현재 페이지 주변만 노출한다.',
      },
    },
  },
  render: () => <EllipsisDemo pageCount={20} defaultPage={10} />,
};
