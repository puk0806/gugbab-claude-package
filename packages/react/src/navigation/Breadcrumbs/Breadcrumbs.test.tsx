import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Breadcrumbs } from './Breadcrumbs';

describe('Breadcrumbs', () => {
  it('renders a nav landmark with label', () => {
    render(
      <Breadcrumbs.Root>
        <Breadcrumbs.List>
          <Breadcrumbs.Item>
            <Breadcrumbs.Link href="/">Home</Breadcrumbs.Link>
          </Breadcrumbs.Item>
          <Breadcrumbs.Separator>/</Breadcrumbs.Separator>
          <Breadcrumbs.Item>
            <Breadcrumbs.Page>Current</Breadcrumbs.Page>
          </Breadcrumbs.Item>
        </Breadcrumbs.List>
      </Breadcrumbs.Root>,
    );
    expect(screen.getByRole('navigation', { name: 'breadcrumbs' })).toBeInTheDocument();
    expect(screen.getByText('Current').getAttribute('aria-current')).toBe('page');
  });
});
