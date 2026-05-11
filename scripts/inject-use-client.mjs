#!/usr/bin/env node
// tsup 의 banner 옵션은 esbuild 가 module-level directive 로 인식해 무력화한다.
// 이 후처리 스크립트는 빌드 직후 dist 산출물 첫 줄에 `"use client";` 를 강제 삽입한다.
//
// 사용:  node scripts/inject-use-client.mjs <file...>
// 예:   node ../../scripts/inject-use-client.mjs dist/index.mjs dist/index.cjs

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const DIRECTIVE = '"use client";\n';
const targets = process.argv.slice(2);

if (targets.length === 0) {
  console.error('inject-use-client: no target files given');
  process.exit(1);
}

let touched = 0;
for (const arg of targets) {
  const p = resolve(process.cwd(), arg);
  let content;
  try {
    content = readFileSync(p, 'utf8');
  } catch (err) {
    console.error(`inject-use-client: cannot read ${p}: ${err.message}`);
    process.exit(1);
  }
  // 이미 첫 줄에 use client 가 있으면 건너뛴다 (idempotent).
  if (/^['"]use client['"];?\s*\n/.test(content)) {
    continue;
  }
  writeFileSync(p, DIRECTIVE + content, 'utf8');
  touched++;
}

if (touched > 0) {
  console.log(`inject-use-client: prepended directive to ${touched}/${targets.length} file(s)`);
}
