import { describe, expect, it } from 'vitest';
import { ContextMenu } from '../ContextMenu';

// ContextMenu 는 right-click 으로만 열려 defaultOpen 패턴이 없다 — 컴포넌트가 export
// 가능하고 compound part 가 모두 정의되어 있는지(즉 사용자가 import 시 broken 되지
// 않는지) 검증한다. 동작 자체는 `@gugbab/headless` 의 ContextMenu 테스트가 커버.

describe('ContextMenu (styled-mui)', () => {
  it('exposes the expected compound parts', () => {
    expect(ContextMenu.Root).toBeDefined();
    expect(ContextMenu.Trigger).toBeDefined();
    expect(ContextMenu.Portal).toBeDefined();
    expect(ContextMenu.Content).toBeDefined();
    expect(ContextMenu.Item).toBeDefined();
    expect(ContextMenu.Sub).toBeDefined();
    expect(ContextMenu.SubTrigger).toBeDefined();
    expect(ContextMenu.SubContent).toBeDefined();
  });
});
