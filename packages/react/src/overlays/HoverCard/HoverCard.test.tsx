import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { HoverCard } from './HoverCard';

describe('HoverCard', () => {
  it('renders content when defaultOpen', () => {
    render(
      <HoverCard.Root defaultOpen>
        <HoverCard.Trigger href="#x">link</HoverCard.Trigger>
        <HoverCard.Portal>
          <HoverCard.Content>info</HoverCard.Content>
        </HoverCard.Portal>
      </HoverCard.Root>,
    );
    expect(screen.getByText('info')).toBeInTheDocument();
  });
});
