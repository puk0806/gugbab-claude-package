import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Breadcrumbs } from '../Breadcrumbs';

describe('Breadcrumbs (styled-mui)', () => {
  it('Root applies gmui-breadcrumbs with default chevron separator', () => {
    const { container } = render(
      <Breadcrumbs.Root data-testid="root">
        <Breadcrumbs.List />
      </Breadcrumbs.Root>,
    );
    const el = container.querySelector('[data-testid="root"]');
    expect(el).toHaveClass('gmui-breadcrumbs');
    expect(el).toHaveClass('gmui-breadcrumbs--chevron');
  });

  it.each(['chevron', 'slash'] as const)('separator variant %s', (separator) => {
    const { container } = render(
      <Breadcrumbs.Root data-testid="root" separator={separator}>
        <Breadcrumbs.List />
      </Breadcrumbs.Root>,
    );
    expect(container.querySelector('[data-testid="root"]')).toHaveClass(
      `gmui-breadcrumbs--${separator}`,
    );
  });

  it('List/Item/Link/Separator/Page parts have BEM classes', () => {
    const { container } = render(
      <Breadcrumbs.Root>
        <Breadcrumbs.List data-testid="list">
          <Breadcrumbs.Item data-testid="item">
            <Breadcrumbs.Link data-testid="link" href="/">
              Home
            </Breadcrumbs.Link>
          </Breadcrumbs.Item>
          <Breadcrumbs.Separator data-testid="sep" />
          <Breadcrumbs.Item>
            <Breadcrumbs.Page data-testid="page">Now</Breadcrumbs.Page>
          </Breadcrumbs.Item>
        </Breadcrumbs.List>
      </Breadcrumbs.Root>,
    );
    expect(container.querySelector('[data-testid="list"]')).toHaveClass('gmui-breadcrumbs__list');
    expect(container.querySelector('[data-testid="item"]')).toHaveClass('gmui-breadcrumbs__item');
    expect(container.querySelector('[data-testid="link"]')).toHaveClass('gmui-breadcrumbs__link');
    expect(container.querySelector('[data-testid="sep"]')).toHaveClass(
      'gmui-breadcrumbs__separator',
    );
    expect(container.querySelector('[data-testid="page"]')).toHaveClass('gmui-breadcrumbs__page');
  });
});
