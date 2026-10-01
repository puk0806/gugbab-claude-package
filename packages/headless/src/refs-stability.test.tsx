import { act, render } from '@testing-library/react';
import { createRef, type ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Select } from './forms/Select/Select';
import { HoverCard } from './overlays/HoverCard/HoverCard';
import { Menubar } from './overlays/Menubar/Menubar';
import { Tooltip } from './overlays/Tooltip/Tooltip';
import { Accordion } from './stateful/Accordion/Accordion';
import { Collapsible } from './stateful/Collapsible/Collapsible';

/**
 * 병합 ref 안정성 — 부모가 무관한 prop 으로 리렌더돼도 소비자 콜백 ref 가
 * null → node 로 재호출되면 안 된다 (인라인 클로저는 매 렌더 identity 가 바뀐다).
 */

const settle = () => act(async () => {});
const RERENDERS = 3;

const nullCalls = (spy: ReturnType<typeof vi.fn>) =>
  spy.mock.calls.filter((args) => args[0] === null).length;

async function rerenderUnrelated(
  build: (n: number) => ReactElement,
  spy: ReturnType<typeof vi.fn>,
) {
  const { rerender, unmount } = render(build(0));
  await settle();
  expect(spy).toHaveBeenCalled();
  // list items re-register once after mount (index assignment); measure only rerender churn
  const baseline = nullCalls(spy);
  for (let i = 1; i <= RERENDERS; i += 1) {
    rerender(build(i));
    await settle();
  }
  const whileMounted = nullCalls(spy) - baseline;
  return { whileMounted, unmount };
}

describe('merged ref stability (unrelated parent rerender)', () => {
  it('Tooltip.Trigger', async () => {
    const spy = vi.fn();
    const { whileMounted } = await rerenderUnrelated(
      (n) => (
        <Tooltip.Root>
          <Tooltip.Trigger ref={spy} data-n={n}>
            t
          </Tooltip.Trigger>
        </Tooltip.Root>
      ),
      spy,
    );
    expect(whileMounted).toBe(0);
  });

  it('Tooltip.Content', async () => {
    const spy = vi.fn();
    const { whileMounted } = await rerenderUnrelated(
      (n) => (
        <Tooltip.Root defaultOpen>
          <Tooltip.Trigger>t</Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content ref={spy} data-n={n}>
              c
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      ),
      spy,
    );
    expect(whileMounted).toBe(0);
  });

  it('HoverCard.Trigger', async () => {
    const spy = vi.fn();
    const { whileMounted } = await rerenderUnrelated(
      (n) => (
        <HoverCard.Root>
          <HoverCard.Trigger ref={spy} data-n={n}>
            t
          </HoverCard.Trigger>
        </HoverCard.Root>
      ),
      spy,
    );
    expect(whileMounted).toBe(0);
  });

  it('Menubar.Trigger', async () => {
    const spy = vi.fn();
    const { whileMounted } = await rerenderUnrelated(
      (n) => (
        <Menubar.Root>
          <Menubar.Menu value="file">
            <Menubar.Trigger ref={spy} data-n={n}>
              File
            </Menubar.Trigger>
          </Menubar.Menu>
        </Menubar.Root>
      ),
      spy,
    );
    expect(whileMounted).toBe(0);
  });

  it('Menubar.Item', async () => {
    const spy = vi.fn();
    const { whileMounted } = await rerenderUnrelated(
      (n) => (
        <Menubar.Root defaultValue="file">
          <Menubar.Menu value="file">
            <Menubar.Trigger>File</Menubar.Trigger>
            <Menubar.Portal>
              <Menubar.Content>
                <Menubar.Item ref={spy} data-n={n}>
                  Open
                </Menubar.Item>
              </Menubar.Content>
            </Menubar.Portal>
          </Menubar.Menu>
        </Menubar.Root>
      ),
      spy,
    );
    expect(whileMounted).toBe(0);
  });

  it('Select.Trigger', async () => {
    const spy = vi.fn();
    const { whileMounted } = await rerenderUnrelated(
      (n) => (
        <Select.Root>
          <Select.Trigger ref={spy} data-n={n} aria-label="fruit">
            <Select.Value placeholder="Pick" />
          </Select.Trigger>
        </Select.Root>
      ),
      spy,
    );
    expect(whileMounted).toBe(0);
  });

  it('Select.Item', async () => {
    const spy = vi.fn();
    const { whileMounted } = await rerenderUnrelated(
      (n) => (
        <Select.Root defaultOpen>
          <Select.Trigger aria-label="fruit">
            <Select.Value placeholder="Pick" />
          </Select.Trigger>
          <Select.Portal>
            <Select.Content>
              <Select.Viewport>
                <Select.Item ref={spy} value="apple" data-n={n}>
                  Apple
                </Select.Item>
              </Select.Viewport>
            </Select.Content>
          </Select.Portal>
        </Select.Root>
      ),
      spy,
    );
    expect(whileMounted).toBe(0);
  });

  it('Collapsible.Content', async () => {
    const spy = vi.fn();
    const { whileMounted } = await rerenderUnrelated(
      (n) => (
        <Collapsible.Root defaultOpen>
          <Collapsible.Trigger>t</Collapsible.Trigger>
          <Collapsible.Content ref={spy} data-n={n}>
            body
          </Collapsible.Content>
        </Collapsible.Root>
      ),
      spy,
    );
    expect(whileMounted).toBe(0);
  });

  it('Accordion.Content', async () => {
    const spy = vi.fn();
    const { whileMounted } = await rerenderUnrelated(
      (n) => (
        <Accordion.Root type="single" defaultValue="a" collapsible>
          <Accordion.Item value="a">
            <Accordion.Header>
              <Accordion.Trigger>A</Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content ref={spy} data-n={n}>
              body
            </Accordion.Content>
          </Accordion.Item>
        </Accordion.Root>
      ),
      spy,
    );
    expect(whileMounted).toBe(0);
  });
});

describe('merged ref boundaries', () => {
  it('callback ref receives null exactly once, on unmount', async () => {
    const spy = vi.fn();
    const { whileMounted, unmount } = await rerenderUnrelated(
      (n) => (
        <Collapsible.Root defaultOpen>
          <Collapsible.Content ref={spy} data-n={n}>
            body
          </Collapsible.Content>
        </Collapsible.Root>
      ),
      spy,
    );
    expect(whileMounted).toBe(0);
    unmount();
    expect(nullCalls(spy)).toBe(1);
  });

  it('object ref gets the node and is cleared on unmount', async () => {
    const ref = createRef<HTMLButtonElement>();
    const { unmount } = render(
      <Tooltip.Root>
        <Tooltip.Trigger ref={ref}>t</Tooltip.Trigger>
      </Tooltip.Root>,
    );
    await settle();
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    unmount();
    expect(ref.current).toBeNull();
  });

  it('works with no ref supplied (undefined)', async () => {
    const { getByText } = render(
      <HoverCard.Root>
        <HoverCard.Trigger>t</HoverCard.Trigger>
      </HoverCard.Root>,
    );
    await settle();
    expect(getByText('t')).toBeTruthy();
  });
});

describe('misuse outside Root', () => {
  it('Tooltip.Trigger throws outside Tooltip.Root', () => {
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Tooltip.Trigger>t</Tooltip.Trigger>)).toThrow();
    err.mockRestore();
  });

  it('Menubar.Trigger throws outside Menubar.Menu', () => {
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Menubar.Trigger>t</Menubar.Trigger>)).toThrow();
    err.mockRestore();
  });
});
