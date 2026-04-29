import type { CSSProperties, ReactNode } from 'react';

export interface SwatchProps {
  name: string;
  cssVar: string;
  value?: string;
  bordered?: boolean;
  swatchStyle?: CSSProperties;
  children?: ReactNode;
}

export function Swatch({ name, cssVar, value, bordered, swatchStyle, children }: SwatchProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--gugbab-space-2)',
        minWidth: 0,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          height: 72,
          borderRadius: 'var(--gugbab-radius-md)',
          background: `var(${cssVar})`,
          border: bordered ? '1px solid var(--gugbab-color-border-base)' : 'none',
          ...swatchStyle,
        }}
      >
        {children}
      </div>
      <div style={{ fontFamily: 'var(--gugbab-font-family-sans)', minWidth: 0 }}>
        <div
          style={{
            fontWeight: 600,
            fontSize: 'var(--gugbab-font-size-sm)',
            color: 'var(--gugbab-color-fg-primary)',
            lineHeight: 'var(--gugbab-line-height-normal)',
          }}
        >
          {name}
        </div>
        <code
          style={{
            display: 'block',
            fontFamily: 'var(--gugbab-font-family-mono)',
            fontSize: 'var(--gugbab-font-size-xs)',
            color: 'var(--gugbab-color-fg-secondary)',
            overflowWrap: 'anywhere',
            wordBreak: 'break-all',
            lineHeight: 'var(--gugbab-line-height-tight)',
            marginTop: 2,
          }}
        >
          {cssVar}
        </code>
        {value ? (
          <div
            style={{
              fontSize: 'var(--gugbab-font-size-xs)',
              color: 'var(--gugbab-color-fg-muted)',
              overflowWrap: 'anywhere',
              wordBreak: 'break-all',
              lineHeight: 'var(--gugbab-line-height-tight)',
              marginTop: 2,
            }}
          >
            {value}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export interface SectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  columns?: number;
  /** Minimum column width for the auto-fill grid. Defaults to 220px. */
  minColumn?: number;
}

export function Section({ title, description, children, columns, minColumn = 220 }: SectionProps) {
  return (
    <section style={{ marginBottom: 'var(--gugbab-space-10)' }}>
      <h2
        style={{
          fontFamily: 'var(--gugbab-font-family-sans)',
          fontSize: 'var(--gugbab-font-size-xl)',
          fontWeight: 600,
          margin: '0 0 var(--gugbab-space-1)',
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
            margin: '0 0 var(--gugbab-space-5)',
            maxWidth: 720,
            lineHeight: 'var(--gugbab-line-height-normal)',
          }}
        >
          {description}
        </p>
      ) : (
        <div style={{ marginBottom: 'var(--gugbab-space-5)' }} />
      )}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: columns
            ? `repeat(${columns}, minmax(${minColumn}px, 1fr))`
            : `repeat(auto-fill, minmax(${minColumn}px, 1fr))`,
          gap: 'var(--gugbab-space-6)',
          alignItems: 'start',
        }}
      >
        {children}
      </div>
    </section>
  );
}

export interface PageWrapperProps {
  title: string;
  intro: string;
  children: ReactNode;
}

export function PageWrapper({ title, intro, children }: PageWrapperProps) {
  return (
    <div
      style={{
        padding: 'var(--gugbab-space-8)',
        background: 'var(--gugbab-color-bg-app)',
        minHeight: '100vh',
        fontFamily: 'var(--gugbab-font-family-sans)',
        color: 'var(--gugbab-color-fg-primary)',
      }}
    >
      <header style={{ marginBottom: 'var(--gugbab-space-8)', maxWidth: 720 }}>
        <h1
          style={{
            fontFamily: 'var(--gugbab-font-family-sans)',
            fontSize: 'var(--gugbab-font-size-3xl)',
            fontWeight: 700,
            margin: '0 0 var(--gugbab-space-3)',
            lineHeight: 'var(--gugbab-line-height-tight)',
          }}
        >
          {title}
        </h1>
        <p
          style={{
            fontFamily: 'var(--gugbab-font-family-sans)',
            fontSize: 'var(--gugbab-font-size-base)',
            color: 'var(--gugbab-color-fg-secondary)',
            margin: 0,
            lineHeight: 'var(--gugbab-line-height-normal)',
          }}
        >
          {intro}
        </p>
      </header>
      {children}
    </div>
  );
}
