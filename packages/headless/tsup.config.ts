import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  target: 'es2022',
  external: [
    'react',
    'react-dom',
    'react/jsx-runtime',
    '@floating-ui/react',
    '@gugbab/hooks',
    '@gugbab/utils',
  ],
  // `banner` 옵션은 esbuild 가 module-level directive 로 인식해 무력화하므로 사용하지 않는다.
  // `"use client";` 는 빌드 후처리(scripts/inject-use-client.mjs)로 dist 첫 줄에 강제 삽입.
  outExtension({ format }) {
    return { js: format === 'esm' ? '.mjs' : '.cjs' };
  },
});
