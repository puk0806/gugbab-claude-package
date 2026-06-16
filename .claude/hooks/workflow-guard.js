'use strict';
// PreToolUse: .github/workflows/ 파일 수정 강제 차단
// Claude가 CI/CD 워크플로우를 임의로 변경하는 것을 방지
// 사용자가 직접 명시적으로 지시하지 않은 워크플로우 변경을 원천 차단

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
        permissionDecision: 'deny',
        permissionDecisionReason:
          `.github/workflows/ 파일은 Claude가 수정할 수 없습니다.\n` +
          `CI/CD 워크플로우는 사용자가 직접 수정하세요.\n` +
          `파일: ${filePath}`,
      },
    }) + '\n');
  }

  process.exit(0);
}

if (require.main === module) {
  main().catch(() => process.exit(0));
}
