import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { NavigationMenu } from './NavigationMenu';

function Nav() {
  return (
    <NavigationMenu.Root>
      <NavigationMenu.List>
        <NavigationMenu.Item value="products">
          <NavigationMenu.Trigger>Products</NavigationMenu.Trigger>
          <NavigationMenu.Content>
            <NavigationMenu.Link href="/a">A</NavigationMenu.Link>
          </NavigationMenu.Content>
        </NavigationMenu.Item>
        <NavigationMenu.Item value="docs">
          <NavigationMenu.Link href="/docs" active>
            Docs
          </NavigationMenu.Link>
        </NavigationMenu.Item>
      </NavigationMenu.List>
    </NavigationMenu.Root>
  );
}

describe('NavigationMenu — 키보드·현재 페이지 (APG Disclosure Navigation)', () => {
  it('열린 메뉴에서 Escape 를 누르면 닫히고 포커스가 트리거로 돌아간다', () => {
    render(<Nav />);
    const trigger = screen.getByText('Products');
    fireEvent.click(trigger);
    const link = screen.getByText('A');
    link.focus();
    fireEvent.keyDown(link, { key: 'Escape' });
    expect(screen.queryByText('A')).toBeNull();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(document.activeElement).toBe(trigger);
  });

  it('닫힌 상태의 Escape 는 아무것도 하지 않는다 (경계)', () => {
    render(<Nav />);
    const trigger = screen.getByText('Products');
    trigger.focus();
    fireEvent.keyDown(trigger, { key: 'Escape' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(document.activeElement).toBe(trigger);
  });

  it('소비자가 Trigger 에 id 를 지정해도 Escape 복원·aria-labelledby 가 유지된다 (경계)', () => {
    render(
      <NavigationMenu.Root>
        <NavigationMenu.List>
          <NavigationMenu.Item value="p">
            <NavigationMenu.Trigger id="my-trigger">Products</NavigationMenu.Trigger>
            <NavigationMenu.Content>
              <NavigationMenu.Link href="/a">A</NavigationMenu.Link>
            </NavigationMenu.Content>
          </NavigationMenu.Item>
        </NavigationMenu.List>
      </NavigationMenu.Root>,
    );
    const trigger = screen.getByText('Products');
    fireEvent.click(trigger);
    const link = screen.getByText('A');
    expect(link.closest('[aria-labelledby]')).toHaveAttribute('aria-labelledby', 'my-trigger');
    link.focus();
    fireEvent.keyDown(link, { key: 'Escape' });
    expect(document.activeElement).toBe(trigger);
  });

  it('하위 메뉴를 닫는 Escape 는 바깥(감싼 다이얼로그 등)으로 전파되지 않는다', () => {
    const outer = vi.fn();
    render(
      <div onKeyDown={(e) => outer(e.key)}>
        <Nav />
      </div>,
    );
    fireEvent.click(screen.getByText('Products'));
    fireEvent.keyDown(screen.getByText('A'), { key: 'Escape' });
    expect(outer).not.toHaveBeenCalled();
    // 닫힌 상태의 Escape 는 그대로 전파된다
    fireEvent.keyDown(screen.getByText('Products'), { key: 'Escape' });
    expect(outer).toHaveBeenCalledWith('Escape');
  });

  it('active 링크는 aria-current="page" 를 갖고, 아닌 링크는 갖지 않는다', () => {
    render(<Nav />);
    expect(screen.getByText('Docs')).toHaveAttribute('aria-current', 'page');
    fireEvent.click(screen.getByText('Products'));
    expect(screen.getByText('A')).not.toHaveAttribute('aria-current');
  });

  it('열린 상태에서 axe 위반이 없다 (역할 없는 div 의 aria-labelledby 금지 등)', async () => {
    const { container } = render(<Nav />);
    fireEvent.click(screen.getByText('Products'));
    expect(await axe(container)).toHaveNoViolations();
  });

  it('Root 밖의 Trigger 는 명확한 에러로 거부한다 (오용)', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<NavigationMenu.Trigger>x</NavigationMenu.Trigger>)).toThrow();
    spy.mockRestore();
  });
});
