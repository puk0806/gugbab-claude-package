import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Pagination } from '../Pagination';

describe('Pagination (styled-radix)', () => {
  it('Root applies grx-pagination with default md size', () => {
    const { container } = render(
      <Pagination.Root data-testid="root">
        <Pagination.List />
      </Pagination.Root>,
    );
    const el = container.querySelector('[data-testid="root"]');
    expect(el).toHaveClass('grx-pagination');
    expect(el).toHaveClass('grx-pagination--md');
  });

  it.each(['sm', 'md'] as const)('size %s applies modifier', (size) => {
    const { container } = render(
      <Pagination.Root data-testid="root" size={size}>
        <Pagination.List />
      </Pagination.Root>,
    );
    expect(container.querySelector('[data-testid="root"]')).toHaveClass(`grx-pagination--${size}`);
  });

  it('List/Item/Page/Previous/Next/Ellipsis have BEM classes', () => {
    const { container } = render(
      <Pagination.Root>
        <Pagination.List data-testid="list">
          <Pagination.Item data-testid="item">
            <Pagination.Previous data-testid="prev" />
          </Pagination.Item>
          <Pagination.Item>
            <Pagination.Page data-testid="page" page={1}>
              1
            </Pagination.Page>
          </Pagination.Item>
          <Pagination.Item>
            <Pagination.Ellipsis data-testid="ellipsis" />
          </Pagination.Item>
          <Pagination.Item>
            <Pagination.Next data-testid="next" />
          </Pagination.Item>
        </Pagination.List>
      </Pagination.Root>,
    );
    expect(container.querySelector('[data-testid="list"]')).toHaveClass('grx-pagination__list');
    expect(container.querySelector('[data-testid="item"]')).toHaveClass('grx-pagination__item');
    expect(container.querySelector('[data-testid="prev"]')).toHaveClass('grx-pagination__prev');
    expect(container.querySelector('[data-testid="page"]')).toHaveClass('grx-pagination__page');
    expect(container.querySelector('[data-testid="ellipsis"]')).toHaveClass(
      'grx-pagination__ellipsis',
    );
    expect(container.querySelector('[data-testid="next"]')).toHaveClass('grx-pagination__next');
  });
});
