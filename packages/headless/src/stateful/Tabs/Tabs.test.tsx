import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Tabs } from './Tabs';

function Sample(props: Parameters<typeof Tabs.Root>[0]) {
  return (
    <Tabs.Root defaultValue="a" {...props}>
      <Tabs.List>
        <Tabs.Trigger value="a">A</Tabs.Trigger>
        <Tabs.Trigger value="b">B</Tabs.Trigger>
        <Tabs.Trigger value="c">C</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="a">body-a</Tabs.Content>
      <Tabs.Content value="b">body-b</Tabs.Content>
      <Tabs.Content value="c">body-c</Tabs.Content>
    </Tabs.Root>
  );
}

describe('Tabs', () => {
  it('renders the default tab content', () => {
    render(<Sample />);
    expect(screen.getByText('body-a')).toBeInTheDocument();
    expect(screen.queryByText('body-b')).toBeNull();
  });

  it('selects the tab on click', () => {
    render(<Sample />);
    fireEvent.click(screen.getByText('B'));
    expect(screen.getByText('body-b')).toBeInTheDocument();
    expect(screen.getByText('B').getAttribute('aria-selected')).toBe('true');
    expect(screen.getByText('A').getAttribute('aria-selected')).toBe('false');
  });

  it('ArrowRight moves to next and activates (automatic)', () => {
    render(<Sample />);
    const a = screen.getByText('A');
    a.focus();
    fireEvent.keyDown(a, { key: 'ArrowRight' });
    expect(screen.getByText('body-b')).toBeInTheDocument();
  });

  it('Home/End jumps to first/last', () => {
    render(<Sample />);
    const b = screen.getByText('B');
    b.focus();
    fireEvent.keyDown(b, { key: 'End' });
    expect(screen.getByText('body-c')).toBeInTheDocument();
    fireEvent.keyDown(screen.getByText('C'), { key: 'Home' });
    expect(screen.getByText('body-a')).toBeInTheDocument();
  });

  it('manual activation only focuses but does not change tab', () => {
    render(<Sample activationMode="manual" />);
    const a = screen.getByText('A');
    a.focus();
    fireEvent.keyDown(a, { key: 'ArrowRight' });
    expect(screen.getByText('body-a')).toBeInTheDocument();
    fireEvent.click(screen.getByText('B'));
    expect(screen.getByText('body-b')).toBeInTheDocument();
  });

  it('renders dir attribute on root element', () => {
    const { container } = render(<Sample dir="rtl" />);
    const root = container.firstChild as HTMLElement;
    expect(root.getAttribute('dir')).toBe('rtl');
  });

  it('renders dir="ltr" when explicitly set', () => {
    const { container } = render(<Sample dir="ltr" />);
    const root = container.firstChild as HTMLElement;
    expect(root.getAttribute('dir')).toBe('ltr');
  });
});
