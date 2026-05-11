import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  target: 'es2022',
  external: ['react', 'react-dom', '@gugbab/headless', '@gugbab/tokens', '@gugbab/utils'],
  // `"use client";` 는 빌드 후처리(scripts/inject-use-client.mjs)로 dist 첫 줄에 강제 삽입한다
  // (`banner` 옵션은 esbuild 가 module-level directive 로 인식해 무력화함).
  outExtension({ format }) {
    return { js: format === 'esm' ? '.mjs' : '.cjs' };
  },
});
