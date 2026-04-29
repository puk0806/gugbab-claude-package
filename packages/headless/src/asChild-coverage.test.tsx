/**
 * asChild coverage — verifies that Trigger/Item/Close subcomponents render
 * the consumer's element (preserving its tag and attributes) while still
 * applying the component's behavior props (data-state, aria-*, handlers).
 *
 * Each test passes a custom child (<a>, <button>, etc.) and asserts:
 *   1. rendered tag matches the child element
 *   2. consumer's own attributes are preserved (href, custom class)
 *   3. component's behavior attributes are merged onto the child
 */
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DropdownMenu } from './overlays/DropdownMenu';
import { HoverCard } from './overlays/HoverCard';
import { Popover } from './overlays/Popover';
import { Tooltip } from './overlays/Tooltip';
import { Accordion } from './stateful/Accordion';
import { Checkbox } from './stateful/Checkbox';
import { Collapsible } from './stateful/Collapsible';
import { RadioGroup } from './stateful/RadioGroup';
import { Switch } from './stateful/Switch';
import { Tabs } from './stateful/Tabs';
import { Toggle } from './stateful/Toggle';
import { ToggleGroup } from './stateful/ToggleGroup';

describe('asChild — stateful', () => {
  it('Toggle renders the child element', () => {
    render(
      <Toggle asChild>
        <a href="/x" data-testid="t">
          tg
        </a>
      </Toggle>,
    );
    const el = screen.getByTestId('t');
    expect(el.tagName).toBe('A');
    expect(el.getAttribute('href')).toBe('/x');
    expect(el.getAttribute('aria-pressed')).toBe('false');
    expect(el.getAttribute('data-state')).toBe('off');
  });

  it('ToggleGroup.Item renders the child element', () => {
    render(
      <ToggleGroup.Root type="single">
        <ToggleGroup.Item value="a" asChild>
          <a href="/a" data-testid="t">
            a
          </a>
        </ToggleGroup.Item>
      </ToggleGroup.Root>,
    );
    const el = screen.getByTestId('t');
    expect(el.tagName).toBe('A');
    expect(el.getAttribute('href')).toBe('/a');
    expect(el.getAttribute('role')).toBe('radio');
    expect(el.getAttribute('data-state')).toBe('off');
  });

  it('Tabs.Trigger renders the child element', () => {
    render(
      <Tabs.Root defaultValue="a">
        <Tabs.List>
          <Tabs.Trigger value="a" asChild>
            <a href="#a" data-testid="t">
              A
            </a>
          </Tabs.Trigger>
        </Tabs.List>
      </Tabs.Root>,
    );
    const el = screen.getByTestId('t');
    expect(el.tagName).toBe('A');
    expect(el.getAttribute('role')).toBe('tab');
    expect(el.getAttribute('aria-selected')).toBe('true');
  });

  it('Collapsible.Trigger renders the child element', () => {
    render(
      <Collapsible.Root>
        <Collapsible.Trigger asChild>
          <a href="/x" data-testid="t">
            t
          </a>
        </Collapsible.Trigger>
      </Collapsible.Root>,
    );
    const el = screen.getByTestId('t');
    expect(el.tagName).toBe('A');
    expect(el.getAttribute('aria-expanded')).toBe('false');
  });

  it('Accordion.Trigger renders the child element', () => {
    render(
      <Accordion.Root type="single" collapsible>
        <Accordion.Item value="a">
          <Accordion.Header>
            <Accordion.Trigger asChild>
              <a href="/a" data-testid="t">
                A
              </a>
            </Accordion.Trigger>
          </Accordion.Header>
        </Accordion.Item>
      </Accordion.Root>,
    );
    const el = screen.getByTestId('t');
    expect(el.tagName).toBe('A');
    expect(el.getAttribute('aria-expanded')).toBe('false');
  });

  it('Switch.Root renders the child element', () => {
    render(
      <Switch.Root asChild>
        <a href="/x" data-testid="t">
          s
        </a>
      </Switch.Root>,
    );
    const el = screen.getByTestId('t');
    expect(el.tagName).toBe('A');
    expect(el.getAttribute('role')).toBe('switch');
    expect(el.getAttribute('aria-checked')).toBe('false');
  });

  it('Checkbox.Root renders the child element', () => {
    render(
      <Checkbox.Root asChild>
        <a href="/x" data-testid="t">
          c
        </a>
      </Checkbox.Root>,
    );
    const el = screen.getByTestId('t');
    expect(el.tagName).toBe('A');
    expect(el.getAttribute('role')).toBe('checkbox');
    expect(el.getAttribute('aria-checked')).toBe('false');
  });

  it('RadioGroup.Item renders the child element', () => {
    render(
      <RadioGroup.Root>
        <RadioGroup.Item value="a" asChild>
          <a href="/a" data-testid="t">
            r
          </a>
        </RadioGroup.Item>
      </RadioGroup.Root>,
    );
    const el = screen.getByTestId('t');
    expect(el.tagName).toBe('A');
    expect(el.getAttribute('role')).toBe('radio');
  });
});

describe('asChild — overlays', () => {
  it('Popover.Trigger renders the child element', () => {
    render(
      <Popover.Root>
        <Popover.Trigger asChild>
          <a href="/x" data-testid="t">
            p
          </a>
        </Popover.Trigger>
      </Popover.Root>,
    );
    const el = screen.getByTestId('t');
    expect(el.tagName).toBe('A');
    expect(el.getAttribute('aria-expanded')).toBe('false');
  });

  it('Popover.Close renders the child element with no wrapper', () => {
    const { container } = render(
      <Popover.Root defaultOpen>
        <Popover.Trigger>open</Popover.Trigger>
        <Popover.Content>
          <Popover.Close asChild>
            <a href="/x" data-testid="t">
              close
            </a>
          </Popover.Close>
        </Popover.Content>
      </Popover.Root>,
    );
    const el = screen.getByTestId('t');
    expect(el.tagName).toBe('A');
    // verify the child is NOT nested inside a <button> (asChild must replace, not wrap)
    expect(container.querySelector('button > a[data-testid="t"]')).toBeNull();
  });

  it('HoverCard.Trigger renders the child element', () => {
    render(
      <HoverCard.Root>
        <HoverCard.Trigger asChild>
          <span data-testid="t">h</span>
        </HoverCard.Trigger>
      </HoverCard.Root>,
    );
    const el = screen.getByTestId('t');
    expect(el.tagName).toBe('SPAN');
    expect(el.getAttribute('data-state')).toBe('closed');
  });

  it('Tooltip.Trigger renders the child element', () => {
    render(
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <a href="/x" data-testid="t">
            tt
          </a>
        </Tooltip.Trigger>
      </Tooltip.Root>,
    );
    const el = screen.getByTestId('t');
    expect(el.tagName).toBe('A');
    expect(el.getAttribute('data-state')).toBe('closed');
  });

  it('DropdownMenu.Trigger renders the child element', () => {
    render(
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <a href="/x" data-testid="t">
            dm
          </a>
        </DropdownMenu.Trigger>
      </DropdownMenu.Root>,
    );
    const el = screen.getByTestId('t');
    expect(el.tagName).toBe('A');
    expect(el.getAttribute('aria-haspopup')).toBe('menu');
  });

  it('DropdownMenu.Item renders the child element', () => {
    render(
      <DropdownMenu.Root defaultOpen>
        <DropdownMenu.Trigger>open</DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item asChild>
            <a href="/x" data-testid="t">
              i
            </a>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>,
    );
    const el = screen.getByTestId('t');
    expect(el.tagName).toBe('A');
    expect(el.getAttribute('role')).toBe('menuitem');
  });
});
