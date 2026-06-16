'use strict';
// PreToolUse: .github/workflows/ 파일 수정 시 사용자 확인 요청
// hard-deny 대신 ask로 변경 — 사용자가 명시적으로 허용한 경우 진행 가능

const readline = require('readline');

async function main() {
  const rl = readline.createInterface({ input: process.stdin });
  let raw = '';
  for await (const line of rl) raw += line + '\n';
  raw = raw.trim();

  if (!raw) return process.exit(0);

  let input;
  try { input = JSON.parse(raw); } catch { return process.exit(0); }

  const { hook_event_name, hookEventName, tool_name, tool_input = {} } = input;
  const eventName = hook_event_name || hookEventName;

  if (eventName !== 'PreToolUse') return process.exit(0);
  if (tool_name !== 'Write' && tool_name !== 'Edit') return process.exit(0);

  const filePath = (tool_input.file_path || tool_input.path || '').replace(/\\/g, '/');

  if (filePath.includes('.github/workflows/')) {
    process.stdout.write(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'ask',
        permissionDecisionReason:
          `CI/CD 워크플로우 파일 수정 요청\n` +
          `파일: ${filePath}\n` +
          `의도하지 않은 자동 변경은 NPM_TOKEN/GITHUB_TOKEN 노출로 이어질 수 있습니다.\n` +
          `사용자가 명시적으로 요청한 경우에만 허용하세요.`,
      },
    }) + '\n');
  }

  process.exit(0);
}

if (require.main === module) {
  main().catch(() => process.exit(0));
}
