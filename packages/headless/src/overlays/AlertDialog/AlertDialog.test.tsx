import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AlertDialog } from './AlertDialog';

describe('AlertDialog', () => {
  it('renders with role="alertdialog" when open', () => {
    render(
      <AlertDialog.Root defaultOpen>
        <AlertDialog.Trigger>x</AlertDialog.Trigger>
        <AlertDialog.Portal>
          <AlertDialog.Content>
            <AlertDialog.Title>t</AlertDialog.Title>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>,
    );
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
  });
});
