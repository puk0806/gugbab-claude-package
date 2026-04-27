import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
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
