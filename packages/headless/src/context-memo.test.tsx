import { render } from '@testing-library/react';
import {
  type ButtonHTMLAttributes,
  type ComponentType,
  forwardRef,
  memo,
  type ReactElement,
} from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Form } from './forms/Form/Form';
import { OneTimePasswordField } from './forms/OneTimePasswordField/OneTimePasswordField';
import { Select } from './forms/Select/Select';
import { Pagination, usePaginationPages } from './navigation/Pagination/Pagination';
import { ContextMenu } from './overlays/ContextMenu/ContextMenu';
import { HoverCard } from './overlays/HoverCard/HoverCard';
import { Menubar } from './overlays/Menubar/Menubar';
import { Tooltip } from './overlays/Tooltip/Tooltip';
import { ScrollArea } from './primitives/ScrollArea/ScrollArea';
import { Accordion } from './stateful/Accordion/Accordion';
import { Collapsible } from './stateful/Collapsible/Collapsible';
import { Tabs } from './stateful/Tabs/Tabs';
import { ToggleGroup } from './stateful/ToggleGroup/ToggleGroup';

/**
 * Context value memoization regression tests.
 *
 * A consumer is wrapped in `memo` and rendered with `asChild` so that the only
 * thing that can re-render it is a *context* change. When the parent re-renders
 * with identical props, a stable context value must not re-render consumers.
 */

interface Counter {
  n: number;
}

function makeCounter() {
  const count: Counter = { n: 0 };
  const Counted = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(
    function Counted(props, ref) {
      count.n += 1;
      return <button type="button" ref={ref} {...props} />;
    },
  );
  return { count, Counted };
}

interface HostProps {
  flip: boolean;
}

interface Scenario {
  name: string;
  Host: ComponentType<HostProps>;
  count: Counter;
}

const EMPTY: string[] = [];
const OPEN_A: string[] = ['a'];

const scenarios: Scenario[] = [];

function add(name: string, Host: ComponentType<HostProps>, count: Counter) {
  scenarios.push({ name, Host, count });
}

// Tabs
{
  const { count, Counted } = makeCounter();
  const Inner = memo(function Inner() {
    return (
      <Tabs.List>
        <Tabs.Trigger asChild value="a">
          <Counted />
        </Tabs.Trigger>
      </Tabs.List>
    );
  });
  add(
    'Tabs',
    ({ flip }) => (
      <Tabs.Root value={flip ? 'b' : 'a'}>
        <Inner />
      </Tabs.Root>
    ),
    count,
  );
}

// Collapsible
{
  const { count, Counted } = makeCounter();
  const Inner = memo(function Inner() {
    return (
      <Collapsible.Trigger asChild>
        <Counted />
      </Collapsible.Trigger>
    );
  });
  add(
    'Collapsible',
    ({ flip }) => (
      <Collapsible.Root open={flip}>
        <Inner />
      </Collapsible.Root>
    ),
    count,
  );
}

// Accordion (single)
{
  const { count, Counted } = makeCounter();
  const Inner = memo(function Inner() {
    return (
      <Accordion.Item value="a">
        <Accordion.Header>
          <Accordion.Trigger asChild>
            <Counted />
          </Accordion.Trigger>
        </Accordion.Header>
      </Accordion.Item>
    );
  });
  add(
    'Accordion (single)',
    ({ flip }) => (
      <Accordion.Root type="single" collapsible value={flip ? 'a' : ''}>
        <Inner />
      </Accordion.Root>
    ),
    count,
  );
}

// Accordion (multiple)
{
  const { count, Counted } = makeCounter();
  const Inner = memo(function Inner() {
    return (
      <Accordion.Item value="a">
        <Accordion.Header>
          <Accordion.Trigger asChild>
            <Counted />
          </Accordion.Trigger>
        </Accordion.Header>
      </Accordion.Item>
    );
  });
  add(
    'Accordion (multiple)',
    ({ flip }) => (
      <Accordion.Root type="multiple" value={flip ? OPEN_A : EMPTY}>
        <Inner />
      </Accordion.Root>
    ),
    count,
  );
}

// ToggleGroup (single)
{
  const { count, Counted } = makeCounter();
  const Inner = memo(function Inner() {
    return (
      <ToggleGroup.Item asChild value="a">
        <Counted />
      </ToggleGroup.Item>
    );
  });
  add(
    'ToggleGroup (single)',
    ({ flip }) => (
      <ToggleGroup.Root type="single" value={flip ? 'a' : ''}>
        <Inner />
      </ToggleGroup.Root>
    ),
    count,
  );
}

// ToggleGroup (multiple)
{
  const { count, Counted } = makeCounter();
  const Inner = memo(function Inner() {
    return (
      <ToggleGroup.Item asChild value="a">
        <Counted />
      </ToggleGroup.Item>
    );
  });
  add(
    'ToggleGroup (multiple)',
    ({ flip }) => (
      <ToggleGroup.Root type="multiple" value={flip ? OPEN_A : EMPTY}>
        <Inner />
      </ToggleGroup.Root>
    ),
    count,
  );
}

// Tooltip
{
  const { count, Counted } = makeCounter();
  const Inner = memo(function Inner() {
    return (
      <Tooltip.Trigger asChild>
        <Counted />
      </Tooltip.Trigger>
    );
  });
  add(
    'Tooltip',
    ({ flip }) => (
      <Tooltip.Root open={flip}>
        <Inner />
      </Tooltip.Root>
    ),
    count,
  );
}

// HoverCard
{
  const { count, Counted } = makeCounter();
  const Inner = memo(function Inner() {
    return (
      <HoverCard.Trigger asChild>
        <Counted />
      </HoverCard.Trigger>
    );
  });
  add(
    'HoverCard',
    ({ flip }) => (
      <HoverCard.Root open={flip}>
        <Inner />
      </HoverCard.Root>
    ),
    count,
  );
}

// ContextMenu (Root + Sub)
{
  const { count, Counted } = makeCounter();
  const Inner = memo(function Inner() {
    return (
      <ContextMenu.SubTrigger asChild>
        <Counted />
      </ContextMenu.SubTrigger>
    );
  });
  add(
    'ContextMenu.Sub',
    ({ flip }) => (
      <ContextMenu.Root>
        <ContextMenu.Sub open={flip}>
          <Inner />
        </ContextMenu.Sub>
      </ContextMenu.Root>
    ),
    count,
  );
}

// Menubar (Menu) — Menu itself sits in Host so it re-renders with the parent
{
  const { count, Counted } = makeCounter();
  const Inner = memo(function Inner() {
    return (
      <Menubar.Trigger asChild>
        <Counted />
      </Menubar.Trigger>
    );
  });
  add(
    'Menubar.Menu',
    ({ flip }) => (
      <Menubar.Root value={flip ? 'm' : ''}>
        <Menubar.Menu value="m">
          <Inner />
        </Menubar.Menu>
      </Menubar.Root>
    ),
    count,
  );
}

// Menubar (Sub)
{
  const { count, Counted } = makeCounter();
  const Inner = memo(function Inner() {
    return (
      <Menubar.SubTrigger asChild>
        <Counted />
      </Menubar.SubTrigger>
    );
  });
  add(
    'Menubar.Sub',
    ({ flip }) => (
      <Menubar.Root defaultValue="m">
        <Menubar.Menu value="m">
          <Menubar.Sub open={flip}>
            <Inner />
          </Menubar.Sub>
        </Menubar.Menu>
      </Menubar.Root>
    ),
    count,
  );
}

// Select
{
  const { count, Counted } = makeCounter();
  const Inner = memo(function Inner() {
    return (
      <Select.Trigger asChild>
        <Counted />
      </Select.Trigger>
    );
  });
  add(
    'Select',
    ({ flip }) => (
      <Select.Root value={flip ? 'x' : ''}>
        <Inner />
      </Select.Root>
    ),
    count,
  );
}

// OneTimePasswordField
{
  const { count, Counted } = makeCounter();
  const Inner = memo(function Inner() {
    return (
      <OneTimePasswordField.Input asChild>
        <Counted />
      </OneTimePasswordField.Input>
    );
  });
  add(
    'OneTimePasswordField',
    ({ flip }) => (
      <OneTimePasswordField.Root value={flip ? '1' : ''}>
        <Inner />
      </OneTimePasswordField.Root>
    ),
    count,
  );
}

// Form.Field
{
  const { count, Counted } = makeCounter();
  const Inner = memo(function Inner() {
    return (
      <Form.Control asChild>
        <Counted />
      </Form.Control>
    );
  });
  add(
    'Form.Field',
    ({ flip }) => (
      <Form.Root>
        <Form.Field name="email" serverInvalid={flip}>
          <Inner />
        </Form.Field>
      </Form.Root>
    ),
    count,
  );
}

// Pagination (consumer hook — Pagination has no asChild parts)
{
  const count: Counter = { n: 0 };
  const Probe = memo(function Probe() {
    count.n += 1;
    usePaginationPages();
    return null;
  });
  add(
    'Pagination',
    ({ flip }) => (
      <Pagination.Root pageCount={10} page={flip ? 2 : 1}>
        <Probe />
      </Pagination.Root>
    ),
    count,
  );
}

// ScrollArea (Root -> Viewport)
{
  const { count, Counted } = makeCounter();
  const Inner = memo(function Inner() {
    return (
      <ScrollArea.Viewport asChild>
        <Counted />
      </ScrollArea.Viewport>
    );
  });
  add(
    'ScrollArea.Viewport',
    ({ flip }) => (
      <ScrollArea.Root type="always" scrollHideDelay={flip ? 100 : 600}>
        <Inner />
      </ScrollArea.Root>
    ),
    count,
  );
}

// ScrollArea (Scrollbar -> Thumb)
{
  const { count, Counted } = makeCounter();
  const Inner = memo(function Inner() {
    return (
      <ScrollArea.Thumb asChild>
        <Counted />
      </ScrollArea.Thumb>
    );
  });
  add(
    'ScrollArea.Scrollbar',
    ({ flip }) => (
      <ScrollArea.Root type="always">
        <ScrollArea.Scrollbar orientation={flip ? 'horizontal' : 'vertical'}>
          <Inner />
        </ScrollArea.Scrollbar>
      </ScrollArea.Root>
    ),
    count,
  );
}

describe('context value memoization — happy path', () => {
  it.each(scenarios)('$name: same-props parent re-render does not re-render consumers', ({
    Host,
    count,
  }) => {
    const { rerender } = render(<Host flip={false} />);
    // let any mount-time settling happen before taking the baseline
    rerender(<Host flip={false} />);
    const baseline = count.n;
    expect(baseline).toBeGreaterThan(0);

    rerender(<Host flip={false} />);
    rerender(<Host flip={false} />);

    expect(count.n).toBe(baseline);
  });
});

describe('context value memoization — memo must not swallow real changes (edge)', () => {
  it.each(scenarios)('$name: consumers re-render when the context value really changes', ({
    Host,
    count,
  }) => {
    const { rerender } = render(<Host flip={false} />);
    rerender(<Host flip={false} />);
    const baseline = count.n;

    rerender(<Host flip={true} />);

    expect(count.n).toBeGreaterThan(baseline);
  });
});

describe('context value memoization — malformed usage outside Root (error)', () => {
  const outside: Array<[string, () => ReactElement]> = [
    ['Tabs.Trigger', () => <Tabs.Trigger value="a">x</Tabs.Trigger>],
    ['Collapsible.Trigger', () => <Collapsible.Trigger>x</Collapsible.Trigger>],
    ['Accordion.Trigger', () => <Accordion.Trigger>x</Accordion.Trigger>],
    ['ToggleGroup.Item', () => <ToggleGroup.Item value="a">x</ToggleGroup.Item>],
    ['Tooltip.Trigger', () => <Tooltip.Trigger>x</Tooltip.Trigger>],
    ['HoverCard.Trigger', () => <HoverCard.Trigger>x</HoverCard.Trigger>],
    ['ContextMenu.SubTrigger', () => <ContextMenu.SubTrigger>x</ContextMenu.SubTrigger>],
    ['Menubar.Trigger', () => <Menubar.Trigger>x</Menubar.Trigger>],
    ['Select.Trigger', () => <Select.Trigger>x</Select.Trigger>],
    ['OneTimePasswordField.Input', () => <OneTimePasswordField.Input />],
    ['Form.Control', () => <Form.Control />],
    ['Pagination.Page', () => <Pagination.Page page={1}>1</Pagination.Page>],
    ['ScrollArea.Viewport', () => <ScrollArea.Viewport>x</ScrollArea.Viewport>],
    ['ScrollArea.Thumb', () => <ScrollArea.Thumb />],
  ];

  it.each(outside)('%s throws when rendered outside its Root', (_name, build) => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      expect(() => render(build())).toThrow(/inside/);
    } finally {
      spy.mockRestore();
    }
  });
});
