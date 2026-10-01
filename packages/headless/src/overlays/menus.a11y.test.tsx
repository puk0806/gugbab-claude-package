/**
 * axe-core smoke for HoverCard·ContextMenu·Menubar in their open state.
 * (Popover·DropdownMenu·AlertDialog·Tooltip are covered by overlays.a11y.test.tsx.)
 * jsdom cannot evaluate colour contrast or layout.
 */
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { ContextMenu } from './ContextMenu';
import { HoverCard } from './HoverCard';
import { Menubar } from './Menubar';

// jsdom reports navigator.vendor "Apple Computer, Inc." → floating-ui takes its
// Safari path (focus guards with role="button", no aria-hidden — a deliberate
// upstream trade-off). Audit as Chromium; see forms.a11y.test.tsx.
const realVendor = Object.getOwnPropertyDescriptor(Navigator.prototype, 'vendor');
beforeAll(() => {
  Object.defineProperty(navigator, 'vendor', { value: 'Google Inc.', configurable: true });
});
afterAll(() => {
  // Remove the own-property override so the prototype getter is used again.
  delete (navigator as unknown as Record<string, unknown>).vendor;
  if (realVendor) Object.defineProperty(Navigator.prototype, 'vendor', realVendor);
});

beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }));
afterEach(() => vi.useRealTimers());

function flush() {
  act(() => {
    vi.runOnlyPendingTimers();
  });
}

async function expectNoViolations(container: Element) {
  vi.useRealTimers();
  // `region` is a page-level landmark rule — not meaningful for an isolated render.
  expect(await axe(container, { rules: { region: { enabled: false } } })).toHaveNoViolations();
}

describe('a11y: 메뉴·호버카드 (열린 상태)', () => {
  it('HoverCard', async () => {
    render(
      <HoverCard.Root defaultOpen>
        <HoverCard.Trigger href="/u">@user</HoverCard.Trigger>
        <HoverCard.Portal>
          <HoverCard.Content>Profile preview</HoverCard.Content>
        </HoverCard.Portal>
      </HoverCard.Root>,
    );
    flush();
    await expectNoViolations(document.body);
  });

  it('ContextMenu', async () => {
    render(
      <ContextMenu.Root>
        <ContextMenu.Trigger>
          <div>right-click area</div>
        </ContextMenu.Trigger>
        <ContextMenu.Portal>
          <ContextMenu.Content aria-label="context actions">
            <ContextMenu.Item>Copy</ContextMenu.Item>
          </ContextMenu.Content>
        </ContextMenu.Portal>
      </ContextMenu.Root>,
    );
    fireEvent.contextMenu(screen.getByText('right-click area'));
    flush();
    await expectNoViolations(document.body);
  });

  it('Menubar', async () => {
    render(
      <Menubar.Root defaultValue="file">
        <Menubar.Menu value="file">
          <Menubar.Trigger>File</Menubar.Trigger>
          <Menubar.Portal>
            <Menubar.Content aria-label="file menu">
              <Menubar.Item>New</Menubar.Item>
            </Menubar.Content>
          </Menubar.Portal>
        </Menubar.Menu>
      </Menubar.Root>,
    );
    flush();
    await expectNoViolations(document.body);
  });

  it('메뉴가 하나뿐이고 비활성 항목만 있는 Menubar 도 위반이 없다 (경계)', async () => {
    render(
      <Menubar.Root defaultValue="edit">
        <Menubar.Menu value="edit">
          <Menubar.Trigger>Edit</Menubar.Trigger>
          <Menubar.Portal>
            <Menubar.Content aria-label="edit menu">
              <Menubar.Item disabled>Undo</Menubar.Item>
            </Menubar.Content>
          </Menubar.Portal>
        </Menubar.Menu>
      </Menubar.Root>,
    );
    flush();
    await expectNoViolations(document.body);
  });

  it('Root 밖의 Content 는 명확한 에러로 거부한다 (오용)', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<HoverCard.Content>x</HoverCard.Content>)).toThrow();
    expect(() => render(<ContextMenu.Content>x</ContextMenu.Content>)).toThrow();
    spy.mockRestore();
  });
});
