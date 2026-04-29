import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, test } from '@playwright/test';
import { applyInteraction, portalStoryIds } from './interactions';

const indexPath = resolve(process.cwd(), 'apps/storybook-mui/storybook-static/index.json');

interface StoryEntry {
  id: string;
  title: string;
  name: string;
  type: 'story' | 'docs';
}

const storyIndex = JSON.parse(readFileSync(indexPath, 'utf-8')) as {
  entries: Record<string, StoryEntry>;
};

const stories = Object.values(storyIndex.entries).filter((e) => e.type === 'story');

for (const story of stories) {
  test(`mui · ${story.id}`, async ({ page }) => {
    await page.goto(`/iframe.html?id=${story.id}&viewMode=story`);
    await page.waitForLoadState('networkidle');

    await applyInteraction(page, story.id);

    const target = portalStoryIds.has(story.id) ? page : page.locator('#storybook-root');
    await expect(target).toHaveScreenshot(`${story.id}.png`);
  });
}
