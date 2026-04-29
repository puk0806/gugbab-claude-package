import { Dialog, type DialogRootProps } from '../Dialog/Dialog';

/**
 * AlertDialog is a Dialog with `role="alertdialog"` semantics, intended for
 * confirmation prompts that interrupt the user. Unlike Dialog, dismissal via
 * ESC / outside click is typically forbidden — consumers should not render a
 * Close button that differs from Cancel / Action.
 */
export interface AlertDialogRootProps extends Omit<DialogRootProps, 'role'> {}

function AlertDialogRoot(props: AlertDialogRootProps) {
  return <Dialog.Root {...props} role="alertdialog" />;
}

export const AlertDialog = {
  Root: AlertDialogRoot,
  Trigger: Dialog.Trigger,
  Portal: Dialog.Portal,
  Overlay: Dialog.Overlay,
  Content: Dialog.Content,
  Title: Dialog.Title,
  Description: Dialog.Description,
  Cancel: Dialog.Close,
  Action: Dialog.Close,
};
