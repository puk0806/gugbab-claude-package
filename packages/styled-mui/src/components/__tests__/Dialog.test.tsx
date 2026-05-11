import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Dialog } from '../Dialog';

describe('Dialog (styled-mui)', () => {
  it('Trigger applies gmui-dialog__trigger', () => {
    const { container } = render(
      <Dialog.Root>
        <Dialog.Trigger data-testid="trigger">Open</Dialog.Trigger>
      </Dialog.Root>,
    );
    expect(container.querySelector('[data-testid="trigger"]')).toHaveClass('gmui-dialog__trigger');
  });

  it('Overlay/Content/Title/Description/Close have BEM classes', () => {
    render(
      <Dialog.Root defaultOpen>
        <Dialog.Portal>
          <Dialog.Overlay data-testid="overlay" />
          <Dialog.Content data-testid="content">
            <Dialog.Title data-testid="title">t</Dialog.Title>
            <Dialog.Description data-testid="desc">d</Dialog.Description>
            <Dialog.Close data-testid="close">x</Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>,
    );
    expect(document.body.querySelector('[data-testid="overlay"]')).toHaveClass(
      'gmui-dialog__overlay',
    );
    expect(document.body.querySelector('[data-testid="content"]')).toHaveClass(
      'gmui-dialog__content',
    );
    expect(document.body.querySelector('[data-testid="title"]')).toHaveClass('gmui-dialog__title');
    expect(document.body.querySelector('[data-testid="desc"]')).toHaveClass(
      'gmui-dialog__description',
    );
    expect(document.body.querySelector('[data-testid="close"]')).toHaveClass('gmui-dialog__close');
  });

  it.each(['sm', 'md', 'lg', 'xl'] as const)('Content size %s applies modifier', (size) => {
    render(
      <Dialog.Root defaultOpen>
        <Dialog.Portal>
          <Dialog.Content data-testid="content" size={size}>
            <Dialog.Title>t</Dialog.Title>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>,
    );
    expect(document.body.querySelector('[data-testid="content"]')).toHaveClass(
      `gmui-dialog__content--${size}`,
    );
  });
});
