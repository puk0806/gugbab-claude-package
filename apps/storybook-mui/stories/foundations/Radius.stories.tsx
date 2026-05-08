import { muiTheme } from '@gugbab/tokens';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { PageWrapper, Section } from './_helpers';

const meta = {
  title: 'Foundations/Radius',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj;

const T = muiTheme.light;
const STEPS = ['none', 'sm', 'md', 'lg', 'xl', 'full'] as const;

export const Scale: Story = {
  render: () => (
    <PageWrapper
      title="Radius"
      intro="6단계 모서리 둥글기. 컴포넌트별 권장: 입력 필드/버튼=md, 카드=lg, 다이얼로그=xl, 칩·아바타=full."
    >
      <Section title="Scale">
        {STEPS.map((step) => (
          <div
            key={step}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 'var(--gugbab-space-3)',
            }}
          >
            <div
              style={{
                width: 96,
                height: 96,
                borderRadius: `var(--gugbab-radius-${step})`,
                background: 'var(--gugbab-color-accent-base)',
              }}
            />
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontFamily: 'var(--gugbab-font-family-sans)',
                  fontWeight: 600,
                  fontSize: 'var(--gugbab-font-size-sm)',
                  color: 'var(--gugbab-color-fg-primary)',
                }}
              >
                radius.{step}
              </div>
              <code
                style={{
                  display: 'block',
                  fontFamily: 'var(--gugbab-font-family-mono)',
                  fontSize: 'var(--gugbab-font-size-xs)',
                  color: 'var(--gugbab-color-fg-secondary)',
                }}
              >
                --gugbab-radius-{step}
              </code>
              <div
                style={{
                  fontSize: 'var(--gugbab-font-size-xs)',
                  color: 'var(--gugbab-color-fg-muted)',
                }}
              >
                {T.radius[step]}
              </div>
            </div>
          </div>
        ))}
      </Section>
    </PageWrapper>
  ),
};
