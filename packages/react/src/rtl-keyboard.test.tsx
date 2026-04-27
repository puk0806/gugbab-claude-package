/**
 * RTL keyboard semantics — when DirectionProvider is "rtl", the horizontal
 * arrow keys are swapped (ArrowLeft moves to next, ArrowRight to previous).
 */
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DirectionProvider } from './shared/DirectionProvider';
import { RadioGroup } from './stateful/RadioGroup';
import { Tabs } from './stateful/Tabs';

describe('RTL keyboard — Tabs', () => {
  it('ArrowLeft moves to next tab when dir="rtl" (horizontal)', () => {
    render(
      <DirectionProvider dir="rtl">
        <Tabs.Root defaultValue="a">
          <Tabs.List>
            <Tabs.Trigger value="a">A</Tabs.Trigger>
            <Tabs.Trigger value="b">B</Tabs.Trigger>
          </Tabs.List>
        </Tabs.Root>
      </DirectionProvider>,
    );
    const a = screen.getByText('A');
    a.focus();
    fireEvent.keyDown(a, { key: 'ArrowLeft' });
    expect(screen.getByText('B').getAttribute('aria-selected')).toBe('true');
  });

  it('ArrowRight stays as next tab when dir="ltr" (default)', () => {
    render(
      <Tabs.Root defaultValue="a">
        <Tabs.List>
          <Tabs.Trigger value="a">A</Tabs.Trigger>
          <Tabs.Trigger value="b">B</Tabs.Trigger>
        </Tabs.List>
      </Tabs.Root>,
    );
    const a = screen.getByText('A');
    a.focus();
    fireEvent.keyDown(a, { key: 'ArrowRight' });
    expect(screen.getByText('B').getAttribute('aria-selected')).toBe('true');
  });
});

describe('RTL keyboard — RadioGroup', () => {
  it('ArrowLeft moves to next radio when dir="rtl" (horizontal)', () => {
    render(
      <DirectionProvider dir="rtl">
        <RadioGroup.Root orientation="horizontal" defaultValue="a">
          <RadioGroup.Item value="a">A</RadioGroup.Item>
          <RadioGroup.Item value="b">B</RadioGroup.Item>
        </RadioGroup.Root>
      </DirectionProvider>,
    );
    const a = screen.getByText('A');
    a.focus();
    fireEvent.keyDown(a, { key: 'ArrowLeft' });
    expect(screen.getByText('B').getAttribute('aria-checked')).toBe('true');
  });
});
