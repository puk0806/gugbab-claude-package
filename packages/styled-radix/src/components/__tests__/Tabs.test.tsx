import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Tabs } from '../Tabs';

describe('Tabs (styled-radix)', () => {
  it('Root has grx-tabs + horizontal orientation', () => {
    render(
      <Tabs.Root data-testid="root" defaultValue="a">
        <Tabs.List>
          <Tabs.Trigger value="a">A</Tabs.Trigger>
          <Tabs.Trigger value="b">B</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="a">A content</Tabs.Content>
        <Tabs.Content value="b">B content</Tabs.Content>
      </Tabs.Root>,
    );
    const root = screen.getByTestId('root');
    expect(root).toHaveClass('grx-tabs');
    expect(root).toHaveAttribute('data-orientation', 'horizontal');
  });

  it('renders selected content via defaultValue', () => {
    render(
      <Tabs.Root defaultValue="b">
        <Tabs.List>
          <Tabs.Trigger value="a">A</Tabs.Trigger>
          <Tabs.Trigger value="b">B</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="a">first panel</Tabs.Content>
        <Tabs.Content value="b">second panel</Tabs.Content>
      </Tabs.Root>,
    );
    expect(screen.getByText('second panel')).toBeInTheDocument();
    expect(screen.queryByText('first panel')).not.toBeInTheDocument();
  });

  it('vertical orientation reflected on Root', () => {
    render(
      <Tabs.Root data-testid="root" defaultValue="a" orientation="vertical">
        <Tabs.List>
          <Tabs.Trigger value="a">A</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="a">x</Tabs.Content>
      </Tabs.Root>,
    );
    expect(screen.getByTestId('root')).toHaveAttribute('data-orientation', 'vertical');
  });
});
