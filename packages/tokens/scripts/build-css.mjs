#!/usr/bin/env node
/**
 * Builds dist/{mui,radix}.css from the compiled token modules.
 * Runs after tsup so we can import the built ESM bundles.
 */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(__dirname, '..', 'dist');

if (!existsSync(distDir)) mkdirSync(distDir, { recursive: true });

// Import the freshly built ESM bundle.
const tokens = await import(resolve(distDir, 'index.mjs'));
const { muiTheme, radixTheme, renderThemeCss } = tokens;

writeFileSync(
  resolve(distDir, 'mui.css'),
  renderThemeCss(muiTheme, '@gugbab-ui/tokens — MUI default theme'),
  'utf8',
);

writeFileSync(
  resolve(distDir, 'radix.css'),
  renderThemeCss(radixTheme, '@gugbab-ui/tokens — Radix Themes (slate + blue)'),
  'utf8',
);

console.log('✓ wrote dist/mui.css');
console.log('✓ wrote dist/radix.css');
