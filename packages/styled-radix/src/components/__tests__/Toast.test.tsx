import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Toast } from '../Toast';

describe('Toast (styled-radix)', () => {
  function setup() {
    return render(
      <Toast.Provider>
        <Toast.Viewport data-testid="viewport" />
        <Toast.Root data-testid="root" open>
          <Toast.Title data-testid="title">Title</Toast.Title>
          <Toast.Description data-testid="desc">Desc</Toast.Description>
          <Toast.Action data-testid="action" altText="alt">
            Do
          </Toast.Action>
          <Toast.Close data-testid="close">x</Toast.Close>
        </Toast.Root>
      </Toast.Provider>,
    );
  }

  it('Viewport applies grx-toast-viewport', () => {
    const { container } = setup();
    expect(container.querySelector('[data-testid="viewport"]')).toHaveClass('grx-toast-viewport');
  });

  it('Root / Title / Description / Action / Close have BEM classes', () => {
    const { container } = setup();
    expect(container.querySelector('[data-testid="root"]')).toHaveClass('grx-toast');
    expect(container.querySelector('[data-testid="title"]')).toHaveClass('grx-toast__title');
    expect(container.querySelector('[data-testid="desc"]')).toHaveClass('grx-toast__description');
    expect(container.querySelector('[data-testid="action"]')).toHaveClass('grx-toast__action');
    expect(container.querySelector('[data-testid="close"]')).toHaveClass('grx-toast__close');
  });
});
