#!/usr/bin/env node

/**
 * Headless visual check for the Storybook showcase.
 *
 * Usage:
 *   node scripts/visual-check.mjs --base http://localhost:6006 [--out /tmp/visual] [--only foundations]
 *
 * The script assumes a Storybook dev server is already running at --base.
 * Each story is visited via /iframe.html?id=...&viewMode=story for a clean
 * canvas-only render (no manager chrome). Full-page screenshots are written
 * to --out.
 */

import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { chromium } from '@playwright/test';

function parseArgs(argv) {
  const args = { base: 'http://localhost:6006', out: '/tmp/visual', only: null };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--base') args.base = argv[++i];
    else if (a === '--out') args.out = argv[++i];
    else if (a === '--only') args.only = argv[++i];
  }
  return args;
}

const PAGES = [
  // Foundations — design system showcase pages
  {
    group: 'foundations',
    name: 'foundations-colors',
    id: 'foundations-colors--palette',
    viewport: { width: 1440, height: 1200 },
  },
  {
    group: 'foundations',
    name: 'foundations-typography',
    id: 'foundations-typography--type',
    viewport: { width: 1440, height: 1400 },
  },
  {
    group: 'foundations',
    name: 'foundations-spacing',
    id: 'foundations-spacing--scale',
    viewport: { width: 1440, height: 1100 },
  },
  {
    group: 'foundations',
    name: 'foundations-radius',
    id: 'foundations-radius--scale',
    viewport: { width: 1440, height: 700 },
  },
  {
    group: 'foundations',
    name: 'foundations-shadows',
    id: 'foundations-shadows--scale',
    viewport: { width: 1440, height: 700 },
  },

  // Components — surface-level smoke check
  {
    group: 'components',
    name: 'avatar-default',
    id: 'primitives-avatar--default',
    viewport: { width: 720, height: 480 },
  },
  {
    group: 'components',
    name: 'avatar-sizes',
    id: 'primitives-avatar--sizes',
    viewport: { width: 720, height: 480 },
  },
  {
    group: 'components',
    name: 'checkbox-default',
    id: 'stateful-checkbox--default',
    viewport: { width: 720, height: 480 },
  },
  {
    group: 'components',
    name: 'checkbox-sizes',
    id: 'stateful-checkbox--sizes',
    viewport: { width: 720, height: 480 },
  },
  {
    group: 'components',
    name: 'checkbox-indet',
    id: 'stateful-checkbox--indeterminate',
    viewport: { width: 720, height: 480 },
  },
  {
    group: 'components',
    name: 'switch-default',
    id: 'stateful-switch--default',
    viewport: { width: 720, height: 480 },
  },
  {
    group: 'components',
    name: 'switch-sizes',
    id: 'stateful-switch--sizes',
    viewport: { width: 720, height: 480 },
  },
  {
    group: 'components',
    name: 'progress-default',
    id: 'stateful-progress--default',
    viewport: { width: 720, height: 480 },
  },
  {
    group: 'components',
    name: 'radiogroup-default',
    id: 'stateful-radiogroup--default',
    viewport: { width: 720, height: 480 },
  },
  {
    group: 'components',
    name: 'tabs-default',
    id: 'stateful-tabs--default',
    viewport: { width: 960, height: 600 },
  },
  {
    group: 'components',
    name: 'slider-default',
    id: 'forms-slider--default',
    viewport: { width: 720, height: 480 },
  },
  {
    group: 'components',
    name: 'label-default',
    id: 'primitives-label--default',
    viewport: { width: 720, height: 480 },
  },
  {
    group: 'components',
    name: 'separator-default',
    id: 'primitives-separator--horizontal',
    viewport: { width: 720, height: 480 },
  },
];

async function main() {
  const args = parseArgs(process.argv);
  const outDir = resolve(args.out);
  mkdirSync(outDir, { recursive: true });

  const filter = args.only;
  const pages = filter ? PAGES.filter((p) => p.group === filter) : PAGES;

  console.log(`→ Storybook base: ${args.base}`);
  console.log(`→ Output dir:     ${outDir}`);
  console.log(`→ Capturing ${pages.length} pages${filter ? ` (filter=${filter})` : ''}`);

  const browser = await chromium.launch({ headless: true });

  let ok = 0;
  const failures = [];

  for (const p of pages) {
    const context = await browser.newContext({ viewport: p.viewport });
    const page = await context.newPage();
    const url = `${args.base}/iframe.html?id=${encodeURIComponent(p.id)}&viewMode=story`;
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
      // Storybook root mounts after initial load — give it a beat
      await page.waitForTimeout(400);
      const file = resolve(outDir, `${p.name}.png`);
      await page.screenshot({ path: file, fullPage: true });
      ok++;
      console.log(`  ✓ ${p.name.padEnd(28)} → ${file}`);
    } catch (err) {
      failures.push({ id: p.id, error: err.message });
      console.log(`  ✘ ${p.name.padEnd(28)} ${err.message}`);
    } finally {
      await context.close();
    }
  }

  await browser.close();

  console.log(`\n→ Captured ${ok}/${pages.length} pages`);
  if (failures.length) {
    console.log(`→ Failures:`);
    for (const f of failures) console.log(`    ${f.id}: ${f.error}`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
