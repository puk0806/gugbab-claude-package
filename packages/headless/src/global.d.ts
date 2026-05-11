// Ambient declaration for `process.env.NODE_ENV` — used by dev-only console.error
// guards. We declare a minimal shape rather than depending on `@types/node` to
// keep this package's type surface free of Node.js APIs.
//
// At build time, consumer bundlers (webpack/vite/esbuild/Rollup) substitute
// `process.env.NODE_ENV` with the literal string, allowing dead-code elimination
// of the dev guard branches in production builds.

declare const process: {
  readonly env: {
    readonly NODE_ENV?: 'development' | 'production' | 'test' | string;
  };
};
