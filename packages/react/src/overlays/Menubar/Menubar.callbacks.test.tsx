import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Menubar } from './Menubar';

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: false });
});
afterEach(() => {
  vi.runOnlyPendingTimers();
  vi.useRealTimers();
});

/** Flush DismissableLayer's setTimeout(0) registration. */
function flushPointerListener() {
  act(() => {
    vi.advanceTimersByTime(1);
  });
}

function BasicMenubar({
  contentProps = {},
  subContentProps = {},
}: {
  contentProps?: React.ComponentProps<typeof Menubar.Content>;
  subContentProps?: React.ComponentProps<typeof Menubar.SubContent>;
}) {
  return (
    <Menubar.Root defaultValue="">
      <Menubar.Menu value="file">
        <Menubar.Trigger data-testid="trigger">File</Menubar.Trigger>
        <Menubar.Portal>
          <Menubar.Content data-testid="content" {...contentProps}>
            <Menubar.Item>Open</Menubar.Item>
            <Menubar.Sub>
              <Menubar.SubTrigger data-testid="sub-trigger">Recent</Menubar.SubTrigger>
              <Menubar.SubContent data-testid="sub-content" {...subContentProps}>
                <Menubar.Item>doc.txt</Menubar.Item>
              </Menubar.SubContent>
            </Menubar.Sub>
          </Menubar.Content>
        </Menubar.Portal>
      </Menubar.Menu>
    </Menubar.Root>
  );
}

function openContent() {
  fireEvent.click(screen.getByTestId('trigger'));
  flushPointerListener();
}

function openSubContent() {
  openContent();
  // hover triggers the sub to open
  fireEvent.mouseEnter(screen.getByTestId('sub-trigger'));
  act(() => {
    // flush hover delay (75ms) + setTimeout
    vi.advanceTimersByTime(200);
  });
}

describe('Menubar — Phase 4 infra callbacks (Content)', () => {
  it('onEscapeKeyDown is called when Escape is pressed while Content is open', () => {
    const onEscapeKeyDown = vi.fn();
    render(
      <div>
        <BasicMenubar contentProps={{ onEscapeKeyDown }} />
        <button type="button" data-testid="outside">
          outside
        </button>
      </div>,
    );
    openContent();
    expect(screen.getByTestId('content')).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onEscapeKeyDown).toHaveBeenCalledTimes(1);
  });

  it('onEscapeKeyDown preventDefault stops Content from closing', () => {
    const onEscapeKeyDown = vi.fn((e: KeyboardEvent) => e.preventDefault());
    render(<BasicMenubar contentProps={{ onEscapeKeyDown }} />);
    openContent();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.getByTestId('content')).toBeInTheDocument();
  });

  it('onPointerDownOutside is called when clicking outside the Content', () => {
    const onPointerDownOutside = vi.fn();
    render(
      <div>
        <BasicMenubar contentProps={{ onPointerDownOutside }} />
        <button type="button" data-testid="outside">
          outside
        </button>
      </div>,
    );
    openContent();

    fireEvent.pointerDown(screen.getByTestId('outside'));
    expect(onPointerDownOutside).toHaveBeenCalledTimes(1);
  });

  it('onInteractOutside fires for outside pointer interaction on Content', () => {
    const onInteractOutside = vi.fn();
    render(
      <div>
        <BasicMenubar contentProps={{ onInteractOutside }} />
        <button type="button" data-testid="outside">
          outside
        </button>
      </div>,
    );
    openContent();

    fireEvent.pointerDown(screen.getByTestId('outside'));
    expect(onInteractOutside).toHaveBeenCalledTimes(1);
  });

  it('onOpenAutoFocus is forwarded to FocusScope for Content', () => {
    const onOpenAutoFocus = vi.fn();
    render(<BasicMenubar contentProps={{ onOpenAutoFocus }} />);
    openContent();

    expect(onOpenAutoFocus).toHaveBeenCalledTimes(1);
  });

  it('onCloseAutoFocus is forwarded to FocusScope for Content', () => {
    const onCloseAutoFocus = vi.fn();
    render(<BasicMenubar contentProps={{ onCloseAutoFocus }} />);
    openContent();
    expect(screen.getByTestId('content')).toBeInTheDocument();

    // Close by clicking trigger again
    fireEvent.click(screen.getByTestId('trigger'));
    act(() => {
      vi.runAllTimers();
    });

    expect(onCloseAutoFocus).toHaveBeenCalled();
  });
});

describe('Menubar — Phase 4 infra callbacks (SubContent)', () => {
  it('SubContent onEscapeKeyDown is called when Escape is pressed while sub is open', () => {
    const onEscapeKeyDown = vi.fn();
    render(<BasicMenubar subContentProps={{ onEscapeKeyDown }} />);
    openSubContent();

    expect(screen.getByTestId('sub-content')).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onEscapeKeyDown).toHaveBeenCalledTimes(1);
  });

  it('SubContent onPointerDownOutside is called when clicking outside sub', () => {
    const onPointerDownOutside = vi.fn();
    render(
      <div>
        <BasicMenubar subContentProps={{ onPointerDownOutside }} />
        <button type="button" data-testid="outside">
          outside
        </button>
      </div>,
    );
    openSubContent();
    expect(screen.getByTestId('sub-content')).toBeInTheDocument();

    // Additional flush to ensure DismissableLayer's setTimeout listener is registered
    flushPointerListener();
    fireEvent.pointerDown(screen.getByTestId('outside'));
    expect(onPointerDownOutside).toHaveBeenCalledTimes(1);
  });

  it('SubContent onOpenAutoFocus fires when sub opens', () => {
    const onOpenAutoFocus = vi.fn();
    render(<BasicMenubar subContentProps={{ onOpenAutoFocus }} />);
    openSubContent();

    expect(onOpenAutoFocus).toHaveBeenCalledTimes(1);
  });
});
