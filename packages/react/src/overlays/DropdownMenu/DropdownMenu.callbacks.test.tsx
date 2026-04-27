import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DropdownMenu } from './DropdownMenu';

describe('DropdownMenu.Content callbacks', () => {
  it('onEscapeKeyDown is called when Escape is pressed', () => {
    const onEscapeKeyDown = vi.fn();
    render(
      <DropdownMenu.Root defaultOpen>
        <DropdownMenu.Trigger>menu</DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content onEscapeKeyDown={onEscapeKeyDown}>
            <DropdownMenu.Item>item</DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>,
    );
    const content = screen.getByText('item').closest('[data-state]') as HTMLElement;
    fireEvent.keyDown(content, { key: 'Escape' });
    expect(onEscapeKeyDown).toHaveBeenCalled();
  });

  it('onEscapeKeyDown can prevent default to cancel dismiss', () => {
    const onEscapeKeyDown = vi.fn((e: KeyboardEvent) => e.preventDefault());
    render(
      <DropdownMenu.Root defaultOpen>
        <DropdownMenu.Trigger>menu</DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content onEscapeKeyDown={onEscapeKeyDown}>
            <DropdownMenu.Item>item</DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>,
    );
    const content = screen.getByText('item').closest('[data-state]') as HTMLElement;
    fireEvent.keyDown(content, { key: 'Escape' });
    expect(onEscapeKeyDown).toHaveBeenCalled();
    // menu stays open because default was prevented
    expect(screen.getByText('item')).toBeInTheDocument();
  });

  it('onOpenAutoFocus callback prop is accepted without error', () => {
    const onOpenAutoFocus = vi.fn();
    expect(() =>
      render(
        <DropdownMenu.Root defaultOpen>
          <DropdownMenu.Trigger>menu</DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content onOpenAutoFocus={onOpenAutoFocus}>
              <DropdownMenu.Item>item</DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>,
      ),
    ).not.toThrow();
  });

  it('onCloseAutoFocus callback prop is accepted without error', () => {
    const onCloseAutoFocus = vi.fn();
    expect(() =>
      render(
        <DropdownMenu.Root defaultOpen>
          <DropdownMenu.Trigger>menu</DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content onCloseAutoFocus={onCloseAutoFocus}>
              <DropdownMenu.Item>item</DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>,
      ),
    ).not.toThrow();
  });

  it('onPointerDownOutside callback prop is accepted without error', () => {
    const onPointerDownOutside = vi.fn();
    expect(() =>
      render(
        <DropdownMenu.Root defaultOpen>
          <DropdownMenu.Trigger>menu</DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content onPointerDownOutside={onPointerDownOutside}>
              <DropdownMenu.Item>item</DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>,
      ),
    ).not.toThrow();
  });

  it('onFocusOutside callback prop is accepted without error', () => {
    const onFocusOutside = vi.fn();
    expect(() =>
      render(
        <DropdownMenu.Root defaultOpen>
          <DropdownMenu.Trigger>menu</DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content onFocusOutside={onFocusOutside}>
              <DropdownMenu.Item>item</DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>,
      ),
    ).not.toThrow();
  });

  it('onInteractOutside callback prop is accepted without error', () => {
    const onInteractOutside = vi.fn();
    expect(() =>
      render(
        <DropdownMenu.Root defaultOpen>
          <DropdownMenu.Trigger>menu</DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content onInteractOutside={onInteractOutside}>
              <DropdownMenu.Item>item</DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>,
      ),
    ).not.toThrow();
  });
});

describe('DropdownMenu.SubContent callbacks', () => {
  it('onEscapeKeyDown is called on SubContent when Escape is pressed', () => {
    const onEscapeKeyDown = vi.fn();
    render(
      <DropdownMenu.Root defaultOpen>
        <DropdownMenu.Trigger>menu</DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Sub defaultOpen>
            <DropdownMenu.SubTrigger>more</DropdownMenu.SubTrigger>
            <DropdownMenu.SubContent onEscapeKeyDown={onEscapeKeyDown}>
              <DropdownMenu.Item>nested</DropdownMenu.Item>
            </DropdownMenu.SubContent>
          </DropdownMenu.Sub>
        </DropdownMenu.Content>
      </DropdownMenu.Root>,
    );
    const subContent = screen.getByText('nested').closest('[data-state]') as HTMLElement;
    fireEvent.keyDown(subContent, { key: 'Escape' });
    expect(onEscapeKeyDown).toHaveBeenCalled();
  });

  it('onOpenAutoFocus on SubContent is accepted without error', () => {
    const onOpenAutoFocus = vi.fn();
    expect(() =>
      render(
        <DropdownMenu.Root defaultOpen>
          <DropdownMenu.Trigger>menu</DropdownMenu.Trigger>
          <DropdownMenu.Content>
            <DropdownMenu.Sub defaultOpen>
              <DropdownMenu.SubTrigger>more</DropdownMenu.SubTrigger>
              <DropdownMenu.SubContent onOpenAutoFocus={onOpenAutoFocus}>
                <DropdownMenu.Item>nested</DropdownMenu.Item>
              </DropdownMenu.SubContent>
            </DropdownMenu.Sub>
          </DropdownMenu.Content>
        </DropdownMenu.Root>,
      ),
    ).not.toThrow();
  });

  it('onCloseAutoFocus on SubContent is accepted without error', () => {
    const onCloseAutoFocus = vi.fn();
    expect(() =>
      render(
        <DropdownMenu.Root defaultOpen>
          <DropdownMenu.Trigger>menu</DropdownMenu.Trigger>
          <DropdownMenu.Content>
            <DropdownMenu.Sub defaultOpen>
              <DropdownMenu.SubTrigger>more</DropdownMenu.SubTrigger>
              <DropdownMenu.SubContent onCloseAutoFocus={onCloseAutoFocus}>
                <DropdownMenu.Item>nested</DropdownMenu.Item>
              </DropdownMenu.SubContent>
            </DropdownMenu.Sub>
          </DropdownMenu.Content>
        </DropdownMenu.Root>,
      ),
    ).not.toThrow();
  });

  it('onPointerDownOutside on SubContent is accepted without error', () => {
    const onPointerDownOutside = vi.fn();
    expect(() =>
      render(
        <DropdownMenu.Root defaultOpen>
          <DropdownMenu.Trigger>menu</DropdownMenu.Trigger>
          <DropdownMenu.Content>
            <DropdownMenu.Sub defaultOpen>
              <DropdownMenu.SubTrigger>more</DropdownMenu.SubTrigger>
              <DropdownMenu.SubContent onPointerDownOutside={onPointerDownOutside}>
                <DropdownMenu.Item>nested</DropdownMenu.Item>
              </DropdownMenu.SubContent>
            </DropdownMenu.Sub>
          </DropdownMenu.Content>
        </DropdownMenu.Root>,
      ),
    ).not.toThrow();
  });

  it('onFocusOutside on SubContent is accepted without error', () => {
    const onFocusOutside = vi.fn();
    expect(() =>
      render(
        <DropdownMenu.Root defaultOpen>
          <DropdownMenu.Trigger>menu</DropdownMenu.Trigger>
          <DropdownMenu.Content>
            <DropdownMenu.Sub defaultOpen>
              <DropdownMenu.SubTrigger>more</DropdownMenu.SubTrigger>
              <DropdownMenu.SubContent onFocusOutside={onFocusOutside}>
                <DropdownMenu.Item>nested</DropdownMenu.Item>
              </DropdownMenu.SubContent>
            </DropdownMenu.Sub>
          </DropdownMenu.Content>
        </DropdownMenu.Root>,
      ),
    ).not.toThrow();
  });

  it('onInteractOutside on SubContent is accepted without error', () => {
    const onInteractOutside = vi.fn();
    expect(() =>
      render(
        <DropdownMenu.Root defaultOpen>
          <DropdownMenu.Trigger>menu</DropdownMenu.Trigger>
          <DropdownMenu.Content>
            <DropdownMenu.Sub defaultOpen>
              <DropdownMenu.SubTrigger>more</DropdownMenu.SubTrigger>
              <DropdownMenu.SubContent onInteractOutside={onInteractOutside}>
                <DropdownMenu.Item>nested</DropdownMenu.Item>
              </DropdownMenu.SubContent>
            </DropdownMenu.Sub>
          </DropdownMenu.Content>
        </DropdownMenu.Root>,
      ),
    ).not.toThrow();
  });
});
