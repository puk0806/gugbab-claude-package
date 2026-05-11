import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  Accordion,
  AlertDialog,
  Combobox,
  Dialog,
  Form,
  Pagination,
  Select,
  Slider,
  Toggle,
  ToggleGroup,
} from '../..';

// 깊은 wrapper 회귀 테스트 — variant / size prop 이 정확한 BEM modifier
// className 으로 부착되는지, default 값과 consumer className 합성이 정상인지
// 검증한다. 통합 smoke (`styled-smoke.test.tsx`) 가 *export 가능 여부*를 보고,
// 이 파일은 *variant/size 분기*가 v1.0.x 동안 안정적인지 본다.

describe('Accordion variant', () => {
  it.each(['default', 'outline'] as const)('renders gmui-accordion--%s', (variant) => {
    const { container } = render(
      <Accordion.Root data-testid="root" type="single" variant={variant}>
        <Accordion.Item value="a" />
      </Accordion.Root>,
    );
    expect(container.querySelector('[data-testid="root"]')).toHaveClass(
      `gmui-accordion--${variant}`,
    );
  });

  it('default variant is "default"', () => {
    const { container } = render(
      <Accordion.Root data-testid="root" type="single">
        <Accordion.Item value="a" />
      </Accordion.Root>,
    );
    expect(container.querySelector('[data-testid="root"]')).toHaveClass('gmui-accordion--default');
  });

  it('Item has gmui-accordion__item class', () => {
    const { container } = render(
      <Accordion.Root type="single">
        <Accordion.Item value="a" data-testid="item" />
      </Accordion.Root>,
    );
    expect(container.querySelector('[data-testid="item"]')).toHaveClass('gmui-accordion__item');
  });
});

describe('AlertDialog Action variant', () => {
  it.each(['accent', 'danger'] as const)('Action renders variant %s', (variant) => {
    render(
      <AlertDialog.Root defaultOpen>
        <AlertDialog.Portal>
          <AlertDialog.Content>
            <AlertDialog.Action data-testid="action" variant={variant}>
              OK
            </AlertDialog.Action>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>,
    );
    // Portal renders into document.body — use it as the search root.
    const el = document.body.querySelector('[data-testid="action"]');
    expect(el).toHaveClass(`gmui-alert-dialog__action--${variant}`);
  });
});

describe('Dialog Content size', () => {
  it.each(['sm', 'md', 'lg', 'xl'] as const)('renders content size %s', (size) => {
    render(
      <Dialog.Root defaultOpen>
        <Dialog.Portal>
          <Dialog.Content data-testid="content" size={size}>
            <Dialog.Title>t</Dialog.Title>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>,
    );
    const el = document.body.querySelector('[data-testid="content"]');
    expect(el).toHaveClass(`gmui-dialog__content--${size}`);
  });
});

describe('Pagination size', () => {
  it.each(['sm', 'md'] as const)('renders gmui-pagination--%s', (size) => {
    const { container } = render(
      <Pagination.Root data-testid="root" size={size}>
        <Pagination.List>
          <Pagination.Item />
        </Pagination.List>
      </Pagination.Root>,
    );
    expect(container.querySelector('[data-testid="root"]')).toHaveClass(`gmui-pagination--${size}`);
  });
});

describe('Slider size', () => {
  it.each(['sm', 'md'] as const)('renders gmui-slider--%s', (size) => {
    const { container } = render(
      <Slider.Root data-testid="root" size={size} defaultValue={[20]}>
        <Slider.Track>
          <Slider.Range />
        </Slider.Track>
        <Slider.Thumb />
      </Slider.Root>,
    );
    expect(container.querySelector('[data-testid="root"]')).toHaveClass(`gmui-slider--${size}`);
  });
});

describe('Combobox Input size', () => {
  // Combobox 의 size 는 Input 의 BEM modifier 로만 흐른다 (Trigger 는 size 미수신).
  it.each(['sm', 'md'] as const)('Input carries gmui-combobox__input--%s', (size) => {
    const { container } = render(
      <Combobox.Root>
        <Combobox.Anchor>
          <Combobox.Input data-testid="input" size={size} />
        </Combobox.Anchor>
      </Combobox.Root>,
    );
    const input = container.querySelector('[data-testid="input"]');
    expect(input).toHaveClass(`gmui-combobox__input--${size}`);
  });
});

describe('Select Trigger size', () => {
  it.each(['sm', 'md'] as const)('renders gmui-select__trigger--%s', (size) => {
    const { container } = render(
      <Select.Root>
        <Select.Trigger data-testid="trigger" size={size}>
          <Select.Value placeholder="x" />
        </Select.Trigger>
      </Select.Root>,
    );
    expect(container.querySelector('[data-testid="trigger"]')).toHaveClass(
      `gmui-select__trigger--${size}`,
    );
  });
});

describe('Toggle variant + size', () => {
  it.each(['default', 'outline'] as const)('renders variant %s', (variant) => {
    const { container } = render(<Toggle data-testid="t" variant={variant} />);
    expect(container.querySelector('[data-testid="t"]')).toHaveClass(`gmui-toggle--${variant}`);
  });

  it.each(['sm', 'md'] as const)('renders size %s', (size) => {
    const { container } = render(<Toggle data-testid="t" size={size} />);
    expect(container.querySelector('[data-testid="t"]')).toHaveClass(`gmui-toggle--${size}`);
  });
});

describe('ToggleGroup variant + size', () => {
  it.each(['default', 'outline'] as const)('renders variant %s', (variant) => {
    const { container } = render(
      <ToggleGroup.Root data-testid="root" type="single" variant={variant}>
        <ToggleGroup.Item value="a">A</ToggleGroup.Item>
      </ToggleGroup.Root>,
    );
    expect(container.querySelector('[data-testid="root"]')).toHaveClass(
      `gmui-toggle-group--${variant}`,
    );
  });

  it.each(['sm', 'md'] as const)('renders size %s', (size) => {
    const { container } = render(
      <ToggleGroup.Root data-testid="root" type="single" size={size}>
        <ToggleGroup.Item value="a">A</ToggleGroup.Item>
      </ToggleGroup.Root>,
    );
    expect(container.querySelector('[data-testid="root"]')).toHaveClass(
      `gmui-toggle-group--${size}`,
    );
  });
});

describe('Form Field status', () => {
  it.each([
    'error',
    'success',
    'warning',
  ] as const)('Field renders gmui-form__field--%s', (status) => {
    const { container } = render(
      <Form.Root>
        <Form.Field data-testid="field" name="x" status={status}>
          <Form.Label>x</Form.Label>
          <Form.Control />
        </Form.Field>
      </Form.Root>,
    );
    expect(container.querySelector('[data-testid="field"]')).toHaveClass(
      `gmui-form__field--${status}`,
    );
  });

  it('Field default status does not add status modifier', () => {
    const { container } = render(
      <Form.Root>
        <Form.Field data-testid="field" name="x">
          <Form.Label>x</Form.Label>
          <Form.Control />
        </Form.Field>
      </Form.Root>,
    );
    const el = container.querySelector('[data-testid="field"]');
    expect(el).toHaveClass('gmui-form__field');
    expect(el?.className).not.toMatch(/gmui-form__field--error|--success|--warning/);
  });
});

describe('consumer className merge — variant components', () => {
  it('Toggle merges custom className with variant + size', () => {
    const { container } = render(
      <Toggle data-testid="t" variant="outline" size="sm" className="custom" />,
    );
    const el = container.querySelector('[data-testid="t"]');
    expect(el).toHaveClass('gmui-toggle');
    expect(el).toHaveClass('gmui-toggle--outline');
    expect(el).toHaveClass('gmui-toggle--sm');
    expect(el).toHaveClass('custom');
  });
});
