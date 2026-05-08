import { muiTheme } from '@gugbab/tokens';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { PageWrapper, Section } from './_helpers';

const meta = {
  title: 'Foundations/Shadows',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj;

const T = muiTheme.light;
const STEPS = ['sm', 'md', 'lg', 'xl'] as const;

export const Scale: Story = {
  render: () => (
    <PageWrapper
      title="Shadows"
      intro="고도(elevation) 4단계. sm은 입력 포커스/카드, md는 드롭다운, lg는 팝오버, xl은 모달 레이어용."
    >
      <Section title="Scale">
        {STEPS.map((step) => (
          <div
            key={step}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 'var(--gugbab-space-4)',
              padding: 'var(--gugbab-space-6)',
            }}
          >
            <div
              style={{
                width: 144,
                height: 96,
                borderRadius: 'var(--gugbab-radius-lg)',
                background: 'var(--gugbab-color-bg-elevated)',
                boxShadow: `var(--gugbab-shadow-${step})`,
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
                shadow.{step}
              </div>
              <code
                style={{
                  display: 'block',
                  fontFamily: 'var(--gugbab-font-family-mono)',
                  fontSize: 'var(--gugbab-font-size-xs)',
                  color: 'var(--gugbab-color-fg-secondary)',
                }}
              >
                --gugbab-shadow-{step}
              </code>
              <div
                style={{
                  fontSize: 'var(--gugbab-font-size-xs)',
                  color: 'var(--gugbab-color-fg-muted)',
                  maxWidth: 144,
                  wordBreak: 'break-all',
                }}
              >
                {T.shadow[step]}
              </div>
            </div>
          </div>
        ))}
      </Section>
    </PageWrapper>
  ),
};
