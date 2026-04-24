import { describe, expect, it, vi } from 'vitest';
import { once } from './once';

describe('once', () => {
  it('invokes the underlying function only on the first call', () => {
    const spy = vi.fn(() => 42);
    const wrapped = once(spy);
    wrapped();
    wrapped();
    wrapped();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('returns the cached first result on subsequent calls', () => {
    let counter = 0;
    const wrapped = once(() => ++counter);
    expect(wrapped()).toBe(1);
    expect(wrapped()).toBe(1);
    expect(wrapped()).toBe(1);
  });

  it('forwards arguments only for the first call', () => {
    const spy = vi.fn((a: number, b: number) => a + b);
    const wrapped = once(spy);
    expect(wrapped(1, 2)).toBe(3);
    expect(wrapped(10, 20)).toBe(3);
    expect(spy).toHaveBeenCalledWith(1, 2);
  });

  it('caches undefined result as well', () => {
    const spy = vi.fn(() => undefined);
    const wrapped = once(spy);
    wrapped();
    wrapped();
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
