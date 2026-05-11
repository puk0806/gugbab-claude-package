import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AlertDialog } from '../AlertDialog';

describe('AlertDialog (styled-radix)', () => {
  function open(node: React.ReactNode) {
    return render(
      <AlertDialog.Root defaultOpen>
        <AlertDialog.Portal>
          <AlertDialog.Overlay data-testid="overlay" />
          <AlertDialog.Content data-testid="content">
            <AlertDialog.Title data-testid="title">Title</AlertDialog.Title>
            <AlertDialog.Description data-testid="desc">Desc</AlertDialog.Description>
            {node}
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>,
    );
  }

  it('Trigger applies grx-alert-dialog__trigger', () => {
    const { container } = render(
      <AlertDialog.Root>
        <AlertDialog.Trigger data-testid="trigger">Open</AlertDialog.Trigger>
      </AlertDialog.Root>,
    );
    expect(container.querySelector('[data-testid="trigger"]')).toHaveClass(
      'grx-alert-dialog__trigger',
    );
  });

  it('Overlay/Content/Title/Description have BEM classes', () => {
    open(null);
    expect(document.body.querySelector('[data-testid="overlay"]')).toHaveClass(
      'grx-alert-dialog__overlay',
    );
    expect(document.body.querySelector('[data-testid="content"]')).toHaveClass(
      'grx-alert-dialog__content',
    );
    expect(document.body.querySelector('[data-testid="title"]')).toHaveClass(
      'grx-alert-dialog__title',
    );
    expect(document.body.querySelector('[data-testid="desc"]')).toHaveClass(
      'grx-alert-dialog__description',
    );
  });

  it.each(['sm', 'md', 'lg', 'xl'] as const)('Content size %s adds modifier', (size) => {
    render(
      <AlertDialog.Root defaultOpen>
        <AlertDialog.Portal>
          <AlertDialog.Content data-testid="content" size={size}>
            <AlertDialog.Title>t</AlertDialog.Title>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>,
    );
    expect(document.body.querySelector('[data-testid="content"]')).toHaveClass(
      `grx-alert-dialog__content--${size}`,
    );
  });

  it.each(['accent', 'danger'] as const)('Action variant %s applies modifier', (variant) => {
    open(
      <AlertDialog.Action data-testid="action" variant={variant}>
        OK
      </AlertDialog.Action>,
    );
    expect(document.body.querySelector('[data-testid="action"]')).toHaveClass(
      `grx-alert-dialog__action--${variant}`,
    );
  });

  it('Cancel applies grx-alert-dialog__cancel', () => {
    open(<AlertDialog.Cancel data-testid="cancel">Cancel</AlertDialog.Cancel>);
    expect(document.body.querySelector('[data-testid="cancel"]')).toHaveClass(
      'grx-alert-dialog__cancel',
    );
  });
});
