import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Tooltip } from './Tooltip';

describe('Tooltip', () => {
  it('renders content when defaultOpen', () => {
    render(
      <Tooltip.Root defaultOpen>
        <Tooltip.Trigger>hover me</Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content role="tooltip">help</Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>,
    );
    expect(screen.getByText('help')).toBeInTheDocument();
  });

  it('hides content when closed', () => {
    render(
      <Tooltip.Root>
        <Tooltip.Trigger>hover me</Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content>help</Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>,
    );
    expect(screen.queryByText('help')).toBeNull();
  });
});
