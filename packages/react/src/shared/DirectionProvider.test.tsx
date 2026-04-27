import { render, renderHook, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DirectionProvider, useDirection } from './DirectionProvider';

describe('DirectionProvider', () => {
  it('returns "ltr" by default when not wrapped', () => {
    const { result } = renderHook(() => useDirection());
    expect(result.current).toBe('ltr');
  });

  it('returns the dir set by the nearest provider', () => {
    const { result } = renderHook(() => useDirection(), {
      wrapper: ({ children }) => <DirectionProvider dir="rtl">{children}</DirectionProvider>,
    });
    expect(result.current).toBe('rtl');
  });

  it('a local override wins over the context value', () => {
    const { result } = renderHook(() => useDirection('ltr'), {
      wrapper: ({ children }) => <DirectionProvider dir="rtl">{children}</DirectionProvider>,
    });
    expect(result.current).toBe('ltr');
  });

  it('renders children unchanged', () => {
    render(
      <DirectionProvider dir="rtl">
        <span>hello</span>
      </DirectionProvider>,
    );
    expect(screen.getByText('hello')).toBeInTheDocument();
  });
});
