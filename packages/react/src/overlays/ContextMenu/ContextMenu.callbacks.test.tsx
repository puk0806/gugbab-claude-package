import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ContextMenu } from './ContextMenu';

function openMenu() {
  fireEvent.contextMenu(screen.getByTestId('trigger'), { clientX: 10, clientY: 10 });
}

describe('ContextMenu — DismissableLayer / FocusScope callbacks', () => {
  it('calls onEscapeKeyDown when Escape is pressed inside Content', async () => {
    const onEscapeKeyDown = vi.fn();
    render(
      <ContextMenu.Root>
        <ContextMenu.Trigger data-testid="trigger">area</ContextMenu.Trigger>
        <ContextMenu.Portal>
          <ContextMenu.Content data-testid="content" onEscapeKeyDown={onEscapeKeyDown}>
            <ContextMenu.Item>item</ContextMenu.Item>
          </ContextMenu.Content>
        </ContextMenu.Portal>
      </ContextMenu.Root>,
    );

    openMenu();
    await waitFor(() => screen.getByTestId('content'));
    fireEvent.keyDown(screen.getByTestId('content'), { key: 'Escape' });
    expect(onEscapeKeyDown).toHaveBeenCalledTimes(1);
  });

  it('calls onPointerDownOutside when clicking outside Content', async () => {
    const onPointerDownOutside = vi.fn();
    render(
      <div>
        <ContextMenu.Root>
          <ContextMenu.Trigger data-testid="trigger">area</ContextMenu.Trigger>
          <ContextMenu.Portal>
            <ContextMenu.Content data-testid="content" onPointerDownOutside={onPointerDownOutside}>
              <ContextMenu.Item>item</ContextMenu.Item>
            </ContextMenu.Content>
          </ContextMenu.Portal>
        </ContextMenu.Root>
        <button type="button" data-testid="outside">
          outside
        </button>
      </div>,
    );

    openMenu();
    await waitFor(() => screen.getByTestId('content'));
    fireEvent.pointerDown(screen.getByTestId('outside'));
    expect(onPointerDownOutside).toHaveBeenCalledTimes(1);
  });

  it('calls onInteractOutside when interacting outside Content', async () => {
    const onInteractOutside = vi.fn();
    render(
      <div>
        <ContextMenu.Root>
          <ContextMenu.Trigger data-testid="trigger">area</ContextMenu.Trigger>
          <ContextMenu.Portal>
            <ContextMenu.Content data-testid="content" onInteractOutside={onInteractOutside}>
              <ContextMenu.Item>item</ContextMenu.Item>
            </ContextMenu.Content>
          </ContextMenu.Portal>
        </ContextMenu.Root>
        <button type="button" data-testid="outside">
          outside
        </button>
      </div>,
    );

    openMenu();
    await waitFor(() => screen.getByTestId('content'));
    fireEvent.pointerDown(screen.getByTestId('outside'));
    expect(onInteractOutside).toHaveBeenCalledTimes(1);
  });

  it('prevents default on onEscapeKeyDown keeps menu open', async () => {
    render(
      <ContextMenu.Root>
        <ContextMenu.Trigger data-testid="trigger">area</ContextMenu.Trigger>
        <ContextMenu.Portal>
          <ContextMenu.Content data-testid="content" onEscapeKeyDown={(e) => e.preventDefault()}>
            <ContextMenu.Item>item</ContextMenu.Item>
          </ContextMenu.Content>
        </ContextMenu.Portal>
      </ContextMenu.Root>,
    );

    openMenu();
    await waitFor(() => screen.getByTestId('content'));
    fireEvent.keyDown(screen.getByTestId('content'), { key: 'Escape' });
    // menu should remain open because default was prevented
    expect(screen.getByTestId('content')).toBeInTheDocument();
  });

  it('closes menu on Escape by default (no preventDefault)', async () => {
    render(
      <ContextMenu.Root>
        <ContextMenu.Trigger data-testid="trigger">area</ContextMenu.Trigger>
        <ContextMenu.Portal>
          <ContextMenu.Content data-testid="content">
            <ContextMenu.Item>item</ContextMenu.Item>
          </ContextMenu.Content>
        </ContextMenu.Portal>
      </ContextMenu.Root>,
    );

    openMenu();
    await waitFor(() => screen.getByTestId('content'));
    fireEvent.keyDown(screen.getByTestId('content'), { key: 'Escape' });
    await waitFor(() => expect(screen.queryByTestId('content')).not.toBeInTheDocument());
  });

  /* -------------------------------------------------------------------------------------------------
   * Sub menu callbacks
   * -----------------------------------------------------------------------------------------------*/

  it('SubContent: calls onEscapeKeyDown when Escape is pressed', async () => {
    const onEscapeKeyDown = vi.fn();
    render(
      <ContextMenu.Root>
        <ContextMenu.Trigger data-testid="trigger">area</ContextMenu.Trigger>
        <ContextMenu.Portal>
          <ContextMenu.Content data-testid="content">
            <ContextMenu.Sub defaultOpen>
              <ContextMenu.SubTrigger>sub-trigger</ContextMenu.SubTrigger>
              <ContextMenu.SubContent data-testid="sub-content" onEscapeKeyDown={onEscapeKeyDown}>
                <ContextMenu.Item>sub-item</ContextMenu.Item>
              </ContextMenu.SubContent>
            </ContextMenu.Sub>
          </ContextMenu.Content>
        </ContextMenu.Portal>
      </ContextMenu.Root>,
    );

    openMenu();
    await waitFor(() => screen.getByTestId('sub-content'));
    fireEvent.keyDown(screen.getByTestId('sub-content'), { key: 'Escape' });
    expect(onEscapeKeyDown).toHaveBeenCalledTimes(1);
  });

  it('SubContent: calls onPointerDownOutside when clicking outside sub menu', async () => {
    const onPointerDownOutside = vi.fn();
    render(
      <div>
        <ContextMenu.Root>
          <ContextMenu.Trigger data-testid="trigger">area</ContextMenu.Trigger>
          <ContextMenu.Portal>
            <ContextMenu.Content data-testid="content">
              <ContextMenu.Sub defaultOpen>
                <ContextMenu.SubTrigger>sub-trigger</ContextMenu.SubTrigger>
                <ContextMenu.SubContent
                  data-testid="sub-content"
                  onPointerDownOutside={onPointerDownOutside}
                >
                  <ContextMenu.Item>sub-item</ContextMenu.Item>
                </ContextMenu.SubContent>
              </ContextMenu.Sub>
            </ContextMenu.Content>
          </ContextMenu.Portal>
        </ContextMenu.Root>
        <button type="button" data-testid="outside">
          outside
        </button>
      </div>,
    );

    openMenu();
    await waitFor(() => screen.getByTestId('sub-content'));
    fireEvent.pointerDown(screen.getByTestId('outside'));
    expect(onPointerDownOutside).toHaveBeenCalledTimes(1);
  });
});
