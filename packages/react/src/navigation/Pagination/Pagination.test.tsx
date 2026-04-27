import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Pagination } from './Pagination';

function Sample(props: Parameters<typeof Pagination.Root>[0]) {
  return (
    <Pagination.Root {...props}>
      <Pagination.List>
        <Pagination.Item>
          <Pagination.Previous>prev</Pagination.Previous>
        </Pagination.Item>
        <Pagination.Item>
          <Pagination.Page page={1}>1</Pagination.Page>
        </Pagination.Item>
        <Pagination.Item>
          <Pagination.Page page={2}>2</Pagination.Page>
        </Pagination.Item>
        <Pagination.Item>
          <Pagination.Page page={3}>3</Pagination.Page>
        </Pagination.Item>
        <Pagination.Item>
          <Pagination.Next>next</Pagination.Next>
        </Pagination.Item>
      </Pagination.List>
    </Pagination.Root>
  );
}

describe('Pagination', () => {
  it('marks current page with aria-current="page"', () => {
    render(<Sample pageCount={3} defaultPage={2} />);
    expect(screen.getByText('2').getAttribute('aria-current')).toBe('page');
    expect(screen.getByText('1').getAttribute('aria-current')).toBeNull();
  });

  it('Previous is disabled on first page', () => {
    render(<Sample pageCount={3} defaultPage={1} />);
    expect(screen.getByText('prev')).toBeDisabled();
  });

  it('Next is disabled on last page', () => {
    render(<Sample pageCount={3} defaultPage={3} />);
    expect(screen.getByText('next')).toBeDisabled();
  });

  it('clicking a Page moves to that page', () => {
    render(<Sample pageCount={3} defaultPage={1} />);
    fireEvent.click(screen.getByText('3'));
    expect(screen.getByText('3').getAttribute('aria-current')).toBe('page');
  });

  it('Next/Previous move by 1', () => {
    render(<Sample pageCount={3} defaultPage={1} />);
    fireEvent.click(screen.getByText('next'));
    expect(screen.getByText('2').getAttribute('aria-current')).toBe('page');
    fireEvent.click(screen.getByText('prev'));
    expect(screen.getByText('1').getAttribute('aria-current')).toBe('page');
  });
});
