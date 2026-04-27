import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Collapsible } from './Collapsible';

const Basic = (props: Parameters<typeof Collapsible.Root>[0]) => (
  <Collapsible.Root {...props}>
    <Collapsible.Trigger>toggle</Collapsible.Trigger>
    <Collapsible.Content>body</Collapsible.Content>
  </Collapsible.Root>
);

describe('Collapsible', () => {
  it('is closed by default', () => {
    render(<Basic />);
    expect(screen.queryByText('body')).toBeNull();
    expect(screen.getByText('toggle').getAttribute('aria-expanded')).toBe('false');
  });

  it('opens on trigger click', () => {
    render(<Basic />);
    fireEvent.click(screen.getByText('toggle'));
    expect(screen.getByText('body')).toBeInTheDocument();
    expect(screen.getByText('toggle').getAttribute('aria-expanded')).toBe('true');
  });

  it('defaultOpen=true renders content initially', () => {
    render(<Basic defaultOpen />);
    expect(screen.getByText('body')).toBeInTheDocument();
  });

  it('controlled mode emits onOpenChange without mutating internal state', () => {
    const onOpenChange = vi.fn();
    render(<Basic open={false} onOpenChange={onOpenChange} />);
    fireEvent.click(screen.getByText('toggle'));
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(screen.queryByText('body')).toBeNull();
  });

  it('disabled trigger does not toggle', () => {
    render(<Basic disabled />);
    fireEvent.click(screen.getByText('toggle'));
    expect(screen.queryByText('body')).toBeNull();
  });
});
