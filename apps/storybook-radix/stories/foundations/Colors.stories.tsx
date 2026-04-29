import { radixTheme } from '@gugbab-ui/tokens';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { PageWrapper, Section, Swatch } from './_helpers';

const meta = {
  title: 'Foundations/Colors',
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

const T = radixTheme.light;

export const Palette: Story = {
  render: () => (
    <PageWrapper
      title="Colors"
      intro="모든 컬러 토큰은 `--gugbab-color-*` CSS 변수로 발행되며, 컴포넌트 CSS는 이 변수만 참조한다. 상단 toolbar에서 Theme: Light / Dark를 토글하면 같은 변수의 값이 바뀌어 즉시 반영된다."
    >
      <Section
        title="Surface"
        description="레이아웃 배경. app은 페이지 바탕, surface는 카드/패널, elevated는 떠있는 메뉴/팝오버, inset은 입력 필드 등 들여쓴 영역."
      >
        <Swatch name="bg.app" cssVar="--gugbab-color-bg-app" value={T.color.bg.app} bordered />
        <Swatch
          name="bg.surface"
          cssVar="--gugbab-color-bg-surface"
          value={T.color.bg.surface}
          bordered
        />
        <Swatch
          name="bg.elevated"
          cssVar="--gugbab-color-bg-elevated"
          value={T.color.bg.elevated}
          bordered
        />
        <Swatch
          name="bg.inset"
          cssVar="--gugbab-color-bg-inset"
          value={T.color.bg.inset}
          bordered
        />
      </Section>

      <Section
        title="Text (foreground)"
        description="대비 위계: primary > secondary > muted > disabled. onAccent는 accent 배경 위에 올라가는 텍스트 (대비 보장)."
      >
        <Swatch
          name="fg.primary"
          cssVar="--gugbab-color-fg-primary"
          value={T.color.fg.primary}
          bordered
          swatchStyle={{ background: 'var(--gugbab-color-bg-surface)' }}
        >
          <div
            style={{
              padding: 'var(--gugbab-space-3)',
              color: 'var(--gugbab-color-fg-primary)',
              fontWeight: 600,
            }}
          >
            Aa
          </div>
        </Swatch>
        <Swatch
          name="fg.secondary"
          cssVar="--gugbab-color-fg-secondary"
          value={T.color.fg.secondary}
          bordered
          swatchStyle={{ background: 'var(--gugbab-color-bg-surface)' }}
        >
          <div
            style={{
              padding: 'var(--gugbab-space-3)',
              color: 'var(--gugbab-color-fg-secondary)',
              fontWeight: 600,
            }}
          >
            Aa
          </div>
        </Swatch>
        <Swatch
          name="fg.muted"
          cssVar="--gugbab-color-fg-muted"
          value={T.color.fg.muted}
          bordered
          swatchStyle={{ background: 'var(--gugbab-color-bg-surface)' }}
        >
          <div
            style={{
              padding: 'var(--gugbab-space-3)',
              color: 'var(--gugbab-color-fg-muted)',
              fontWeight: 600,
            }}
          >
            Aa
          </div>
        </Swatch>
        <Swatch
          name="fg.disabled"
          cssVar="--gugbab-color-fg-disabled"
          value={T.color.fg.disabled}
          bordered
          swatchStyle={{ background: 'var(--gugbab-color-bg-surface)' }}
        >
          <div
            style={{
              padding: 'var(--gugbab-space-3)',
              color: 'var(--gugbab-color-fg-disabled)',
              fontWeight: 600,
            }}
          >
            Aa
          </div>
        </Swatch>
        <Swatch
          name="fg.onAccent"
          cssVar="--gugbab-color-fg-on-accent"
          value={T.color.fg.onAccent}
          swatchStyle={{ background: 'var(--gugbab-color-accent-base)' }}
        >
          <div
            style={{
              padding: 'var(--gugbab-space-3)',
              color: 'var(--gugbab-color-fg-on-accent)',
              fontWeight: 600,
            }}
          >
            Aa
          </div>
        </Swatch>
      </Section>

      <Section
        title="Accent (primary brand)"
        description="버튼/링크/포커스링/체크박스 등 인터랙티브 요소의 핵심 컬러. base가 기본, hover/active는 상태 변형, subtle은 배경 강조용 옅은 톤."
      >
        <Swatch
          name="accent.base"
          cssVar="--gugbab-color-accent-base"
          value={T.color.accent.base}
        />
        <Swatch
          name="accent.hover"
          cssVar="--gugbab-color-accent-hover"
          value={T.color.accent.hover}
        />
        <Swatch
          name="accent.active"
          cssVar="--gugbab-color-accent-active"
          value={T.color.accent.active}
        />
        <Swatch
          name="accent.subtle"
          cssVar="--gugbab-color-accent-subtle"
          value={T.color.accent.subtle}
          bordered
        />
        <Swatch
          name="accent.fg"
          cssVar="--gugbab-color-accent-fg"
          value={T.color.accent.fg}
          swatchStyle={{ background: 'var(--gugbab-color-accent-base)' }}
        />
      </Section>

      {T.color.accent2 ? (
        <Section
          title="Accent2 (secondary brand)"
          description="보조 액션·강조용 두 번째 브랜드 컬러. 사용 빈도는 낮지만 차별화가 필요한 곳에 쓴다."
        >
          <Swatch
            name="accent2.base"
            cssVar="--gugbab-color-accent2-base"
            value={T.color.accent2.base}
          />
          <Swatch
            name="accent2.hover"
            cssVar="--gugbab-color-accent2-hover"
            value={T.color.accent2.hover}
          />
          <Swatch
            name="accent2.active"
            cssVar="--gugbab-color-accent2-active"
            value={T.color.accent2.active}
          />
          <Swatch
            name="accent2.subtle"
            cssVar="--gugbab-color-accent2-subtle"
            value={T.color.accent2.subtle}
            bordered
          />
          <Swatch
            name="accent2.fg"
            cssVar="--gugbab-color-accent2-fg"
            value={T.color.accent2.fg}
            swatchStyle={{ background: 'var(--gugbab-color-accent2-base)' }}
          />
        </Section>
      ) : null}

      <Section
        title="Status"
        description="피드백 의미 컬러. base는 강조 컬러, fg는 base 위 텍스트, subtle은 배경용 옅은 톤 (배지·알림 박스)."
      >
        <Swatch
          name="success.base"
          cssVar="--gugbab-color-success-base"
          value={T.color.success.base}
        />
        <Swatch
          name="success.subtle"
          cssVar="--gugbab-color-success-subtle"
          value={T.color.success.subtle}
          bordered
        />
        <Swatch
          name="warning.base"
          cssVar="--gugbab-color-warning-base"
          value={T.color.warning.base}
        />
        <Swatch
          name="warning.subtle"
          cssVar="--gugbab-color-warning-subtle"
          value={T.color.warning.subtle}
          bordered
        />
        <Swatch
          name="danger.base"
          cssVar="--gugbab-color-danger-base"
          value={T.color.danger.base}
        />
        <Swatch
          name="danger.subtle"
          cssVar="--gugbab-color-danger-subtle"
          value={T.color.danger.subtle}
          bordered
        />
        <Swatch name="info.base" cssVar="--gugbab-color-info-base" value={T.color.info.base} />
        <Swatch
          name="info.subtle"
          cssVar="--gugbab-color-info-subtle"
          value={T.color.info.subtle}
          bordered
        />
      </Section>

      <Section
        title="Border"
        description="구분선 위계: subtle(거의 안 보임) < base(기본) < strong(강조). focus는 키보드 포커스링 컬러."
      >
        <Swatch
          name="border.subtle"
          cssVar="--gugbab-color-border-subtle"
          value={T.color.border.subtle}
          swatchStyle={{
            background: 'var(--gugbab-color-bg-surface)',
            border: '1px solid var(--gugbab-color-border-subtle)',
          }}
        />
        <Swatch
          name="border.base"
          cssVar="--gugbab-color-border-base"
          value={T.color.border.base}
          swatchStyle={{
            background: 'var(--gugbab-color-bg-surface)',
            border: '1px solid var(--gugbab-color-border-base)',
          }}
        />
        <Swatch
          name="border.strong"
          cssVar="--gugbab-color-border-strong"
          value={T.color.border.strong}
          swatchStyle={{
            background: 'var(--gugbab-color-bg-surface)',
            border: '1px solid var(--gugbab-color-border-strong)',
          }}
        />
        <Swatch
          name="border.focus"
          cssVar="--gugbab-color-border-focus"
          value={T.color.border.focus}
          swatchStyle={{
            background: 'var(--gugbab-color-bg-surface)',
            border: '2px solid var(--gugbab-color-border-focus)',
          }}
        />
      </Section>

      <Section title="Overlay" description="모달/다이얼로그가 떴을 때 배경을 덮는 스크림.">
        <Swatch
          name="overlay"
          cssVar="--gugbab-color-overlay"
          value={T.color.overlay}
          swatchStyle={{ background: 'var(--gugbab-color-bg-surface)' }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              background: 'var(--gugbab-color-overlay)',
              borderRadius: 'var(--gugbab-radius-md)',
            }}
          />
        </Swatch>
      </Section>
    </PageWrapper>
  ),
};
