import type { Page } from '@playwright/test';

/**
 * 인터랙티브 stories 캡처 정책.
 *
 * Storybook stories 중 trigger 클릭 후에야 핵심 UI(Dialog, Popover, Menu, Toast 등)가
 * 보이는 것들은 단순 navigation 으로 캡처하면 trigger 버튼만 찍힌다.
 * 아래 매핑이 있는 story id 는 navigation 후 정의된 interaction 을 추가 실행한 뒤 캡처한다.
 *
 * portal 로 #storybook-root 바깥(body) 에 붙는 컴포넌트는 viewport 전체를 캡처해야
 * overlay 가 잡힌다. portalStoryIds 에 등록한다.
 *
 * 매핑이 없는 story 는 정적 캡처(현 상태) 그대로.
 */

type Interaction = (page: Page) => Promise<void>;

const stable = async (page: Page, ms = 200) => {
  await page.waitForTimeout(ms);
};

/** trigger 클릭 → 특정 role 이 visible 될 때까지 대기 → 안정화. */
const openOverlay =
  (role: string): Interaction =>
  async (page) => {
    const trigger = page.locator('#storybook-root button').first();
    await trigger.click();
    await page.waitForSelector(`[role="${role}"]`, { state: 'visible' });
    await stable(page);
  };

/** Show toast 버튼 클릭 → role=status 또는 alert 가 visible. */
const showToast: Interaction = async (page) => {
  const trigger = page.locator('#storybook-root button').first();
  await trigger.click();
  await page
    .waitForSelector('[role="status"], [role="alert"], [data-state="open"]', {
      state: 'visible',
    })
    .catch(() => {});
  await stable(page);
};

/** ContextMenu — 우클릭으로 trigger. */
const openContextMenu: Interaction = async (page) => {
  const target = page
    .locator('#storybook-root [data-radix-collection-item], #storybook-root *')
    .first();
  await target.click({ button: 'right' });
  await page.waitForSelector('[role="menu"]', { state: 'visible' });
  await stable(page);
};

export const interactions: Record<string, Interaction> = {
  // Toast
  'navigation-toast--default': showToast,
  'navigation-toast--with-action': showToast,
  'navigation-toast--multiple-toasts': showToast,
  // Dialog / AlertDialog
  'overlays-dialog--default': openOverlay('dialog'),
  'overlays-alertdialog--default': openOverlay('alertdialog'),
  // Popover / HoverCard / Tooltip
  'overlays-popover--default': openOverlay('dialog'),
  // DropdownMenu / Select
  'stateful-dropdownmenu--default': openOverlay('menu'),
  'stateful-select--default': openOverlay('listbox'),
  'stateful-contextmenu--default': openContextMenu,
};

/**
 * portal 로 body 에 attach 되는 stories.
 * #storybook-root 가 아닌 viewport 전체를 캡처해야 overlay 가 보인다.
 */
export const portalStoryIds = new Set<string>([
  'navigation-toast--default',
  'navigation-toast--with-action',
  'navigation-toast--multiple-toasts',
  'overlays-dialog--default',
  'overlays-alertdialog--default',
  'overlays-popover--default',
  'stateful-dropdownmenu--default',
  'stateful-select--default',
  'stateful-contextmenu--default',
]);

export async function applyInteraction(page: Page, storyId: string): Promise<void> {
  const fn = interactions[storyId];
  if (!fn) return;
  try {
    await fn(page);
  } catch (e) {
    // 인터랙션 selector 가 stories 변경으로 어긋나도 baseline 생성을 막지 않는다.
    // baseline 검수 단계에서 매핑이 잘못된 story 가 발견되면 interactions.ts 를 수정.
    console.warn(`[vr] interaction failed for ${storyId}: ${(e as Error).message}`);
  }
}
