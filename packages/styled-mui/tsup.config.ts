import { defineConfig } from "tsup";

export default defineConfig({
    entry: ["src/index.ts"],
    format: ["esm", "cjs"],
    dts: {
        // The inlined factory is a source-only workspace package: map it to its TS source so the
        // declaration bundler treats it as local code (and inlines it) instead of an external import.
        compilerOptions: {
            rootDir: "../..",
            baseUrl: ".",
            paths: { "@gugbab/styled-factory": ["../styled-factory/src/index.ts"] },
        },
    },
    sourcemap: true,
    clean: true,
    treeshake: true,
    target: "es2022",
    // Private source-only workspace package — inlined so consumers never need to install it.
    noExternal: ["@gugbab/styled-factory"],
    external: ["react", "react-dom", "@gugbab/headless", "@gugbab/tokens", "@gugbab/utils"],
    // `"use client";` 는 빌드 후처리(scripts/inject-use-client.mjs)로 dist 첫 줄에 강제 삽입한다
    // (`banner` 옵션은 esbuild 가 module-level directive 로 인식해 무력화함).
    outExtension({ format }) {
        return { js: format === "esm" ? ".mjs" : ".cjs" };
    },
});
