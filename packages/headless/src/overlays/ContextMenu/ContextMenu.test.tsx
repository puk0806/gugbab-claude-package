import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ContextMenu } from './ContextMenu';

describe('ContextMenu', () => {
  it('opens on contextmenu event over the trigger', () => {
    render(
      <ContextMenu.Root>
        <ContextMenu.Trigger data-testid="trigger">area</ContextMenu.Trigger>
        <ContextMenu.Portal>
          <ContextMenu.Content>
            <ContextMenu.Item>one</ContextMenu.Item>
          </ContextMenu.Content>
        </ContextMenu.Portal>
      </ContextMenu.Root>,
    );

    fireEvent.contextMenu(screen.getByTestId('trigger'), {
      clientX: 20,
      clientY: 30,
    });
    expect(screen.getByText('one')).toBeInTheDocument();
  });
});
