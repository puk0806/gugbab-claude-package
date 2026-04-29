import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { RadioGroup } from '../RadioGroup';

describe('RadioGroup (styled-mui)', () => {
  it('Root has gmui-radio-group + size class', () => {
    render(
      <RadioGroup.Root data-testid="root" defaultValue="a" aria-label="x">
        <RadioGroup.Item value="a">
          <RadioGroup.Indicator />
        </RadioGroup.Item>
      </RadioGroup.Root>,
    );
    const root = screen.getByTestId('root');
    expect(root).toHaveClass('gmui-radio-group');
    expect(root).toHaveClass('gmui-radio-group--md');
  });

  it('Item gets data-state="checked" when matching defaultValue', () => {
    render(
      <RadioGroup.Root defaultValue="a" aria-label="x">
        <RadioGroup.Item data-testid="item-a" value="a">
          <RadioGroup.Indicator />
        </RadioGroup.Item>
        <RadioGroup.Item data-testid="item-b" value="b">
          <RadioGroup.Indicator />
        </RadioGroup.Item>
      </RadioGroup.Root>,
    );
    expect(screen.getByTestId('item-a')).toHaveAttribute('data-state', 'checked');
    expect(screen.getByTestId('item-b')).toHaveAttribute('data-state', 'unchecked');
  });

  it('Item has gmui-radio-group__item class', () => {
    render(
      <RadioGroup.Root defaultValue="a" aria-label="x">
        <RadioGroup.Item data-testid="item" value="a">
          <RadioGroup.Indicator />
        </RadioGroup.Item>
      </RadioGroup.Root>,
    );
    expect(screen.getByTestId('item')).toHaveClass('gmui-radio-group__item');
  });
});
