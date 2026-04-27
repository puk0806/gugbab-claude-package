import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Dialog } from './Dialog';

function Sample(
  props: Parameters<typeof Dialog.Root>[0] = {} as Parameters<typeof Dialog.Root>[0],
) {
  return (
    <Dialog.Root {...props}>
      <Dialog.Trigger>open</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay data-testid="overlay" />
        <Dialog.Content data-testid="content">
          <Dialog.Title>title</Dialog.Title>
          <Dialog.Description>desc</Dialog.Description>
          <Dialog.Close>close</Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

describe('Dialog', () => {
  it('is closed by default', () => {
    render(<Sample />);
    expect(screen.queryByTestId('content')).toBeNull();
  });

  it('opens on trigger click', () => {
    render(<Sample />);
    fireEvent.click(screen.getByText('open'));
    expect(screen.getByTestId('content')).toBeInTheDocument();
    expect(screen.getByText('title')).toBeInTheDocument();
  });

  it('closes on Close button click', () => {
    render(<Sample />);
    fireEvent.click(screen.getByText('open'));
    fireEvent.click(screen.getByText('close'));
    expect(screen.queryByTestId('content')).toBeNull();
  });

  it('defaultOpen=true shows initially', () => {
    render(<Sample defaultOpen />);
    expect(screen.getByTestId('content')).toBeInTheDocument();
  });
});

describe('Dialog — missing title dev warning', () => {
  it('logs console.error when Dialog.Title is absent', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <Dialog.Root defaultOpen>
        <Dialog.Portal>
          <Dialog.Content data-testid="content">
            <p>no title here</p>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>,
    );
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('Missing accessible title'));
    spy.mockRestore();
  });

  it('does not warn when Dialog.Title is present', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <Dialog.Root defaultOpen>
        <Dialog.Portal>
          <Dialog.Content data-testid="content">
            <Dialog.Title>My Title</Dialog.Title>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>,
    );
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});

describe('Dialog — aria-hidden hideOthers (modal)', () => {
  it('applies aria-hidden to body siblings when modal dialog opens', () => {
    const sibling = document.createElement('div');
    sibling.setAttribute('data-testid', 'sibling');
    document.body.appendChild(sibling);

    render(
      <Dialog.Root defaultOpen modal>
        <Dialog.Portal>
          <Dialog.Content>
            <Dialog.Title>t</Dialog.Title>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>,
    );

    expect(sibling.getAttribute('aria-hidden')).toBe('true');
    document.body.removeChild(sibling);
  });
});
