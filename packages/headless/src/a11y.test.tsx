/**
 * Cross-component a11y smoke — runs axe-core against every primary component
 * in its most common rendered form. Keeps a single top-level failure per
 * component instead of one per instance.
 */
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import { Breadcrumbs } from './navigation/Breadcrumbs';
import { Pagination } from './navigation/Pagination';
import { Avatar } from './primitives/Avatar';
import { Label } from './primitives/Label';
import { Separator } from './primitives/Separator';
import { VisuallyHidden } from './primitives/VisuallyHidden';
import { Accordion } from './stateful/Accordion';
import { Checkbox } from './stateful/Checkbox';
import { Collapsible } from './stateful/Collapsible';
import { Progress } from './stateful/Progress';
import { RadioGroup } from './stateful/RadioGroup';
import { Switch } from './stateful/Switch';
import { Tabs } from './stateful/Tabs';
import { Toggle } from './stateful/Toggle';
import { ToggleGroup } from './stateful/ToggleGroup';

describe('a11y: primitives', () => {
  it('Label', async () => {
    const { container } = render(
      <div>
        <Label htmlFor="x">Name</Label>
        <input id="x" />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('VisuallyHidden', async () => {
    const { container } = render(<VisuallyHidden>hidden content</VisuallyHidden>);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('Separator', async () => {
    const { container } = render(<Separator />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('Avatar with fallback', async () => {
    const { container } = render(
      <Avatar.Root>
        <Avatar.Image src="/none.png" alt="" />
        <Avatar.Fallback>AB</Avatar.Fallback>
      </Avatar.Root>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('a11y: stateful', () => {
  it('Collapsible', async () => {
    const { container } = render(
      <Collapsible.Root defaultOpen>
        <Collapsible.Trigger>toggle</Collapsible.Trigger>
        <Collapsible.Content>body</Collapsible.Content>
      </Collapsible.Root>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('Accordion (single)', async () => {
    const { container } = render(
      <Accordion.Root type="single" collapsible defaultValue="a">
        <Accordion.Item value="a">
          <Accordion.Header>
            <Accordion.Trigger>A</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content>body-a</Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('Tabs', async () => {
    const { container } = render(
      <Tabs.Root defaultValue="one">
        <Tabs.List>
          <Tabs.Trigger value="one">One</Tabs.Trigger>
          <Tabs.Trigger value="two">Two</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="one">body-1</Tabs.Content>
        <Tabs.Content value="two">body-2</Tabs.Content>
      </Tabs.Root>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('Toggle', async () => {
    const { container } = render(<Toggle aria-label="bold">B</Toggle>);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('ToggleGroup (single radio)', async () => {
    const { container } = render(
      <ToggleGroup.Root type="single" aria-label="align">
        <ToggleGroup.Item value="l" aria-label="left">
          L
        </ToggleGroup.Item>
        <ToggleGroup.Item value="r" aria-label="right">
          R
        </ToggleGroup.Item>
      </ToggleGroup.Root>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('Switch', async () => {
    const { container } = render(
      <Switch.Root aria-label="airplane mode">
        <Switch.Thumb />
      </Switch.Root>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('Checkbox', async () => {
    const { container } = render(
      <div>
        <Label htmlFor="a">Accept</Label>
        <Checkbox.Root id="a">
          <Checkbox.Indicator>✓</Checkbox.Indicator>
        </Checkbox.Root>
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('RadioGroup', async () => {
    const { container } = render(
      <RadioGroup.Root aria-label="color">
        <RadioGroup.Item value="red" aria-label="red">
          R
        </RadioGroup.Item>
        <RadioGroup.Item value="blue" aria-label="blue">
          B
        </RadioGroup.Item>
      </RadioGroup.Root>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('Progress', async () => {
    const { container } = render(
      <Progress.Root value={30} aria-label="loading">
        <Progress.Indicator />
      </Progress.Root>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('a11y: navigation', () => {
  it('Breadcrumbs', async () => {
    const { container } = render(
      <Breadcrumbs.Root>
        <Breadcrumbs.List>
          <Breadcrumbs.Item>
            <Breadcrumbs.Link href="/">Home</Breadcrumbs.Link>
          </Breadcrumbs.Item>
          <Breadcrumbs.Separator>/</Breadcrumbs.Separator>
          <Breadcrumbs.Item>
            <Breadcrumbs.Page>Current</Breadcrumbs.Page>
          </Breadcrumbs.Item>
        </Breadcrumbs.List>
      </Breadcrumbs.Root>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('Pagination', async () => {
    const { container } = render(
      <Pagination.Root pageCount={3} defaultPage={1}>
        <Pagination.List>
          <Pagination.Item>
            <Pagination.Previous>prev</Pagination.Previous>
          </Pagination.Item>
          <Pagination.Item>
            <Pagination.Page page={1}>1</Pagination.Page>
          </Pagination.Item>
          <Pagination.Item>
            <Pagination.Next>next</Pagination.Next>
          </Pagination.Item>
        </Pagination.List>
      </Pagination.Root>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
