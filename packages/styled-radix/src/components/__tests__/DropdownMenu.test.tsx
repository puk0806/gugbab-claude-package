import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DropdownMenu } from '../DropdownMenu';

describe('DropdownMenu (styled-radix)', () => {
  it('Content / Item carry shared grx-menu__* BEM classes', () => {
    render(
      <DropdownMenu.Root defaultOpen>
        <DropdownMenu.Portal>
          <DropdownMenu.Content data-testid="content">
            <DropdownMenu.Item data-testid="item">A</DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>,
    );
    expect(document.body.querySelector('[data-testid="content"]')).toHaveClass('grx-menu__content');
    expect(document.body.querySelector('[data-testid="item"]')).toHaveClass('grx-menu__item');
  });

  it('CheckboxItem / RadioItem applies item modifier classes', () => {
    render(
      <DropdownMenu.Root defaultOpen>
        <DropdownMenu.Portal>
          <DropdownMenu.Content>
            <DropdownMenu.CheckboxItem data-testid="cb">cb</DropdownMenu.CheckboxItem>
            <DropdownMenu.RadioGroup data-testid="rg" value="a">
              <DropdownMenu.RadioItem data-testid="ri" value="a">
                a
              </DropdownMenu.RadioItem>
            </DropdownMenu.RadioGroup>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>,
    );
    expect(document.body.querySelector('[data-testid="cb"]')).toHaveClass(
      'grx-menu__item--checkbox',
    );
    expect(document.body.querySelector('[data-testid="ri"]')).toHaveClass('grx-menu__item--radio');
    expect(document.body.querySelector('[data-testid="rg"]')).toHaveClass('grx-menu__radio-group');
  });
});
