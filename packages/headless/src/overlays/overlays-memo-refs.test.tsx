import { act, render } from '@testing-library/react';
import {
  type ButtonHTMLAttributes,
  createRef,
  forwardRef,
  memo,
  type ReactElement,
  type ReactNode,
} from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Checkbox } from '../stateful/Checkbox/Checkbox';
import { RadioGroup } from '../stateful/RadioGroup/RadioGroup';
import { Switch } from '../stateful/Switch/Switch';
import { Dialog } from './Dialog/Dialog';
import { DropdownMenu } from './DropdownMenu/DropdownMenu';
import { Popover } from './Popover/Popover';

/**
 * Context value 메모이제이션 + 병합 ref 안정성.
 *
 * - 메모 테스트: asChild 자식(forwardRef)의 렌더 횟수를 센다. memo 래퍼로 감싼 하위 트리는
 *   부모 props가 같아도 context value 객체가 새로 만들어지면 다시 렌더된다.
 *   (React Profiler는 memo로 막힌 렌더를 구분하지 못해 쓰지 않는다.)
 * - ref 테스트: 소비자 콜백 ref가 부모 리렌더마다 null → node 로 재호출되면 안 된다.
 */

const settle = () => act(async () => {});

function createCountingButton() {
  const counter = { renders: 0 };
  const CountingButton = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(
    function CountingButton(props, ref) {
      counter.renders += 1;
      return <button type="button" ref={ref} {...props} />;
    },
  );
  return { counter, CountingButton };
}

/** children 은 테스트 안에서 한 번만 만든 element 를 넘긴다 — 같은 identity 라 memo 가 유지된다. */
const Isolate = memo(function Isolate({ children }: { children: ReactNode }) {
  return <>{children}</>;
});

describe('context value memoization (same props rerender)', () => {
  it('Dialog: consumers under memo do not rerender when Root rerenders with same props', async () => {
    const { counter, CountingButton } = createCountingButton();
    const child = (
      <Dialog.Trigger asChild>
        <CountingButton>open</CountingButton>
      </Dialog.Trigger>
    );
    const ui = (
      <Dialog.Root>
        <Isolate>{child}</Isolate>
      </Dialog.Root>
    );
    const { rerender } = render(ui);
    await settle();
    const before = counter.renders;
    rerender(
      <Dialog.Root>
        <Isolate>{child}</Isolate>
      </Dialog.Root>,
    );
    await settle();
    expect(counter.renders).toBe(before);
  });

  it('Dialog: rerenders consumers when open actually changes', async () => {
    const { counter, CountingButton } = createCountingButton();
    const child = (
      <Dialog.Trigger asChild>
        <CountingButton>open</CountingButton>
      </Dialog.Trigger>
    );
    const Harness = ({ open }: { open: boolean }) => (
      <Dialog.Root open={open}>
        <Isolate>{child}</Isolate>
      </Dialog.Root>
    );
    const { rerender, getByRole } = render(<Harness open={false} />);
    await settle();
    const before = counter.renders;
    rerender(<Harness open />);
    await settle();
    expect(counter.renders).toBeGreaterThan(before);
    expect(getByRole('button').getAttribute('aria-expanded')).toBe('true');
  });

  it('Popover: consumers under memo do not rerender with same props', async () => {
    const { counter, CountingButton } = createCountingButton();
    const child = (
      <Popover.Trigger asChild>
        <CountingButton>open</CountingButton>
      </Popover.Trigger>
    );
    const Harness = () => (
      <Popover.Root>
        <Isolate>{child}</Isolate>
      </Popover.Root>
    );
    const { rerender } = render(<Harness />);
    await settle();
    const before = counter.renders;
    rerender(<Harness />);
    await settle();
    expect(counter.renders).toBe(before);
  });

  it('Popover: rerenders consumers when open changes', async () => {
    const { counter, CountingButton } = createCountingButton();
    const child = (
      <Popover.Trigger asChild>
        <CountingButton>open</CountingButton>
      </Popover.Trigger>
    );
    const Harness = ({ open }: { open: boolean }) => (
      <Popover.Root open={open}>
        <Isolate>{child}</Isolate>
      </Popover.Root>
    );
    const { rerender } = render(<Harness open={false} />);
    await settle();
    const before = counter.renders;
    rerender(<Harness open />);
    await settle();
    expect(counter.renders).toBeGreaterThan(before);
  });

  it('DropdownMenu.Root: consumers under memo do not rerender with same props', async () => {
    const { counter, CountingButton } = createCountingButton();
    const child = (
      <DropdownMenu.Trigger asChild>
        <CountingButton>menu</CountingButton>
      </DropdownMenu.Trigger>
    );
    const Harness = () => (
      <DropdownMenu.Root>
        <Isolate>{child}</Isolate>
      </DropdownMenu.Root>
    );
    const { rerender } = render(<Harness />);
    await settle();
    const before = counter.renders;
    rerender(<Harness />);
    await settle();
    expect(counter.renders).toBe(before);
  });

  it('DropdownMenu.Root: rerenders consumers when open changes', async () => {
    const { counter, CountingButton } = createCountingButton();
    const child = (
      <DropdownMenu.Trigger asChild>
        <CountingButton>menu</CountingButton>
      </DropdownMenu.Trigger>
    );
    const Harness = ({ open }: { open: boolean }) => (
      <DropdownMenu.Root open={open}>
        <Isolate>{child}</Isolate>
      </DropdownMenu.Root>
    );
    const { rerender } = render(<Harness open={false} />);
    await settle();
    const before = counter.renders;
    rerender(<Harness open />);
    await settle();
    expect(counter.renders).toBeGreaterThan(before);
  });

  it('DropdownMenu.Sub: SubTrigger under memo does not rerender with same props', async () => {
    const { counter, CountingButton } = createCountingButton();
    const child = (
      <DropdownMenu.SubTrigger asChild>
        <CountingButton>more</CountingButton>
      </DropdownMenu.SubTrigger>
    );
    const Harness = () => (
      <DropdownMenu.Root defaultOpen>
        <DropdownMenu.Content>
          <DropdownMenu.Sub>
            <Isolate>{child}</Isolate>
          </DropdownMenu.Sub>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    );
    const { rerender } = render(<Harness />);
    await settle();
    const before = counter.renders;
    rerender(<Harness />);
    await settle();
    expect(counter.renders).toBe(before);
  });

  it('DropdownMenu.Sub: rerenders SubTrigger when sub open changes', async () => {
    const { counter, CountingButton } = createCountingButton();
    const child = (
      <DropdownMenu.SubTrigger asChild>
        <CountingButton>more</CountingButton>
      </DropdownMenu.SubTrigger>
    );
    const Harness = ({ subOpen }: { subOpen: boolean }) => (
      <DropdownMenu.Root defaultOpen>
        <DropdownMenu.Content>
          <DropdownMenu.Sub open={subOpen}>
            <Isolate>{child}</Isolate>
          </DropdownMenu.Sub>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    );
    const { rerender } = render(<Harness subOpen={false} />);
    await settle();
    const before = counter.renders;
    rerender(<Harness subOpen />);
    await settle();
    expect(counter.renders).toBeGreaterThan(before);
  });

  it('RadioGroup: Item under memo does not rerender with same props', async () => {
    const { counter, CountingButton } = createCountingButton();
    const child = (
      <RadioGroup.Item value="a" asChild>
        <CountingButton>a</CountingButton>
      </RadioGroup.Item>
    );
    const Harness = ({ value }: { value: string }) => (
      <RadioGroup.Root value={value} onValueChange={() => {}}>
        <Isolate>{child}</Isolate>
      </RadioGroup.Root>
    );
    const { rerender } = render(<Harness value="a" />);
    await settle();
    const before = counter.renders;
    rerender(<Harness value="a" />);
    await settle();
    expect(counter.renders).toBe(before);
  });

  it('RadioGroup: rerenders Item when value changes', async () => {
    const { counter, CountingButton } = createCountingButton();
    const child = (
      <RadioGroup.Item value="a" asChild>
        <CountingButton>a</CountingButton>
      </RadioGroup.Item>
    );
    const Harness = ({ value }: { value: string }) => (
      <RadioGroup.Root value={value} onValueChange={() => {}}>
        <Isolate>{child}</Isolate>
      </RadioGroup.Root>
    );
    const { rerender, getByRole } = render(<Harness value="a" />);
    await settle();
    const before = counter.renders;
    rerender(<Harness value="b" />);
    await settle();
    expect(counter.renders).toBeGreaterThan(before);
    expect(getByRole('radio').getAttribute('aria-checked')).toBe('false');
  });

  it('RadioGroup: rerenders Item when dir changes (focus logic keeps working)', async () => {
    const { counter, CountingButton } = createCountingButton();
    const child = (
      <RadioGroup.Item value="a" asChild>
        <CountingButton>a</CountingButton>
      </RadioGroup.Item>
    );
    const Harness = ({ dir }: { dir: 'ltr' | 'rtl' }) => (
      <RadioGroup.Root defaultValue="a" dir={dir} orientation="horizontal">
        <Isolate>{child}</Isolate>
      </RadioGroup.Root>
    );
    const { rerender } = render(<Harness dir="ltr" />);
    await settle();
    const before = counter.renders;
    rerender(<Harness dir="rtl" />);
    await settle();
    expect(counter.renders).toBeGreaterThan(before);
  });
});

/**
 * 콜백 ref 가 부모 리렌더마다 재호출되지 않아야 한다.
 * ui(spy) 를 mount → rerender 하고 호출 횟수가 같은지 확인.
 */
async function expectStableCallbackRef(
  ui: (ref: (node: HTMLElement | null) => void) => ReactElement,
) {
  const spy = vi.fn<(node: HTMLElement | null) => void>();
  const { rerender, unmount } = render(ui(spy));
  await settle();
  const mountCalls = spy.mock.calls.length;
  expect(mountCalls).toBeGreaterThan(0);
  expect(spy.mock.calls.at(-1)?.[0]).toBeInstanceOf(HTMLElement);

  rerender(ui(spy));
  rerender(ui(spy));
  await settle();
  expect(spy.mock.calls.length).toBe(mountCalls);

  unmount();
  // 언마운트 시에는 null 로 정리된다
  expect(spy.mock.calls.at(-1)?.[0]).toBeNull();
}

describe('merged refs are stable across parent rerenders', () => {
  it('Dialog.Trigger', async () => {
    await expectStableCallbackRef((ref) => (
      <Dialog.Root>
        <Dialog.Trigger ref={ref}>open</Dialog.Trigger>
      </Dialog.Root>
    ));
  });

  it('Dialog.Content', async () => {
    await expectStableCallbackRef((ref) => (
      <Dialog.Root defaultOpen>
        <Dialog.Content ref={ref}>
          <Dialog.Title>t</Dialog.Title>
        </Dialog.Content>
      </Dialog.Root>
    ));
  });

  it('Popover.Trigger', async () => {
    await expectStableCallbackRef((ref) => (
      <Popover.Root>
        <Popover.Trigger ref={ref}>open</Popover.Trigger>
      </Popover.Root>
    ));
  });

  it('Popover.Content', async () => {
    await expectStableCallbackRef((ref) => (
      <Popover.Root defaultOpen>
        <Popover.Content ref={ref}>body</Popover.Content>
      </Popover.Root>
    ));
  });

  it('Popover.Anchor', async () => {
    await expectStableCallbackRef((ref) => (
      <Popover.Root>
        <Popover.Anchor ref={ref}>anchor</Popover.Anchor>
      </Popover.Root>
    ));
  });

  it('DropdownMenu.Trigger', async () => {
    await expectStableCallbackRef((ref) => (
      <DropdownMenu.Root>
        <DropdownMenu.Trigger ref={ref}>menu</DropdownMenu.Trigger>
      </DropdownMenu.Root>
    ));
  });

  it('DropdownMenu.Content / Item / CheckboxItem / RadioItem', async () => {
    await expectStableCallbackRef((ref) => (
      <DropdownMenu.Root defaultOpen>
        <DropdownMenu.Content ref={ref}>x</DropdownMenu.Content>
      </DropdownMenu.Root>
    ));
    await expectStableCallbackRef((ref) => (
      <DropdownMenu.Root defaultOpen>
        <DropdownMenu.Content>
          <DropdownMenu.Item ref={ref}>item</DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    ));
    await expectStableCallbackRef((ref) => (
      <DropdownMenu.Root defaultOpen>
        <DropdownMenu.Content>
          <DropdownMenu.CheckboxItem ref={ref}>item</DropdownMenu.CheckboxItem>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    ));
    await expectStableCallbackRef((ref) => (
      <DropdownMenu.Root defaultOpen>
        <DropdownMenu.Content>
          <DropdownMenu.RadioGroup defaultValue="a">
            <DropdownMenu.RadioItem value="a" ref={ref}>
              a
            </DropdownMenu.RadioItem>
          </DropdownMenu.RadioGroup>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    ));
  });

  it('DropdownMenu.SubTrigger / SubContent', async () => {
    await expectStableCallbackRef((ref) => (
      <DropdownMenu.Root defaultOpen>
        <DropdownMenu.Content>
          <DropdownMenu.Sub>
            <DropdownMenu.SubTrigger ref={ref}>more</DropdownMenu.SubTrigger>
          </DropdownMenu.Sub>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    ));
    await expectStableCallbackRef((ref) => (
      <DropdownMenu.Root defaultOpen>
        <DropdownMenu.Content>
          <DropdownMenu.Sub defaultOpen>
            <DropdownMenu.SubTrigger>more</DropdownMenu.SubTrigger>
            <DropdownMenu.SubContent ref={ref}>sub</DropdownMenu.SubContent>
          </DropdownMenu.Sub>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    ));
  });

  it('Switch.Root', async () => {
    await expectStableCallbackRef((ref) => <Switch.Root ref={ref} />);
  });

  it('Checkbox.Root', async () => {
    await expectStableCallbackRef((ref) => <Checkbox.Root ref={ref} />);
  });
});

describe('object refs still receive nodes', () => {
  it('Dialog.Trigger / Popover.Trigger / DropdownMenu.Trigger / Switch / Checkbox', () => {
    const dialog = createRef<HTMLButtonElement>();
    const popover = createRef<HTMLButtonElement>();
    const menu = createRef<HTMLButtonElement>();
    const sw = createRef<HTMLButtonElement>();
    const cb = createRef<HTMLButtonElement>();
    const { unmount } = render(
      <>
        <Dialog.Root>
          <Dialog.Trigger ref={dialog}>d</Dialog.Trigger>
        </Dialog.Root>
        <Popover.Root>
          <Popover.Trigger ref={popover}>p</Popover.Trigger>
        </Popover.Root>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger ref={menu}>m</DropdownMenu.Trigger>
        </DropdownMenu.Root>
        <Switch.Root ref={sw} />
        <Checkbox.Root ref={cb} />
      </>,
    );
    for (const r of [dialog, popover, menu, sw, cb]) {
      expect(r.current).toBeInstanceOf(HTMLButtonElement);
    }
    unmount();
    // 언마운트 → null
    for (const r of [dialog, popover, menu, sw, cb]) {
      expect(r.current).toBeNull();
    }
  });

  it('Dialog.Content object ref is nulled when content unmounts on close', async () => {
    const ref = createRef<HTMLDivElement>();
    const Harness = ({ open }: { open: boolean }) => (
      <Dialog.Root open={open}>
        <Dialog.Content ref={ref}>
          <Dialog.Title>t</Dialog.Title>
        </Dialog.Content>
      </Dialog.Root>
    );
    const { rerender } = render(<Harness open />);
    await settle();
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    rerender(<Harness open={false} />);
    await settle();
    expect(ref.current).toBeNull();
  });

  it('changing the consumer ref swaps the target (old gets null, new gets node)', () => {
    const first = vi.fn();
    const second = vi.fn();
    const { rerender } = render(<Switch.Root ref={first} />);
    rerender(<Switch.Root ref={second} />);
    expect(first.mock.calls.at(-1)?.[0]).toBeNull();
    expect(second.mock.calls.at(-1)?.[0]).toBeInstanceOf(HTMLButtonElement);
  });
});

describe('misuse / edge cases', () => {
  it.each([
    ['Dialog.Trigger', () => <Dialog.Trigger>x</Dialog.Trigger>, /Dialog\.Root/],
    ['Popover.Trigger', () => <Popover.Trigger>x</Popover.Trigger>, /Popover\.Root/],
    [
      'DropdownMenu.Trigger',
      () => <DropdownMenu.Trigger>x</DropdownMenu.Trigger>,
      /DropdownMenu\.Root/,
    ],
    [
      'DropdownMenu.SubTrigger',
      () => <DropdownMenu.SubTrigger>x</DropdownMenu.SubTrigger>,
      /DropdownMenu\.Sub/,
    ],
    ['RadioGroup.Item', () => <RadioGroup.Item value="a">x</RadioGroup.Item>, /RadioGroup\.Root/],
  ])('%s outside its Root throws', (_name, ui, message) => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(ui())).toThrow(message);
    spy.mockRestore();
  });
});
