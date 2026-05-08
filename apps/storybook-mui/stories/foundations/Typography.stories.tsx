import { muiTheme } from '@gugbab/tokens';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties, ReactNode } from 'react';
import { PageWrapper } from './_helpers';

const meta = {
  title: 'Foundations/Typography',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj;

const T = muiTheme.light;

const SAMPLE = '다람쥐 헌 쳇바퀴에 타고파 — The quick brown fox jumps over the lazy dog 0123456789';

interface RowProps {
  label: string;
  cssVar: string;
  value: string;
  sampleStyle: CSSProperties;
}

function Row({ label, cssVar, value, sampleStyle }: RowProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '200px 1fr',
        gap: 'var(--gugbab-space-6)',
        alignItems: 'flex-start',
        padding: 'var(--gugbab-space-5) 0',
        borderBottom: '1px solid var(--gugbab-color-border-subtle)',
      }}
    >
      <div style={{ paddingTop: 4 }}>
        <div
          style={{
            fontWeight: 600,
            fontSize: 'var(--gugbab-font-size-sm)',
            color: 'var(--gugbab-color-fg-primary)',
            lineHeight: 'var(--gugbab-line-height-normal)',
          }}
        >
          {label}
        </div>
        <code
          style={{
            display: 'block',
            fontFamily: 'var(--gugbab-font-family-mono)',
            fontSize: 'var(--gugbab-font-size-xs)',
            color: 'var(--gugbab-color-fg-secondary)',
            wordBreak: 'break-all',
            marginTop: 2,
          }}
        >
          {cssVar}
        </code>
        <div
          style={{
            fontSize: 'var(--gugbab-font-size-xs)',
            color: 'var(--gugbab-color-fg-muted)',
            marginTop: 2,
          }}
        >
          {value}
        </div>
      </div>
      <div style={sampleStyle}>{SAMPLE}</div>
    </div>
  );
}

interface StackedSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
}

function StackedSection({ title, description, children }: StackedSectionProps) {
  return (
    <section style={{ marginBottom: 'var(--gugbab-space-10)' }}>
      <h2
        style={{
          fontFamily: 'var(--gugbab-font-family-sans)',
          fontSize: 'var(--gugbab-font-size-xl)',
          fontWeight: 600,
          margin: '0 0 4px',
          color: 'var(--gugbab-color-fg-primary)',
          lineHeight: 'var(--gugbab-line-height-tight)',
        }}
      >
        {title}
      </h2>
      {description ? (
        <p
          style={{
            fontFamily: 'var(--gugbab-font-family-sans)',
            fontSize: 'var(--gugbab-font-size-sm)',
            color: 'var(--gugbab-color-fg-secondary)',
            margin: '0 0 var(--gugbab-space-4)',
            maxWidth: 720,
            lineHeight: 'var(--gugbab-line-height-normal)',
          }}
        >
          {description}
        </p>
      ) : (
        <div style={{ marginBottom: 'var(--gugbab-space-4)' }} />
      )}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          borderTop: '1px solid var(--gugbab-color-border-subtle)',
        }}
      >
        {children}
      </div>
    </section>
  );
}

export const Type: Story = {
  render: () => (
    <PageWrapper
      title="Typography"
      intro="font-family / size / weight / line-height 토큰. 모든 컴포넌트의 텍스트 스타일은 이 토큰으로만 구성되어, 글로벌 일관성을 보장하고 어댑터 교체 시 즉시 갱신된다."
    >
      <StackedSection title="Font family" description="기본 sans-serif와 코드용 monospace 두 종.">
        <Row
          label="family.sans"
          cssVar="--gugbab-font-family-sans"
          value={T.font.family.sans}
          sampleStyle={{
            fontFamily: 'var(--gugbab-font-family-sans)',
            fontSize: 'var(--gugbab-font-size-base)',
            lineHeight: 'var(--gugbab-line-height-normal)',
          }}
        />
        <Row
          label="family.mono"
          cssVar="--gugbab-font-family-mono"
          value={T.font.family.mono}
          sampleStyle={{
            fontFamily: 'var(--gugbab-font-family-mono)',
            fontSize: 'var(--gugbab-font-size-base)',
            lineHeight: 'var(--gugbab-line-height-normal)',
          }}
        />
      </StackedSection>

      <StackedSection
        title="Font size"
        description="모듈러 스케일. xs(라벨)·sm(본문 작은)·base(본문)·lg(부제)·xl·2xl·3xl·4xl(헤딩)."
      >
        {(['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl'] as const).map((k) => (
          <Row
            key={k}
            label={`size.${k}`}
            cssVar={`--gugbab-font-size-${k}`}
            value={T.font.size[k]}
            sampleStyle={{
              fontFamily: 'var(--gugbab-font-family-sans)',
              fontSize: `var(--gugbab-font-size-${k})`,
              lineHeight: 'var(--gugbab-line-height-tight)',
            }}
          />
        ))}
      </StackedSection>

      <StackedSection
        title="Font weight"
        description="normal(본문) · medium(라벨) · semibold(소헤딩) · bold(강조)."
      >
        {(['normal', 'medium', 'semibold', 'bold'] as const).map((k) => (
          <Row
            key={k}
            label={`weight.${k}`}
            cssVar={`--gugbab-font-weight-${k}`}
            value={String(T.font.weight[k])}
            sampleStyle={{
              fontFamily: 'var(--gugbab-font-family-sans)',
              fontSize: 'var(--gugbab-font-size-lg)',
              fontWeight: `var(--gugbab-font-weight-${k})` as unknown as number,
              lineHeight: 'var(--gugbab-line-height-normal)',
            }}
          />
        ))}
      </StackedSection>

      <StackedSection
        title="Line height"
        description="tight(헤딩) · normal(본문) · relaxed(긴 산문)."
      >
        {(['tight', 'normal', 'relaxed'] as const).map((k) => (
          <Row
            key={k}
            label={`lineHeight.${k}`}
            cssVar={`--gugbab-line-height-${k}`}
            value={String(T.font.lineHeight[k])}
            sampleStyle={{
              fontFamily: 'var(--gugbab-font-family-sans)',
              fontSize: 'var(--gugbab-font-size-base)',
              lineHeight: `var(--gugbab-line-height-${k})`,
              maxWidth: 480,
            }}
          />
        ))}
      </StackedSection>
    </PageWrapper>
  ),
};
