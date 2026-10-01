/**
 * Focus policy when a non-modal overlay (Popover, DropdownMenu) closes.
 * Runs from FocusScope's cancellable unmount auto-focus event, after the
 * consumer's `onCloseAutoFocus` had a chance to `preventDefault()`.
 *
 * - Closed by keyboard / close button → return to the trigger explicitly. The
 *   element focused at open time can be <body> (Safari does not focus buttons
 *   on click), so FocusScope's default target is not reliable.
 * - Closed by an outside interaction → leave focus where the user put it,
 *   unless it landed on nothing (<body>): then fall back to the trigger so
 *   keyboard users are not stranded (e.g. inside a modal Dialog's trap).
 * - No usable trigger (never rendered / unmounted) → let FocusScope restore.
 */
export function handleCloseAutoFocus(
  event: Event,
  trigger: HTMLElement | null,
  interactedOutside: boolean,
): void {
  if (event.defaultPrevented) return;
  const active = document.activeElement;
  const focusLost = active === null || active === document.body;
  if (trigger?.isConnected && (!interactedOutside || focusLost)) {
    event.preventDefault();
    trigger.focus();
  } else if (interactedOutside) {
    event.preventDefault();
  }
}
