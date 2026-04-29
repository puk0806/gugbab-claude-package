import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  target: 'es2022',
  external: ['react', 'react-dom'],
  banner: { js: '"use client";' },
  outExtension({ format }) {
    return { js: format === 'esm' ? '.mjs' : '.cjs' };
  },
});
