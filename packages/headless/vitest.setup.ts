import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, expect } from 'vitest';
import * as matchers from 'vitest-axe/matchers';
import type { AxeMatchers } from 'vitest-axe/matchers';

// jsdom does not implement PointerEvent — provide a minimal polyfill
if (typeof window !== 'undefined' && !window.PointerEvent) {
  class PointerEventPolyfill extends MouseEvent {
    pointerId: number;
    pointerType: string;
    pressure: number;
    constructor(type: string, init: PointerEventInit = {}) {
      super(type, init);
      this.pointerId = init.pointerId ?? 0;
      this.pointerType = init.pointerType ?? '';
      this.pressure = init.pressure ?? 0;
    }
  }
  (window as unknown as Record<string, unknown>).PointerEvent = PointerEventPolyfill;
}

expect.extend(matchers);

afterEach(() => {
  cleanup();
});

declare module 'vitest' {
  // vitest 3 augmentation (vitest-axe/extend-expect still targets the legacy `Vi` namespace).
  // The unused T satisfies TS2428 (merged interfaces need identical type parameters).
  interface Assertion<T> extends AxeMatchers {}
  interface AsymmetricMatchersContaining extends AxeMatchers {}
}
