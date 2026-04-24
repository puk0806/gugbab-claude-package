import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useControllableState } from './use-controllable-state';

describe('useControllableState', () => {
  describe('uncontrolled mode (no `value` prop)', () => {
    it('falls back to `defaultValue` for the initial state', () => {
      const { result } = renderHook(() => useControllableState<number>({ defaultValue: 7 }));
      expect(result.current[0]).toBe(7);
    });

    it('updates the internal state when the setter is called', () => {
      const { result } = renderHook(() => useControllableState<number>({ defaultValue: 0 }));

      act(() => {
        result.current[1](5);
      });
      expect(result.current[0]).toBe(5);
    });

    it('calls onChange with the new value on setter invocation', () => {
      const onChange = vi.fn();
      const { result } = renderHook(() =>
        useControllableState<number>({ defaultValue: 0, onChange }),
      );

      act(() => {
        result.current[1](3);
      });

      expect(onChange).toHaveBeenCalledWith(3);
    });

    it('supports functional updates (prev => next)', () => {
      const { result } = renderHook(() => useControllableState<number>({ defaultValue: 1 }));

      act(() => {
        result.current[1]((prev) => prev + 10);
      });
      expect(result.current[0]).toBe(11);
    });
  });

  describe('controlled mode (`value` prop provided)', () => {
    it('always returns the controlled value', () => {
      const { result } = renderHook(
        ({ value }) => useControllableState<number>({ value, defaultValue: 0 }),
        { initialProps: { value: 42 } },
      );

      expect(result.current[0]).toBe(42);
    });

    it('reflects external value changes across rerenders', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useControllableState<number>({ value, defaultValue: 0 }),
        { initialProps: { value: 1 } },
      );

      rerender({ value: 2 });
      expect(result.current[0]).toBe(2);

      rerender({ value: 3 });
      expect(result.current[0]).toBe(3);
    });

    it('does not mutate state internally; only emits onChange', () => {
      const onChange = vi.fn();
      const { result } = renderHook(() => useControllableState<number>({ value: 10, onChange }));

      act(() => {
        result.current[1](99);
      });

      expect(onChange).toHaveBeenCalledWith(99);
      expect(result.current[0]).toBe(10);
    });

    it('resolves functional updates against the controlled value', () => {
      const onChange = vi.fn();
      const { result } = renderHook(() => useControllableState<number>({ value: 5, onChange }));

      act(() => {
        result.current[1]((prev) => prev * 2);
      });

      expect(onChange).toHaveBeenCalledWith(10);
    });
  });

  it('exposes a stable setter identity across renders', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useControllableState<number>({ value, defaultValue: 0 }),
      { initialProps: { value: 1 } },
    );

    const firstSetter = result.current[1];
    rerender({ value: 2 });
    expect(result.current[1]).toBe(firstSetter);
  });
});
