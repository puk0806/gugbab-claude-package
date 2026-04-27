import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Accordion } from './Accordion';

function Sample({
  type = 'single',
  collapsible = false,
}: {
  type?: 'single' | 'multiple';
  collapsible?: boolean;
}) {
  return (
    <Accordion.Root type={type as 'single'} collapsible={collapsible}>
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
    </Accordion.Root>
  );
}

describe('Accordion (single)', () => {
  it('opens the clicked item and closes other items', () => {
    render(<Sample />);
    fireEvent.click(screen.getByText('A'));
    expect(screen.getByText('body-a')).toBeInTheDocument();
    expect(screen.queryByText('body-b')).toBeNull();

    fireEvent.click(screen.getByText('B'));
    expect(screen.getByText('body-b')).toBeInTheDocument();
    expect(screen.queryByText('body-a')).toBeNull();
  });

  it('clicking the open item again does NOT close it when collapsible=false', () => {
    render(<Sample />);
    fireEvent.click(screen.getByText('A'));
    fireEvent.click(screen.getByText('A'));
    expect(screen.getByText('body-a')).toBeInTheDocument();
  });

  it('clicking the open item closes it when collapsible=true', () => {
    render(<Sample collapsible />);
    fireEvent.click(screen.getByText('A'));
    fireEvent.click(screen.getByText('A'));
    expect(screen.queryByText('body-a')).toBeNull();
  });
});

describe('Accordion (multiple)', () => {
  it('allows multiple items to be open simultaneously', () => {
    render(<Sample type="multiple" />);
    fireEvent.click(screen.getByText('A'));
    fireEvent.click(screen.getByText('B'));
    expect(screen.getByText('body-a')).toBeInTheDocument();
    expect(screen.getByText('body-b')).toBeInTheDocument();
  });

  it('toggles an item off when clicked twice', () => {
    render(<Sample type="multiple" />);
    fireEvent.click(screen.getByText('A'));
    fireEvent.click(screen.getByText('A'));
    expect(screen.queryByText('body-a')).toBeNull();
  });
});
