import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Popover } from './Popover';

describe('Popover', () => {
  it('opens on trigger click', () => {
    render(
      <Popover.Root>
        <Popover.Trigger>open</Popover.Trigger>
        <Popover.Portal>
          <Popover.Content>content</Popover.Content>
        </Popover.Portal>
      </Popover.Root>,
    );
    fireEvent.click(screen.getByText('open'));
    expect(screen.getByText('content')).toBeInTheDocument();
  });

  it('closes on Close button click', () => {
    render(
      <Popover.Root defaultOpen>
        <Popover.Trigger>open</Popover.Trigger>
        <Popover.Portal>
          <Popover.Content>
            <Popover.Close>x</Popover.Close>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>,
    );
    fireEvent.click(screen.getByText('x'));
    expect(screen.queryByText('x')).toBeNull();
  });
});
