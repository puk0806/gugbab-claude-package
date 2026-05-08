import { NavigationMenu } from '@gugbab/styled-radix';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Navigation/NavigationMenu',
  component: NavigationMenu.Root,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
**NavigationMenu** — 헤더 상단에 위치하는 수평 네비게이션 메뉴. 트리거 항목에 호버하거나 포커스하면 서브 메뉴 패널이 펼쳐지며, 링크만 있는 단순 항목도 혼합해 사용할 수 있다.

### 컴파운드 구조

| 키                          | 역할                                                                               |
| --------------------------- | ---------------------------------------------------------------------------------- |
| \`NavigationMenu.Root\`     | 전체 메뉴 컨테이너. 포커스·호버 상태를 내부에서 관리한다.                          |
| \`NavigationMenu.List\`     | 최상위 메뉴 항목 목록 (\`<ul>\`).                                                  |
| \`NavigationMenu.Item\`     | 개별 메뉴 항목. **\`value\` prop 필수** — 서브패널 열림 상태 식별에 사용된다.      |
| \`NavigationMenu.Trigger\`  | 서브 메뉴를 여는 버튼. 호버·포커스 시 \`Content\`가 노출된다.                     |
| \`NavigationMenu.Content\`  | 트리거에 연결된 드롭다운 서브 패널 영역.                                           |
| \`NavigationMenu.Link\`     | 직접 이동 링크. \`Trigger\` 없이 단독으로도 사용 가능.                             |

### 주의사항

- \`NavigationMenu.Item\`에는 반드시 고유한 \`value\` prop을 지정해야 한다. 누락 시 서브 메뉴가 정상 동작하지 않는다.
- \`Content\` 안에 자유롭게 그리드·리스트 레이아웃을 구성할 수 있다.

### 접근성

- 키보드 \`Tab\` / 화살표 키로 항목 이동, \`Enter\`·\`Space\`로 서브 메뉴 토글, \`Esc\`로 닫기가 지원된다.
        `.trim(),
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj;

interface MenuSection {
  trigger: string;
  links: Array<{ label: string; description: string; href: string }>;
}

const MENU_SECTIONS: MenuSection[] = [
  {
    trigger: 'Products',
    links: [
      { label: 'Design System', description: 'Headless UI component library', href: '#' },
      { label: 'Tokens', description: 'Design tokens and theming', href: '#' },
      { label: 'Icons', description: 'Open-source icon set', href: '#' },
    ],
  },
  {
    trigger: 'Solutions',
    links: [
      { label: 'Enterprise', description: 'Scale across your organization', href: '#' },
      { label: 'Startup', description: 'Move fast with sensible defaults', href: '#' },
    ],
  },
  {
    trigger: 'Resources',
    links: [
      { label: 'Documentation', description: 'Guides, API reference and more', href: '#' },
      { label: 'Changelog', description: 'Latest updates and releases', href: '#' },
      { label: 'Blog', description: 'Articles from the team', href: '#' },
    ],
  },
];

function FullDemo() {
  return (
    <NavigationMenu.Root>
      <NavigationMenu.List>
        {MENU_SECTIONS.map((section) => (
          <NavigationMenu.Item key={section.trigger} value={section.trigger.toLowerCase()}>
            <NavigationMenu.Trigger>{section.trigger}</NavigationMenu.Trigger>
            <NavigationMenu.Content>
              <ul
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: 8,
                  padding: 16,
                  minWidth: 300,
                  listStyle: 'none',
                  margin: 0,
                }}
              >
                {section.links.map((link) => (
                  <li key={link.label}>
                    <NavigationMenu.Link href={link.href}>
                      <strong>{link.label}</strong>
                      <br />
                      <span>{link.description}</span>
                    </NavigationMenu.Link>
                  </li>
                ))}
              </ul>
            </NavigationMenu.Content>
          </NavigationMenu.Item>
        ))}
        <NavigationMenu.Item value="pricing">
          <NavigationMenu.Link href="#">Pricing</NavigationMenu.Link>
        </NavigationMenu.Item>
      </NavigationMenu.List>
    </NavigationMenu.Root>
  );
}

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '3개의 드롭다운 메뉴와 1개의 단순 링크가 혼합된 기본 헤더 네비게이션. Trigger에 호버하면 서브 패널이 나타난다.',
      },
    },
  },
  render: () => <FullDemo />,
};

export const WithExtraLink: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '홈·연락처 같은 단순 링크 항목과 드롭다운 항목을 혼합한 구성. `Item`에 `Trigger` 없이 `Link`만 두면 된다.',
      },
    },
  },
  render: () => (
    <NavigationMenu.Root>
      <NavigationMenu.List>
        <NavigationMenu.Item value="home">
          <NavigationMenu.Link href="#">Home</NavigationMenu.Link>
        </NavigationMenu.Item>
        {MENU_SECTIONS.slice(0, 2).map((section) => (
          <NavigationMenu.Item key={section.trigger} value={section.trigger.toLowerCase()}>
            <NavigationMenu.Trigger>{section.trigger}</NavigationMenu.Trigger>
            <NavigationMenu.Content>
              <ul
                style={{
                  padding: 16,
                  minWidth: 220,
                  listStyle: 'none',
                  margin: 0,
                }}
              >
                {section.links.map((link) => (
                  <li key={link.label} style={{ marginBottom: 8 }}>
                    <NavigationMenu.Link href={link.href}>{link.label}</NavigationMenu.Link>
                  </li>
                ))}
              </ul>
            </NavigationMenu.Content>
          </NavigationMenu.Item>
        ))}
        <NavigationMenu.Item value="contact">
          <NavigationMenu.Link href="#">Contact</NavigationMenu.Link>
        </NavigationMenu.Item>
      </NavigationMenu.List>
    </NavigationMenu.Root>
  ),
};
