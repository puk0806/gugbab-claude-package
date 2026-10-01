#!/usr/bin/env node
/**
 * Fails the build if a published artifact still imports a private workspace
 * package that was supposed to be bundled in (e.g. @gugbab/styled-factory).
 * Consumers cannot install private packages, so such an import breaks at
 * runtime (JS) or silently degrades types to `any` (.d.ts).
 *
 * Usage: node assert-no-private-imports.mjs <package> <file>...
 * Comments are ignored (esbuild leaves `// ../styled-factory/src/...` markers).
 */
import { readFileSync } from "node:fs";

const [pkg, ...files] = process.argv.slice(2);
if (!pkg || files.length === 0) {
    console.error("usage: assert-no-private-imports.mjs <package> <file>...");
    process.exit(2);
}

const escaped = pkg.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");
// from "pkg", import "pkg", import("pkg"), require("pkg") — also deep paths.
const pattern = new RegExp(`(?:\\bfrom\\s*|\\bimport\\s*\\(?\\s*|\\brequire\\s*\\(\\s*)["']${escaped}(?:/[^"']*)?["']`);

let failed = false;
for (const file of files) {
    const code = readFileSync(file, "utf8")
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/(^|[^:"'])\/\/.*$/gm, "$1");
    if (pattern.test(code)) {
        console.error(`✗ ${file} imports private package ${pkg} — it must be bundled (tsup noExternal / dts paths).`);
        failed = true;
    }
}
if (failed) process.exit(1);
console.log(`✓ no imports of ${pkg} in ${files.length} file(s)`);
