#!/usr/bin/env node
/**
 * Concatenates all `src/styles/*.css` into a single `dist/styles.css`,
 * prepending the `@gugbab/tokens/dist/mui.css` so consumers can import
 * a single stylesheet for both tokens and component styles.
 *
 * Order matters: tokens first (so component CSS can reference --gugbab-* vars).
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkgDir = resolve(__dirname, '..');
const distDir = resolve(pkgDir, 'dist');
const stylesDir = resolve(pkgDir, 'src', 'styles');
const tokensCss = resolve(pkgDir, '..', 'tokens', 'dist', 'mui.css');

if (!existsSync(distDir)) mkdirSync(distDir, { recursive: true });

const parts = [];
parts.push('/* @gugbab/styled-mui — bundled styles (tokens + components) */');
parts.push('');

if (existsSync(tokensCss)) {
  parts.push(readFileSync(tokensCss, 'utf8'));
} else {
  console.warn(`! tokens CSS not found at ${tokensCss}`);
}

if (existsSync(stylesDir)) {
  const files = readdirSync(stylesDir)
    .filter((f) => f.endsWith('.css'))
    .sort();
  for (const f of files) {
    parts.push(`/* --- ${f} --- */`);
    parts.push(readFileSync(resolve(stylesDir, f), 'utf8'));
    parts.push('');
  }
}

writeFileSync(resolve(distDir, 'styles.css'), parts.join('\n'), 'utf8');
console.log(`✓ wrote dist/styles.css (${parts.length} blocks)`);
