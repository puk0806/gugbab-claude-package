/**
 * RTL keyboard semantics — when DirectionProvider is "rtl", the horizontal
 * arrow keys are swapped (ArrowLeft moves to next, ArrowRight to previous).
 */
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
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

describe('RTL keyboard — RadioGroup 선택·포커스 일치 (3항목)', () => {
  // RovingFocusGroup 은 포커스 이동을 setTimeout(0)으로 미룬다
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  // 항목 3개 + 가운데에서 시작 — 2항목 loop 에서는 "이전(wrap)"과 "다음"이 같아 결함이 가려진다.
  function ThreeRadios(props: { dir?: 'ltr' | 'rtl' }) {
    return (
      <RadioGroup.Root orientation="horizontal" defaultValue="b" {...props}>
        <RadioGroup.Item value="a">A</RadioGroup.Item>
        <RadioGroup.Item value="b">B</RadioGroup.Item>
        <RadioGroup.Item value="c">C</RadioGroup.Item>
      </RadioGroup.Root>
    );
  }

  it('RTL(Provider) 에서 ArrowLeft 는 다음 항목을 선택하고, 선택과 포커스가 같은 항목이다', () => {
    render(
      <DirectionProvider dir="rtl">
        <ThreeRadios />
      </DirectionProvider>,
    );
    const b = screen.getByText('B');
    b.focus();
    fireEvent.keyDown(b, { key: 'ArrowLeft' });
    act(() => {
      vi.runAllTimers();
    });
    expect(screen.getByText('C').getAttribute('aria-checked')).toBe('true');
    expect(document.activeElement).toBe(screen.getByText('C'));
  });

  it('Root 의 dir="rtl" prop 만으로도 RTL 키맵이 적용된다 (Provider 없음)', () => {
    render(<ThreeRadios dir="rtl" />);
    const b = screen.getByText('B');
    b.focus();
    fireEvent.keyDown(b, { key: 'ArrowRight' });
    act(() => {
      vi.runAllTimers();
    });
    expect(screen.getByText('A').getAttribute('aria-checked')).toBe('true');
    expect(document.activeElement).toBe(screen.getByText('A'));
  });

  it('LTR 기본값은 그대로다 — ArrowRight 는 다음 (회귀 방지·경계)', () => {
    render(<ThreeRadios />);
    const b = screen.getByText('B');
    b.focus();
    fireEvent.keyDown(b, { key: 'ArrowRight' });
    act(() => {
      vi.runAllTimers();
    });
    expect(screen.getByText('C').getAttribute('aria-checked')).toBe('true');
    expect(document.activeElement).toBe(screen.getByText('C'));
  });

  it('Root 밖의 Item 은 명확한 에러로 거부한다 (오용)', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<RadioGroup.Item value="x">X</RadioGroup.Item>)).toThrow('must be used inside');
    spy.mockRestore();
  });
});
