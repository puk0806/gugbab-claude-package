/**
 * @gugbab-ui 팀 커밋 컨벤션: [category] Type: Subject
 * - category: agent | skill | docs | config
 * - Type: Add | Remove | Fix | Modify | Improve | Refactor | Rename | Move
 */

const HEADER_PATTERN =
  /^\[(agent|skill|docs|config)\]\s+(Add|Remove|Fix|Modify|Improve|Refactor|Rename|Move):\s+.+$/;

/** @type {import('@commitlint/types').UserConfig} */
module.exports = {
  parserPreset: {
    parserOpts: {
      headerPattern:
        /^\[(agent|skill|docs|config)\]\s+(Add|Remove|Fix|Modify|Improve|Refactor|Rename|Move):\s+(.+)$/,
      headerCorrespondence: ['category', 'type', 'subject'],
    },
  },
  rules: {
    'header-max-length': [2, 'always', 100],
    'subject-full-stop': [2, 'never', '.'],
    'gugbab-header-format': [2, 'always'],
  },
  plugins: [
    {
      rules: {
        'gugbab-header-format': (parsed) => {
          const header = parsed.header || '';
          if (HEADER_PATTERN.test(header)) {
            return [true];
          }
          return [
            false,
            '형식: [category] Type: Subject — category: agent|skill|docs|config, Type: Add|Remove|Fix|Modify|Improve|Refactor|Rename|Move',
          ];
        },
      },
    },
  ],
};
