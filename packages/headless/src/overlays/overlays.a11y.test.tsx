/**
 * axe-core smoke for overlays (open state) + remaining navigation/primitives.
 * HoverCard·ContextMenu·Menubar live on the priority-1 branch (same files as
 * their fixes there).
 * jsdom cannot evaluate colour contrast or layout.
 */
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { Toolbar } from '../navigation/Toolbar';
import { AspectRatio } from '../primitives/AspectRatio';
import { ScrollArea } from '../primitives/ScrollArea';
import { AlertDialog } from './AlertDialog';
import { DropdownMenu } from './DropdownMenu';
import { Popover } from './Popover';
import { Tooltip } from './Tooltip';

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

describe('a11y: overlays (열린 상태)', () => {
  it('Popover', async () => {
    render(
      <Popover.Root>
        <Popover.Trigger>open</Popover.Trigger>
        <Popover.Portal>
          <Popover.Content aria-label="details">
            <button type="button">inside</button>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>,
    );
    fireEvent.click(screen.getByText('open'));
    flush();
    await expectNoViolations(document.body);
  });

  it('DropdownMenu (서브메뉴 포함)', async () => {
    render(
      <DropdownMenu.Root defaultOpen>
        <DropdownMenu.Trigger>menu</DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content aria-label="actions">
            <DropdownMenu.Item>Edit</DropdownMenu.Item>
            <DropdownMenu.CheckboxItem checked>Pinned</DropdownMenu.CheckboxItem>
            <DropdownMenu.Sub defaultOpen>
              <DropdownMenu.SubTrigger>More</DropdownMenu.SubTrigger>
              <DropdownMenu.SubContent aria-label="more actions">
                <DropdownMenu.Item>Archive</DropdownMenu.Item>
              </DropdownMenu.SubContent>
            </DropdownMenu.Sub>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>,
    );
    flush();
    await expectNoViolations(document.body);
  });

  it('AlertDialog', async () => {
    render(
      <AlertDialog.Root defaultOpen>
        <AlertDialog.Trigger>delete</AlertDialog.Trigger>
        <AlertDialog.Portal>
          <AlertDialog.Overlay />
          <AlertDialog.Content>
            <AlertDialog.Title>Delete file?</AlertDialog.Title>
            <AlertDialog.Description>This cannot be undone.</AlertDialog.Description>
            <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
            <AlertDialog.Action>Delete</AlertDialog.Action>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>,
    );
    flush();
    await expectNoViolations(document.body);
  });

  it('Tooltip', async () => {
    render(
      <Tooltip.Provider>
        <Tooltip.Root defaultOpen>
          <Tooltip.Trigger>info</Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content>More information</Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      </Tooltip.Provider>,
    );
    flush();
    await expectNoViolations(document.body);
  });
});

describe('a11y: navigation·primitives 나머지', () => {
  it('Toolbar', async () => {
    const { container } = render(
      <Toolbar.Root aria-label="formatting">
        <Toolbar.Button>Bold</Toolbar.Button>
        <Toolbar.Separator />
        <Toolbar.Link href="/help">Help</Toolbar.Link>
      </Toolbar.Root>,
    );
    await expectNoViolations(container);
  });

  it('ScrollArea·AspectRatio', async () => {
    const { container } = render(
      <>
        <ScrollArea.Root>
          <ScrollArea.Viewport>
            <p>long content</p>
          </ScrollArea.Viewport>
          <ScrollArea.Scrollbar orientation="vertical">
            <ScrollArea.Thumb />
          </ScrollArea.Scrollbar>
        </ScrollArea.Root>
        <AspectRatio ratio={16 / 9}>
          <img src="x.png" alt="cover" />
        </AspectRatio>
      </>,
    );
    await expectNoViolations(container);
  });

  it('Root 밖의 Content 는 명확한 에러로 거부한다 (오용)', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Popover.Content>x</Popover.Content>)).toThrow('must be used inside');
    expect(() => render(<DropdownMenu.Content>x</DropdownMenu.Content>)).toThrow(
      'must be used inside',
    );
    spy.mockRestore();
  });

  it('이름 없는 Popover 콘텐츠(dialog)는 axe 가 위반으로 잡는다 (검사기 자체 확인·경계)', async () => {
    render(
      <Popover.Root defaultOpen>
        <Popover.Trigger>open</Popover.Trigger>
        <Popover.Portal>
          <Popover.Content>
            <button type="button">inside</button>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>,
    );
    flush();
    vi.useRealTimers();
    const results = await axe(document.body, { rules: { region: { enabled: false } } });
    expect(results.violations.map((v) => v.id)).toContain('aria-dialog-name');
  });
});
