/**
 * axe-core smoke for the forms tier — closed AND open/interactive states.
 * (a11y.test.tsx only covered primitives/stateful/navigation.)
 * jsdom cannot evaluate colour contrast or layout; those are covered by the
 * styled packages' CSS tests and the visual-regression suite.
 */
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { Combobox } from './Combobox';
import { Form } from './Form';
import { OneTimePasswordField } from './OneTimePasswordField';
import { Select } from './Select';
import { Slider } from './Slider';
import { Toast } from './Toast';

// jsdom reports navigator.vendor "Apple Computer, Inc.", which sends floating-ui
// down its Safari path: focus guards get role="button" without aria-hidden (a
// deliberate upstream trade-off so VoiceOver can move focus). That markup is
// floating-ui's, not ours — audit as a Chromium browser, where guards are
// aria-hidden. Known upstream limitation, recorded in the priority-4 plan.
const realVendor = Object.getOwnPropertyDescriptor(Navigator.prototype, 'vendor');
beforeAll(() => {
  Object.defineProperty(navigator, 'vendor', { value: 'Google Inc.', configurable: true });
});
afterAll(() => {
  // Remove the own-property override so the prototype getter is used again.
  delete (navigator as unknown as Record<string, unknown>).vendor;
  if (realVendor) Object.defineProperty(Navigator.prototype, 'vendor', realVendor);
});

beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }));
afterEach(() => vi.useRealTimers());

async function expectNoViolations(container: Element) {
  vi.useRealTimers(); // axe schedules its own timers
  // - `region` is a page-level rule (all content inside landmarks) — not
  //   meaningful for an isolated component render.
  expect(await axe(container, { rules: { region: { enabled: false } } })).toHaveNoViolations();
}

describe('a11y: forms', () => {
  it('Select — 닫힘·열림 상태', async () => {
    render(
      <Select.Root defaultValue="apple">
        <Select.Trigger aria-label="fruit">
          <Select.Value />
        </Select.Trigger>
        <Select.Portal>
          <Select.Content>
            <Select.Item value="apple">Apple</Select.Item>
            <Select.Item value="banana">Banana</Select.Item>
          </Select.Content>
        </Select.Portal>
      </Select.Root>,
    );
    await expectNoViolations(document.body);
    fireEvent.click(screen.getByLabelText('fruit'));
    await expectNoViolations(document.body);
  });

  it('Combobox — 목록 열림·활성 항목', async () => {
    render(
      <Combobox.Root>
        <Combobox.Anchor>
          <Combobox.Input aria-label="fruit" />
        </Combobox.Anchor>
        <Combobox.Portal>
          <Combobox.Content aria-label="fruits">
            <Combobox.Item value="apple">Apple</Combobox.Item>
            <Combobox.Item value="banana">Banana</Combobox.Item>
          </Combobox.Content>
        </Combobox.Portal>
      </Combobox.Root>,
    );
    const input = screen.getByLabelText('fruit');
    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    await expectNoViolations(document.body);
  });

  it('Slider — 단일·범위', async () => {
    const { container } = render(
      <>
        <Slider.Root defaultValue={[30]}>
          <Slider.Track>
            <Slider.Range />
          </Slider.Track>
          <Slider.Thumb aria-label="volume" />
        </Slider.Root>
        <Slider.Root defaultValue={[20, 80]}>
          <Slider.Track>
            <Slider.Range />
          </Slider.Track>
          <Slider.Thumb aria-label="minimum" />
          <Slider.Thumb aria-label="maximum" />
        </Slider.Root>
      </>,
    );
    await expectNoViolations(container);
  });

  it('OneTimePasswordField — 입력칸 각각에 접근 가능한 이름', async () => {
    const { container } = render(
      <OneTimePasswordField.Root maxLength={4}>
        {['1', '2', '3', '4'].map((n) => (
          <OneTimePasswordField.Input key={n} aria-label={`digit ${n}`} />
        ))}
      </OneTimePasswordField.Root>,
    );
    await expectNoViolations(container);
  });

  it('Form — 에러 메시지 표시 상태', async () => {
    const { container } = render(
      <Form.Root onSubmit={(e) => e.preventDefault()}>
        <Form.Field name="email">
          <Form.Label>Email</Form.Label>
          <Form.Control type="email" required />
          <Form.Message match="valueMissing">Email is required</Form.Message>
        </Form.Field>
        <Form.Submit>Send</Form.Submit>
      </Form.Root>,
    );
    act(() => {
      fireEvent.click(screen.getByText('Send'));
    });
    await expectNoViolations(container);
  });

  it('Toast — 뷰포트와 열린 토스트', async () => {
    render(
      <Toast.Provider>
        <Toast.Root open>
          <Toast.Title>Saved</Toast.Title>
          <Toast.Description>Your changes were saved.</Toast.Description>
          <Toast.Close aria-label="Close">×</Toast.Close>
        </Toast.Root>
        <Toast.Viewport />
      </Toast.Provider>,
    );
    await expectNoViolations(document.body);
  });

  it('접근 가능한 이름이 없는 Slider Thumb 은 axe 가 위반으로 잡는다 (검사기 자체 확인)', async () => {
    const { container } = render(
      <Slider.Root defaultValue={[30]}>
        <Slider.Track />
        <Slider.Thumb />
      </Slider.Root>,
    );
    vi.useRealTimers();
    const results = await axe(container);
    expect(results.violations.length).toBeGreaterThan(0);
  });
});
