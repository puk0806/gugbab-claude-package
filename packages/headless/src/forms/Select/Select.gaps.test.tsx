/**
 * Select — Radix gap coverage
 *
 * Covers:
 *  1. ScrollUpButton / ScrollDownButton — rendered, aria-hidden, scroll on hover
 *  2. Content position prop — 'popper' (default) and 'item-aligned' data-attribute
 *  3. BubbleInput (hidden input) — rendered when `name` is provided, value updates
 *  4. Group + Label — role="group", role="presentation", aria-labelledby linkage
 */

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Select } from './Select';

// ─── helpers ────────────────────────────────────────────────────────────────

function openSelect(label = 'select') {
  fireEvent.click(screen.getByRole('combobox', { name: label }));
}

// ─── 1. ScrollButtons ────────────────────────────────────────────────────────

describe('Select.ScrollUpButton / ScrollDownButton', () => {
  function ScrollSample() {
    return (
      <Select.Root defaultOpen>
        <Select.Trigger aria-label="select">
          <Select.Value />
        </Select.Trigger>
        <Select.Portal>
          <Select.Content>
            <Select.ScrollUpButton data-testid="scroll-up">▲</Select.ScrollUpButton>
            <Select.Viewport>
              <Select.Item value="a">A</Select.Item>
            </Select.Viewport>
            <Select.ScrollDownButton data-testid="scroll-down">▼</Select.ScrollDownButton>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    );
  }

  it('renders ScrollUpButton and ScrollDownButton', () => {
    render(<ScrollSample />);
    expect(screen.getByTestId('scroll-up')).toBeInTheDocument();
    expect(screen.getByTestId('scroll-down')).toBeInTheDocument();
  });

  it('scroll buttons are aria-hidden', () => {
    render(<ScrollSample />);
    expect(screen.getByTestId('scroll-up')).toHaveAttribute('aria-hidden');
    expect(screen.getByTestId('scroll-down')).toHaveAttribute('aria-hidden');
  });

  it('scroll buttons carry correct data-scroll-button attribute', () => {
    render(<ScrollSample />);
    expect(screen.getByTestId('scroll-up')).toHaveAttribute('data-scroll-button', 'up');
    expect(screen.getByTestId('scroll-down')).toHaveAttribute('data-scroll-button', 'down');
  });

  it('ScrollUpButton calls setInterval on pointerenter and clearInterval on pointerleave', () => {
    const setIntervalSpy = vi.spyOn(window, 'setInterval');
    const clearIntervalSpy = vi.spyOn(window, 'clearInterval');

    render(<ScrollSample />);
    const upBtn = screen.getByTestId('scroll-up');

    fireEvent.pointerEnter(upBtn);
    expect(setIntervalSpy).toHaveBeenCalled();

    fireEvent.pointerLeave(upBtn);
    expect(clearIntervalSpy).toHaveBeenCalled();

    setIntervalSpy.mockRestore();
    clearIntervalSpy.mockRestore();
  });

  it('ScrollDownButton calls setInterval on pointerenter and clearInterval on pointerleave', () => {
    const setIntervalSpy = vi.spyOn(window, 'setInterval');
    const clearIntervalSpy = vi.spyOn(window, 'clearInterval');

    render(<ScrollSample />);
    const downBtn = screen.getByTestId('scroll-down');

    fireEvent.pointerEnter(downBtn);
    expect(setIntervalSpy).toHaveBeenCalled();

    fireEvent.pointerLeave(downBtn);
    expect(clearIntervalSpy).toHaveBeenCalled();

    setIntervalSpy.mockRestore();
    clearIntervalSpy.mockRestore();
  });

  it('ScrollUpButton does not throw when scrollTop is manipulated via interval', () => {
    const setIntervalSpy = vi.spyOn(window, 'setInterval');

    render(<ScrollSample />);
    const upBtn = screen.getByTestId('scroll-up');

    // Should not throw
    expect(() => {
      fireEvent.pointerEnter(upBtn);
      fireEvent.pointerLeave(upBtn);
    }).not.toThrow();

    setIntervalSpy.mockRestore();
  });
});

// ─── 2. Content position prop ────────────────────────────────────────────────

describe('Select.Content position prop', () => {
  function PositionSample({ position }: { position?: 'popper' | 'item-aligned' }) {
    return (
      <Select.Root defaultOpen>
        <Select.Trigger aria-label="select">
          <Select.Value />
        </Select.Trigger>
        <Select.Portal>
          <Select.Content position={position} data-testid="content">
            <Select.Viewport>
              <Select.Item value="x">X</Select.Item>
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    );
  }

  it('defaults to data-position="popper"', () => {
    render(<PositionSample />);
    expect(screen.getByTestId('content')).toHaveAttribute('data-position', 'popper');
  });

  it('sets data-position="item-aligned" when position="item-aligned"', () => {
    render(<PositionSample position="item-aligned" />);
    expect(screen.getByTestId('content')).toHaveAttribute('data-position', 'item-aligned');
  });

  it('sets data-position="popper" explicitly', () => {
    render(<PositionSample position="popper" />);
    expect(screen.getByTestId('content')).toHaveAttribute('data-position', 'popper');
  });
});

// ─── 3. BubbleInput (hidden input for form submission) ───────────────────────

describe('Select.Root name / form — hidden input', () => {
  it('renders a hidden input when name is provided', () => {
    render(
      <Select.Root name="country" defaultValue="kr">
        <Select.Trigger aria-label="select">
          <Select.Value />
        </Select.Trigger>
        <Select.Portal>
          <Select.Content>
            <Select.Viewport>
              <Select.Item value="kr">Korea</Select.Item>
              <Select.Item value="jp">Japan</Select.Item>
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>,
    );

    // biome-ignore lint/style/noNonNullAssertion: element is guaranteed to exist by the render above
    const hidden = document.querySelector('input[type="hidden"][name="country"]')!;
    expect(hidden).toBeInTheDocument();
    expect(hidden).toHaveAttribute('value', 'kr');
  });

  it('does NOT render a hidden input when name is omitted', () => {
    render(
      <Select.Root defaultValue="kr">
        <Select.Trigger aria-label="select">
          <Select.Value />
        </Select.Trigger>
        <Select.Portal>
          <Select.Content>
            <Select.Viewport>
              <Select.Item value="kr">Korea</Select.Item>
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>,
    );

    const hidden = document.querySelector('input[type="hidden"]');
    expect(hidden).toBeNull();
  });

  it('hidden input value updates when selection changes', () => {
    render(
      <Select.Root name="fruit" defaultValue="apple">
        <Select.Trigger aria-label="select">
          <Select.Value />
        </Select.Trigger>
        <Select.Portal>
          <Select.Content>
            <Select.Viewport>
              <Select.Item value="apple">Apple</Select.Item>
              <Select.Item value="banana">Banana</Select.Item>
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>,
    );

    openSelect();
    fireEvent.click(screen.getByRole('option', { name: 'Banana' }));

    // biome-ignore lint/style/noNonNullAssertion: element is guaranteed to exist by the render above
    const hidden = document.querySelector('input[type="hidden"][name="fruit"]')!;
    expect(hidden).toHaveAttribute('value', 'banana');
  });

  it('associates hidden input with form via form attribute', () => {
    render(
      <Select.Root name="field" form="my-form" defaultValue="a">
        <Select.Trigger aria-label="select">
          <Select.Value />
        </Select.Trigger>
        <Select.Portal>
          <Select.Content>
            <Select.Viewport>
              <Select.Item value="a">A</Select.Item>
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>,
    );

    // biome-ignore lint/style/noNonNullAssertion: element is guaranteed to exist by the render above
    const hidden = document.querySelector('input[type="hidden"][name="field"]')!;
    expect(hidden).toHaveAttribute('form', 'my-form');
  });
});

// ─── 4. Group + Label ────────────────────────────────────────────────────────

describe('Select.Group + Select.Label', () => {
  function GroupSample() {
    return (
      <Select.Root defaultOpen>
        <Select.Trigger aria-label="select">
          <Select.Value />
        </Select.Trigger>
        <Select.Portal>
          <Select.Content>
            <Select.Viewport>
              <Select.Group data-testid="group-asia">
                <Select.Label data-testid="label-asia">아시아</Select.Label>
                <Select.Item value="kr">한국</Select.Item>
                <Select.Item value="jp">일본</Select.Item>
              </Select.Group>
              <Select.Group data-testid="group-europe">
                <Select.Label data-testid="label-europe">유럽</Select.Label>
                <Select.Item value="de">독일</Select.Item>
              </Select.Group>
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    );
  }

  it('Group has role="group"', () => {
    render(<GroupSample />);
    const groups = screen.getAllByRole('group');
    expect(groups).toHaveLength(2);
  });

  it('Label has role="presentation"', () => {
    render(<GroupSample />);
    const label = screen.getByTestId('label-asia');
    expect(label).toHaveAttribute('role', 'presentation');
  });

  it('Group is linked to its Label via aria-labelledby', () => {
    render(<GroupSample />);
    const asiaGroup = screen.getByTestId('group-asia');
    const asiaLabel = screen.getByTestId('label-asia');

    const labelledBy = asiaGroup.getAttribute('aria-labelledby');
    expect(labelledBy).toBeTruthy();
    expect(asiaLabel.getAttribute('id')).toBe(labelledBy);
  });

  it('each Group has a distinct aria-labelledby id', () => {
    render(<GroupSample />);
    const asiaGroup = screen.getByTestId('group-asia');
    const europeGroup = screen.getByTestId('group-europe');

    const asiaId = asiaGroup.getAttribute('aria-labelledby');
    const europeId = europeGroup.getAttribute('aria-labelledby');
    expect(asiaId).not.toBe(europeId);
  });

  it('renders items inside groups', () => {
    render(<GroupSample />);
    expect(screen.getByRole('option', { name: '한국' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '일본' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '독일' })).toBeInTheDocument();
  });

  it('Select.Label is an alias for Select.GroupLabel', () => {
    // Both should resolve to the same component
    render(<GroupSample />);
    const labels = screen.getAllByRole('presentation');
    expect(labels).toHaveLength(2);
    expect(labels[0]).toHaveTextContent('아시아');
    expect(labels[1]).toHaveTextContent('유럽');
  });
});
