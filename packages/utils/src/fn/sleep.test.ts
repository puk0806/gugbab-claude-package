import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { sleep } from './sleep';

describe('sleep', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('resolves after specified milliseconds', async () => {
    const promise = sleep(500);
    let resolved = false;
    promise.then(() => {
      resolved = true;
    });

    await vi.advanceTimersByTimeAsync(499);
    expect(resolved).toBe(false);

    await vi.advanceTimersByTimeAsync(1);
    expect(resolved).toBe(true);
  });

  it('resolves with undefined', async () => {
    const promise = sleep(10);
    await vi.advanceTimersByTimeAsync(10);
    await expect(promise).resolves.toBeUndefined();
  });
});
