/**
 * Radix-parity tests for Accordion — keyboard, orientation, dir, ARIA locked.
 */
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DirectionProvider } from '../../shared/DirectionProvider';
import { Accordion } from './Accordion';

function Sample({
  type = 'single' as 'single' | 'multiple',
  collapsible = false,
  orientation,
  disabled,
}: {
  type?: 'single' | 'multiple';
  collapsible?: boolean;
  orientation?: 'horizontal' | 'vertical';
  disabled?: boolean;
}) {
  return (
    // biome-ignore lint/suspicious/noExplicitAny: union type expansion is awkward in test fixtures
    <Accordion.Root
      type={type as any}
      collapsible={collapsible}
      orientation={orientation}
      disabled={disabled}
    >
      <Accordion.Item value="a">
        <Accordion.Header>
          <Accordion.Trigger>A</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content>body-a</Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="b">
        <Accordion.Header>
          <Accordion.Trigger>B</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content>body-b</Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="c">
        <Accordion.Header>
          <Accordion.Trigger>C</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content>body-c</Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>
  );
}

describe('Accordion parity — keyboard (vertical default)', () => {
  it('ArrowDown moves focus to next trigger', () => {
    render(<Sample />);
    const a = screen.getByText('A');
    a.focus();
    fireEvent.keyDown(a, { key: 'ArrowDown' });
    expect(screen.getByText('B')).toHaveFocus();
  });

  it('ArrowUp moves focus to previous trigger (wraps)', () => {
    render(<Sample />);
    const a = screen.getByText('A');
    a.focus();
    fireEvent.keyDown(a, { key: 'ArrowUp' });
    expect(screen.getByText('C')).toHaveFocus();
  });

  it('Home jumps to first trigger', () => {
    render(<Sample />);
    const c = screen.getByText('C');
    c.focus();
    fireEvent.keyDown(c, { key: 'Home' });
    expect(screen.getByText('A')).toHaveFocus();
  });

  it('End jumps to last trigger', () => {
    render(<Sample />);
    const a = screen.getByText('A');
    a.focus();
    fireEvent.keyDown(a, { key: 'End' });
    expect(screen.getByText('C')).toHaveFocus();
  });

  it('ArrowLeft/Right do nothing in vertical orientation', () => {
    render(<Sample />);
    const a = screen.getByText('A');
    a.focus();
    fireEvent.keyDown(a, { key: 'ArrowRight' });
    expect(a).toHaveFocus();
    fireEvent.keyDown(a, { key: 'ArrowLeft' });
    expect(a).toHaveFocus();
  });
});

describe('Accordion parity — keyboard (horizontal)', () => {
  it('ArrowRight moves focus to next trigger (LTR)', () => {
    render(<Sample orientation="horizontal" />);
    const a = screen.getByText('A');
    a.focus();
    fireEvent.keyDown(a, { key: 'ArrowRight' });
    expect(screen.getByText('B')).toHaveFocus();
  });

  it('ArrowLeft moves focus to previous trigger (LTR, wraps)', () => {
    render(<Sample orientation="horizontal" />);
    const a = screen.getByText('A');
    a.focus();
    fireEvent.keyDown(a, { key: 'ArrowLeft' });
    expect(screen.getByText('C')).toHaveFocus();
  });

  it('ArrowUp/Down do nothing in horizontal orientation', () => {
    render(<Sample orientation="horizontal" />);
    const a = screen.getByText('A');
    a.focus();
    fireEvent.keyDown(a, { key: 'ArrowDown' });
    expect(a).toHaveFocus();
  });

  it('RTL swaps ArrowLeft/Right semantics in horizontal orientation', () => {
    render(
      <DirectionProvider dir="rtl">
        <Sample orientation="horizontal" />
      </DirectionProvider>,
    );
    const a = screen.getByText('A');
    a.focus();
    fireEvent.keyDown(a, { key: 'ArrowLeft' });
    expect(screen.getByText('B')).toHaveFocus();
  });
});

describe('Accordion parity — disabled states', () => {
  it('disabled root marks every trigger as disabled', () => {
    render(<Sample disabled />);
    expect(screen.getByText('A')).toBeDisabled();
    expect(screen.getByText('B')).toBeDisabled();
    expect(screen.getByText('C')).toBeDisabled();
  });

  it('disabled trigger is skipped in keyboard navigation', () => {
    render(
      <Accordion.Root type="single">
        <Accordion.Item value="a">
          <Accordion.Header>
            <Accordion.Trigger>A</Accordion.Trigger>
          </Accordion.Header>
        </Accordion.Item>
        <Accordion.Item value="b" disabled>
          <Accordion.Header>
            <Accordion.Trigger>B</Accordion.Trigger>
          </Accordion.Header>
        </Accordion.Item>
        <Accordion.Item value="c">
          <Accordion.Header>
            <Accordion.Trigger>C</Accordion.Trigger>
          </Accordion.Header>
        </Accordion.Item>
      </Accordion.Root>,
    );
    const a = screen.getByText('A');
    a.focus();
    fireEvent.keyDown(a, { key: 'ArrowDown' });
    expect(screen.getByText('C')).toHaveFocus();
  });
});

describe('Accordion parity — single mode locked trigger', () => {
  it('open trigger has aria-disabled when collapsible=false', () => {
    render(
      <Accordion.Root type="single" defaultValue="a">
        <Accordion.Item value="a">
          <Accordion.Header>
            <Accordion.Trigger>A</Accordion.Trigger>
          </Accordion.Header>
        </Accordion.Item>
      </Accordion.Root>,
    );
    expect(screen.getByText('A').getAttribute('aria-disabled')).toBe('true');
  });

  it('open trigger does NOT have aria-disabled when collapsible=true', () => {
    render(
      <Accordion.Root type="single" collapsible defaultValue="a">
        <Accordion.Item value="a">
          <Accordion.Header>
            <Accordion.Trigger>A</Accordion.Trigger>
          </Accordion.Header>
        </Accordion.Item>
      </Accordion.Root>,
    );
    expect(screen.getByText('A').getAttribute('aria-disabled')).toBeNull();
  });

  it('clicking the locked trigger does not close it', () => {
    render(
      <Accordion.Root type="single" defaultValue="a">
        <Accordion.Item value="a">
          <Accordion.Header>
            <Accordion.Trigger>A</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content>body-a</Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>,
    );
    fireEvent.click(screen.getByText('A'));
    expect(screen.getByText('body-a')).toBeInTheDocument();
  });
});

describe('Accordion parity — data-orientation', () => {
  it('Root, Item, Header, Trigger, Content all expose data-orientation', () => {
    const { container } = render(<Sample orientation="horizontal" />);
    const root = container.firstChild as HTMLElement;
    expect(root.getAttribute('data-orientation')).toBe('horizontal');
    // pick the first item / its descendants
    expect(container.querySelectorAll('[data-orientation="horizontal"]').length).toBeGreaterThan(1);
  });
});
