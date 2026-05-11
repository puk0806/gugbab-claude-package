import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  Accordion,
  AlertDialog,
  AspectRatio,
  Avatar,
  Breadcrumbs,
  Checkbox,
  Collapsible,
  Combobox,
  ContextMenu,
  Dialog,
  DropdownMenu,
  Form,
  HoverCard,
  Label,
  Menubar,
  NavigationMenu,
  OneTimePasswordField,
  Pagination,
  Popover,
  Portal,
  Progress,
  RadioGroup,
  ScrollArea,
  Select,
  Separator,
  Slider,
  Slot,
  Slottable,
  Switch,
  Tabs,
  Toast,
  Toggle,
  ToggleGroup,
  Toolbar,
  Tooltip,
  VisuallyHidden,
} from '../..';

// 회귀 안전망 — 35 styled wrapper 가 모두 import 가능하고, compound 컴포넌트의
// 핵심 part 가 누락되지 않았으며, 스타일이 부착되는 단순 컴포넌트는 className
// 합성이 동작하는지 한 번에 확인한다. 깊은 동작 (open/close, focus trap 등)은
// `@gugbab/headless` 의 426 테스트가 이미 커버하므로 여기선 wrapper 회귀만 본다.

describe('styled-mui — export integrity (35 components)', () => {
  it('every component is exported as a defined value', () => {
    const exports = {
      Accordion,
      AlertDialog,
      AspectRatio,
      Avatar,
      Breadcrumbs,
      Checkbox,
      Collapsible,
      Combobox,
      ContextMenu,
      Dialog,
      DropdownMenu,
      Form,
      HoverCard,
      Label,
      Menubar,
      NavigationMenu,
      OneTimePasswordField,
      Pagination,
      Popover,
      Portal,
      Progress,
      RadioGroup,
      ScrollArea,
      Select,
      Separator,
      Slider,
      Slot,
      Slottable,
      Switch,
      Tabs,
      Toast,
      Toggle,
      ToggleGroup,
      Toolbar,
      Tooltip,
      VisuallyHidden,
    };
    for (const [name, value] of Object.entries(exports)) {
      expect(value, `${name} should be exported`).toBeDefined();
    }
  });
});

describe('styled-mui — compound part structure', () => {
  // Compound 가 v1.0.x 안에서 안정적으로 동일한 part 들을 노출하는지 — Tier 별
  // 대표 컴포넌트 의 minimum surface 검증.

  it('Accordion has Root/Item/Header/Trigger/Content', () => {
    expect(Accordion.Root).toBeDefined();
    expect(Accordion.Item).toBeDefined();
    expect(Accordion.Header).toBeDefined();
    expect(Accordion.Trigger).toBeDefined();
    expect(Accordion.Content).toBeDefined();
  });

  it('Dialog has Root/Trigger/Portal/Overlay/Content/Title/Description/Close', () => {
    expect(Dialog.Root).toBeDefined();
    expect(Dialog.Trigger).toBeDefined();
    expect(Dialog.Portal).toBeDefined();
    expect(Dialog.Overlay).toBeDefined();
    expect(Dialog.Content).toBeDefined();
    expect(Dialog.Title).toBeDefined();
    expect(Dialog.Description).toBeDefined();
    expect(Dialog.Close).toBeDefined();
  });

  it('AlertDialog has Root/Trigger/Portal/Overlay/Content/Title/Description/Cancel/Action', () => {
    expect(AlertDialog.Root).toBeDefined();
    expect(AlertDialog.Trigger).toBeDefined();
    expect(AlertDialog.Portal).toBeDefined();
    expect(AlertDialog.Overlay).toBeDefined();
    expect(AlertDialog.Content).toBeDefined();
    expect(AlertDialog.Title).toBeDefined();
    expect(AlertDialog.Description).toBeDefined();
    expect(AlertDialog.Cancel).toBeDefined();
    expect(AlertDialog.Action).toBeDefined();
  });

  it('Popover has Root/Trigger/Anchor/Portal/Content/Close', () => {
    expect(Popover.Root).toBeDefined();
    expect(Popover.Trigger).toBeDefined();
    expect(Popover.Anchor).toBeDefined();
    expect(Popover.Portal).toBeDefined();
    expect(Popover.Content).toBeDefined();
    expect(Popover.Close).toBeDefined();
  });

  it('HoverCard has Root/Trigger/Portal/Content', () => {
    expect(HoverCard.Root).toBeDefined();
    expect(HoverCard.Trigger).toBeDefined();
    expect(HoverCard.Portal).toBeDefined();
    expect(HoverCard.Content).toBeDefined();
  });

  it('Tooltip has Provider/Root/Trigger/Portal/Content', () => {
    expect(Tooltip.Provider).toBeDefined();
    expect(Tooltip.Root).toBeDefined();
    expect(Tooltip.Trigger).toBeDefined();
    expect(Tooltip.Portal).toBeDefined();
    expect(Tooltip.Content).toBeDefined();
  });

  it('DropdownMenu has Root/Trigger/Portal/Content/Item/Sub/SubTrigger/SubContent', () => {
    expect(DropdownMenu.Root).toBeDefined();
    expect(DropdownMenu.Trigger).toBeDefined();
    expect(DropdownMenu.Portal).toBeDefined();
    expect(DropdownMenu.Content).toBeDefined();
    expect(DropdownMenu.Item).toBeDefined();
    expect(DropdownMenu.Sub).toBeDefined();
    expect(DropdownMenu.SubTrigger).toBeDefined();
    expect(DropdownMenu.SubContent).toBeDefined();
  });

  it('ContextMenu has Root/Trigger/Portal/Content/Item/Sub', () => {
    expect(ContextMenu.Root).toBeDefined();
    expect(ContextMenu.Trigger).toBeDefined();
    expect(ContextMenu.Portal).toBeDefined();
    expect(ContextMenu.Content).toBeDefined();
    expect(ContextMenu.Item).toBeDefined();
    expect(ContextMenu.Sub).toBeDefined();
  });

  it('Menubar has Root/Menu/Trigger/Portal/Content/Item', () => {
    expect(Menubar.Root).toBeDefined();
    expect(Menubar.Menu).toBeDefined();
    expect(Menubar.Trigger).toBeDefined();
    expect(Menubar.Portal).toBeDefined();
    expect(Menubar.Content).toBeDefined();
    expect(Menubar.Item).toBeDefined();
  });

  it('Select has Root/Trigger/Value/Portal/Content/Viewport/Item/ItemText/ScrollUpButton/ScrollDownButton/Group/Label', () => {
    expect(Select.Root).toBeDefined();
    expect(Select.Trigger).toBeDefined();
    expect(Select.Value).toBeDefined();
    expect(Select.Portal).toBeDefined();
    expect(Select.Content).toBeDefined();
    expect(Select.Viewport).toBeDefined();
    expect(Select.Item).toBeDefined();
    expect(Select.ItemText).toBeDefined();
    expect(Select.ScrollUpButton).toBeDefined();
    expect(Select.ScrollDownButton).toBeDefined();
    expect(Select.Group).toBeDefined();
    expect(Select.Label).toBeDefined();
  });

  it('Combobox has Root/Anchor/Input/Trigger/Portal/Content/Item', () => {
    expect(Combobox.Root).toBeDefined();
    expect(Combobox.Anchor).toBeDefined();
    expect(Combobox.Input).toBeDefined();
    expect(Combobox.Trigger).toBeDefined();
    expect(Combobox.Portal).toBeDefined();
    expect(Combobox.Content).toBeDefined();
    expect(Combobox.Item).toBeDefined();
  });

  it('Slider has Root/Track/Range/Thumb', () => {
    expect(Slider.Root).toBeDefined();
    expect(Slider.Track).toBeDefined();
    expect(Slider.Range).toBeDefined();
    expect(Slider.Thumb).toBeDefined();
  });

  it('Toast has Provider/Viewport/Root/Title/Description/Action/Close', () => {
    expect(Toast.Provider).toBeDefined();
    expect(Toast.Viewport).toBeDefined();
    expect(Toast.Root).toBeDefined();
    expect(Toast.Title).toBeDefined();
    expect(Toast.Description).toBeDefined();
    expect(Toast.Action).toBeDefined();
    expect(Toast.Close).toBeDefined();
  });

  it('Form has Root/Field/Label/Control/Message/Submit', () => {
    expect(Form.Root).toBeDefined();
    expect(Form.Field).toBeDefined();
    expect(Form.Label).toBeDefined();
    expect(Form.Control).toBeDefined();
    expect(Form.Message).toBeDefined();
    expect(Form.Submit).toBeDefined();
  });

  it('OneTimePasswordField has Root/Input/HiddenInput', () => {
    expect(OneTimePasswordField.Root).toBeDefined();
    expect(OneTimePasswordField.Input).toBeDefined();
    expect(OneTimePasswordField.HiddenInput).toBeDefined();
  });

  it('Pagination has Root/List/Item/Page/Previous/Next/Ellipsis', () => {
    expect(Pagination.Root).toBeDefined();
    expect(Pagination.List).toBeDefined();
    expect(Pagination.Item).toBeDefined();
    expect(Pagination.Page).toBeDefined();
    expect(Pagination.Previous).toBeDefined();
    expect(Pagination.Next).toBeDefined();
    expect(Pagination.Ellipsis).toBeDefined();
  });

  it('Breadcrumbs has Root/List/Item/Link/Separator/Page', () => {
    expect(Breadcrumbs.Root).toBeDefined();
    expect(Breadcrumbs.List).toBeDefined();
    expect(Breadcrumbs.Item).toBeDefined();
    expect(Breadcrumbs.Link).toBeDefined();
    expect(Breadcrumbs.Separator).toBeDefined();
    expect(Breadcrumbs.Page).toBeDefined();
  });

  it('NavigationMenu has Root/List/Item/Trigger/Content/Link', () => {
    expect(NavigationMenu.Root).toBeDefined();
    expect(NavigationMenu.List).toBeDefined();
    expect(NavigationMenu.Item).toBeDefined();
    expect(NavigationMenu.Trigger).toBeDefined();
    expect(NavigationMenu.Content).toBeDefined();
    expect(NavigationMenu.Link).toBeDefined();
  });

  it('Toolbar has Root/Button/Link/Separator/ToggleGroup/ToggleItem', () => {
    expect(Toolbar.Root).toBeDefined();
    expect(Toolbar.Button).toBeDefined();
    expect(Toolbar.Link).toBeDefined();
    expect(Toolbar.Separator).toBeDefined();
    expect(Toolbar.ToggleGroup).toBeDefined();
    expect(Toolbar.ToggleItem).toBeDefined();
  });

  it('ScrollArea has Root/Viewport/Scrollbar/Thumb/Corner', () => {
    expect(ScrollArea.Root).toBeDefined();
    expect(ScrollArea.Viewport).toBeDefined();
    expect(ScrollArea.Scrollbar).toBeDefined();
    expect(ScrollArea.Thumb).toBeDefined();
    expect(ScrollArea.Corner).toBeDefined();
  });

  it('Collapsible has Root/Trigger/Content', () => {
    expect(Collapsible.Root).toBeDefined();
    expect(Collapsible.Trigger).toBeDefined();
    expect(Collapsible.Content).toBeDefined();
  });

  it('Tabs has Root/List/Trigger/Content', () => {
    expect(Tabs.Root).toBeDefined();
    expect(Tabs.List).toBeDefined();
    expect(Tabs.Trigger).toBeDefined();
    expect(Tabs.Content).toBeDefined();
  });

  it('ToggleGroup has Root/Item', () => {
    expect(ToggleGroup.Root).toBeDefined();
    expect(ToggleGroup.Item).toBeDefined();
  });

  it('RadioGroup has Root/Item/Indicator', () => {
    expect(RadioGroup.Root).toBeDefined();
    expect(RadioGroup.Item).toBeDefined();
    expect(RadioGroup.Indicator).toBeDefined();
  });

  it('Checkbox has Root/Indicator', () => {
    expect(Checkbox.Root).toBeDefined();
    expect(Checkbox.Indicator).toBeDefined();
  });

  it('Switch has Root/Thumb', () => {
    expect(Switch.Root).toBeDefined();
    expect(Switch.Thumb).toBeDefined();
  });
});

describe('styled-mui — render & className smoke (single-element components)', () => {
  // Compound 가 아니거나 Provider/Portal 없이 단독 렌더 가능한 컴포넌트만 검증.

  it('AspectRatio applies gmui-aspect-ratio', () => {
    const { container } = render(<AspectRatio data-testid="ar" />);
    const el = container.querySelector('[data-testid="ar"]');
    expect(el).toHaveClass('gmui-aspect-ratio');
  });

  it('AspectRatio merges consumer className', () => {
    const { container } = render(<AspectRatio data-testid="ar" className="custom" />);
    const el = container.querySelector('[data-testid="ar"]');
    expect(el).toHaveClass('gmui-aspect-ratio');
    expect(el).toHaveClass('custom');
  });

  it('Separator applies gmui-separator and orientation modifier', () => {
    const { container, rerender } = render(<Separator data-testid="sep" />);
    const sep1 = container.querySelector('[data-testid="sep"]');
    expect(sep1).toHaveClass('gmui-separator');
    expect(sep1).toHaveClass('gmui-separator--horizontal');

    rerender(<Separator data-testid="sep" orientation="vertical" />);
    const sep2 = container.querySelector('[data-testid="sep"]');
    expect(sep2).toHaveClass('gmui-separator--vertical');
  });

  it('Toggle applies gmui-toggle and merges className', () => {
    const { container } = render(<Toggle data-testid="t" className="custom" />);
    const el = container.querySelector('[data-testid="t"]');
    expect(el).toHaveClass('gmui-toggle');
    expect(el).toHaveClass('custom');
  });

  it('VisuallyHidden renders as a non-empty span (re-export)', () => {
    const { container } = render(<VisuallyHidden>hidden text</VisuallyHidden>);
    expect(container.textContent).toBe('hidden text');
  });
});
