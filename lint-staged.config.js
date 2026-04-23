/**
 * Biome이 lint + format을 통합 처리한다.
 * Markdown·YAML은 Biome v2가 지원하지 않으므로 훅에서 건드리지 않는다.
 */
module.exports = {
  '*.{ts,tsx,js,jsx,mjs,cjs,json,jsonc,css}': ['biome check --write --no-errors-on-unmatched'],
};
