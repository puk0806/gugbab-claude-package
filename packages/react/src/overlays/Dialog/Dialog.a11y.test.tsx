import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import { Dialog } from './Dialog';

describe('Dialog a11y', () => {
  it('has no axe violations when closed', async () => {
    const { container } = render(
      <Dialog.Root>
        <Dialog.Trigger>open</Dialog.Trigger>
      </Dialog.Root>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no axe violations when open with title + description', async () => {
    const { container } = render(
      <Dialog.Root defaultOpen>
        <Dialog.Trigger>open</Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay />
          <Dialog.Content>
            <Dialog.Title>Title</Dialog.Title>
            <Dialog.Description>Body</Dialog.Description>
            <Dialog.Close>Close</Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('Dialog asChild', () => {
  it('renders a custom element as the Trigger when asChild', () => {
    const { getByTestId } = render(
      <Dialog.Root>
        <Dialog.Trigger asChild>
          <a href="#x" data-testid="custom-trigger">
            link
          </a>
        </Dialog.Trigger>
      </Dialog.Root>,
    );
    const el = getByTestId('custom-trigger');
    expect(el.tagName).toBe('A');
    expect(el.getAttribute('aria-expanded')).toBe('false');
  });

  it('renders a custom element as the Close when asChild', () => {
    const { getByTestId } = render(
      <Dialog.Root defaultOpen>
        <Dialog.Portal>
          <Dialog.Content>
            <Dialog.Close asChild>
              <span role="button" tabIndex={0} data-testid="custom-close">
                x
              </span>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>,
    );
    expect(getByTestId('custom-close').tagName).toBe('SPAN');
  });
});
