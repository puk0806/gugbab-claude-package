import { radixTheme } from '@gugbab/tokens';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { PageWrapper, Section } from './_helpers';

const meta = {
  title: 'Foundations/Spacing',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj;

const T = radixTheme.light;

const STEPS = [0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24] as const;

export const Scale: Story = {
  render: () => (
    <PageWrapper
      title="Spacing"
      intro="13단계 간격 스케일 (`space.0`~`space.24`). 컴포넌트 padding/margin/gap은 이 토큰만 사용하여 리듬을 유지한다. 1단계 = 4px 기준."
    >
      <Section
        title="Scale"
        description="막대 길이 = 토큰 값. 작은 값(1~3)은 컴포넌트 내부, 큰 값(8~24)은 섹션 간격에 쓴다."
      >
        <div
          style={{
            gridColumn: '1 / -1',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--gugbab-space-2)',
          }}
        >
          {STEPS.map((step) => {
            const value = T.space[step];
            return (
              <div
                key={step}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '120px 100px 1fr',
                  alignItems: 'center',
                  gap: 'var(--gugbab-space-3)',
                  padding: 'var(--gugbab-space-2) 0',
                  borderBottom: '1px solid var(--gugbab-color-border-subtle)',
                }}
              >
                <div>
                  <div
                    style={{
                      fontFamily: 'var(--gugbab-font-family-sans)',
                      fontWeight: 600,
                      fontSize: 'var(--gugbab-font-size-sm)',
                      color: 'var(--gugbab-color-fg-primary)',
                    }}
                  >
                    space.{step}
                  </div>
                  <code
                    style={{
                      display: 'block',
                      fontFamily: 'var(--gugbab-font-family-mono)',
                      fontSize: 'var(--gugbab-font-size-xs)',
                      color: 'var(--gugbab-color-fg-secondary)',
                    }}
                  >
                    --gugbab-space-{step}
                  </code>
                </div>
                <div
                  style={{
                    fontFamily: 'var(--gugbab-font-family-mono)',
                    fontSize: 'var(--gugbab-font-size-xs)',
                    color: 'var(--gugbab-color-fg-muted)',
                  }}
                >
                  {value}
                </div>
                <div
                  style={{
                    height: 12,
                    width: `var(--gugbab-space-${step})`,
                    minWidth: step === 0 ? 1 : undefined,
                    background: 'var(--gugbab-color-accent-base)',
                    borderRadius: 'var(--gugbab-radius-sm)',
                  }}
                />
              </div>
            );
          })}
        </div>
      </Section>
    </PageWrapper>
  ),
};
