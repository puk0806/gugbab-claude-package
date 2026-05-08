/**
 * @gugbab 팀 커밋 컨벤션: [category] Type: Subject
 * - category: agent | skill | docs | config | pkg | apps | scripts | deps
 *   · agent / skill — .claude/agents, .claude/skills 작업
 *   · docs / config — README, rules, hooks, settings 등 메타·문서
 *   · pkg / apps    — packages/*, apps/* 산출물 변경
 *   · scripts / deps — 빌드 스크립트, 의존성·lockfile
 * - Type: Add | Remove | Fix | Modify | Improve | Refactor | Rename | Move
 */

const CATEGORIES = 'agent|skill|docs|config|pkg|apps|scripts|deps';
const TYPES = 'Add|Remove|Fix|Modify|Improve|Refactor|Rename|Move';

const HEADER_PATTERN = new RegExp(`^\\[(${CATEGORIES})\\]\\s+(${TYPES}):\\s+.+$`);

/** @type {import('@commitlint/types').UserConfig} */
module.exports = {
  parserPreset: {
    parserOpts: {
      headerPattern: new RegExp(`^\\[(${CATEGORIES})\\]\\s+(${TYPES}):\\s+(.+)$`),
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
            `형식: [category] Type: Subject — category: ${CATEGORIES}, Type: ${TYPES}`,
          ];
        },
      },
    },
  ],
};
