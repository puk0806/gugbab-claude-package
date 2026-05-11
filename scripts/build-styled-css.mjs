#!/usr/bin/env node
/**
 * 공통 styled CSS 번들러 — `packages/styled-{variant}/src/styles/*.css` 를
 * `dist/styles.css` 한 파일로 합치고, 첫머리에 `packages/tokens/dist/{variant}.css`
 * 를 박아 소비자가 단일 스타일시트만 import 하면 토큰 + 컴포넌트 스타일이 모두
 * 적용되도록 한다.
 *
 * 사용:
 *   node ../../scripts/build-styled-css.mjs <variant>
 *   <variant>: mui | radix
 *
 * 호출 예: packages/styled-mui/package.json
 *   "build": "tsup && node ../../scripts/build-styled-css.mjs mui && ..."
 *
 * 순서가 중요 — 토큰 먼저, 컴포넌트 CSS 다음 (var(--gugbab-*) 참조 가능하게).
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const args = process.argv.slice(2);
const variant = args.find((a) => !a.startsWith('--'));
const noMinify = args.includes('--no-minify');

if (!variant) {
  console.error('build-styled-css: variant 인자가 필요합니다 (예: mui | radix)');
  process.exit(1);
}

/**
 * Lightweight CSS minifier — comments, redundant whitespace, trailing
 * semicolons. Avoids semantic transformations (no shorthand merging, no
 * variable folding) so behaviour stays byte-equivalent in cascade order.
 */
function minifyCss(input) {
  return (
    input
      // 블록 주석 제거. URL 안의 `*/` 같은 패턴은 styled-* CSS 에 없음.
      .replace(/\/\*[\s\S]*?\*\//g, '')
      // 1+ 공백 → 1
      .replace(/[\t ]+/g, ' ')
      // 줄 양끝 공백 제거
      .replace(/^ +| +$/gm, '')
      // selector / 선언 사이의 빈 줄 제거
      .replace(/\n{2,}/g, '\n')
      // `{ ` → `{`, ` }` → `}`, ` ;` → `;`, `; ` → `;`, ` :` → ':' (속성 콜론만 — pseudo 는 영향 X 처음 공백이 보통 없음)
      .replace(/ ?\{ ?/g, '{')
      .replace(/ ?\} ?/g, '}')
      .replace(/ ?: ?/g, ':')
      .replace(/ ?; ?/g, ';')
      .replace(/ ?, ?/g, ',')
      // 마지막 선언 끝의 `;}` → `}` (semicolon 절약)
      .replace(/;}/g, '}')
      // 줄바꿈 모두 제거
      .replace(/\n/g, '')
  );
}

const cwd = process.cwd();
const pkgDir = cwd; // package.json 의 build 스크립트는 패키지 루트에서 실행됨
const distDir = resolve(pkgDir, 'dist');
const stylesDir = resolve(pkgDir, 'src', 'styles');
const tokensCss = resolve(pkgDir, '..', 'tokens', 'dist', `${variant}.css`);
const pkgName = `@gugbab/styled-${variant}`;

if (!existsSync(distDir)) mkdirSync(distDir, { recursive: true });

const parts = [];
parts.push(`/* ${pkgName} — bundled styles (tokens + components) */`);
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

const raw = parts.join('\n');
const final = noMinify ? raw : minifyCss(raw);
writeFileSync(resolve(distDir, 'styles.css'), final, 'utf8');
const ratio = noMinify ? '' : ` — minified ${Math.round((1 - final.length / raw.length) * 100)}%`;
console.log(`✓ wrote dist/styles.css (${parts.length} blocks, ${final.length} bytes${ratio})`);
