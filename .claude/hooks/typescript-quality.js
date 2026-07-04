// PostToolUse Write|Edit — .ts/.tsx 저장 시 tsc --noEmit 자동 실행 (오류 있으면 차단)
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

try {
  const input = JSON.parse(fs.readFileSync('/dev/stdin', 'utf8'));
  const filePath = input.tool_input?.file_path || input.tool_input?.path;
  if (!filePath) process.exit(0);

  const ext = path.extname(filePath);
  if (!['.ts', '.tsx'].includes(ext)) process.exit(0);

  // tsconfig.json 탐색 (최대 5단계 상위)
  let dir = path.dirname(filePath);
  let tsconfig = null;
  for (let i = 0; i < 5; i++) {
    const candidate = path.join(dir, 'tsconfig.json');
    try {
      if (fs.existsSync(candidate)) { tsconfig = candidate; break; }
    } catch {}
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  if (!tsconfig) process.exit(0);

  const projectRoot = path.dirname(tsconfig);

  // 로컬 tsc 바이너리 탐색 — 없으면 건너뜀 (npx 불필요한 네트워크 다운로드 방지)
  const localTsc = path.join(projectRoot, 'node_modules', '.bin', 'tsc');
  const tscBin = fs.existsSync(localTsc) ? localTsc : (() => {
    try { execSync('which tsc', { stdio: 'ignore' }); return 'tsc'; } catch { return null; }
  })();
  if (!tscBin) process.exit(0);

  try {
    execSync(`cd "${projectRoot}" && "${tscBin}" --noEmit 2>&1`, {
      timeout: 30000,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  } catch (e) {
    const output = (e.stdout || e.stderr || '').toString().trim();
    if (output) {
      process.stderr.write(`[typescript-quality] ❌ TypeScript 오류 — 수정 후 재저장하세요:\n`);
      const lines = output.split('\n').slice(0, 10);
      lines.forEach(l => process.stderr.write(`  ${l}\n`));
      if (output.split('\n').length > 10) {
        process.stderr.write(`  ... (이하 생략, tsc --noEmit 로 전체 확인)\n`);
      }
      process.exit(2); // 차단
    }
  }
} catch {}

process.exit(0);
