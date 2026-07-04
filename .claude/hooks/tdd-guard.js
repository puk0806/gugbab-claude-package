// PostToolUse Write|Edit — 소스 파일 수정 시 대응 테스트 파일 존재 여부 검사 (없으면 차단)
const fs = require('fs');
const path = require('path');

try {
  const input = JSON.parse(fs.readFileSync('/dev/stdin', 'utf8'));
  const filePath = input.tool_input?.file_path || input.tool_input?.path;
  if (!filePath) process.exit(0);

  const ext = path.extname(filePath);
  const sourceExts = ['.ts', '.tsx', '.js', '.jsx', '.py', '.rs'];
  if (!sourceExts.includes(ext)) process.exit(0);

  const basename = path.basename(filePath, ext);
  const dir = path.dirname(filePath);

  // 테스트 파일 자체, 설정 파일, 훅 파일은 건너뜀
  if (
    basename.includes('.test') ||
    basename.includes('.spec') ||
    basename.includes('_test') ||
    filePath.includes('__tests__') ||
    filePath.includes('.claude/hooks') ||
    filePath.includes('.claude/commands') ||
    /(?:^|\/)scripts\//.test(filePath) ||
    // *.config.ts / *.config.js / *.config.mjs 등 순수 설정 파일
    /\.config\.[a-z]+$/.test(path.basename(filePath)) ||
    // Service Worker (브라우저 환경 의존, 단위 테스트 불가)
    basename === 'sw' ||
    // DB 커넥션 셋업 (통합 테스트로만 검증 가능)
    /(?:^|\/)lib\/db\//.test(filePath) ||
    // 순수 타입 선언 파일 (런타임 구현 없음, 테스트 불필요)
    basename === 'types' ||
    basename.endsWith('.types') ||
    // barrel re-export 파일 (index.ts / index.tsx)
    basename === 'index'
  ) {
    process.exit(0);
  }

  // .ts ↔ .tsx 교차 확인 (훅 테스트는 .tsx, 구현은 .ts인 경우가 많음)
  const altExt = ext === '.ts' ? '.tsx' : ext === '.tsx' ? '.ts' : null;
  const exts = altExt ? [ext, altExt] : [ext];
  const testPatterns = exts.flatMap(e => [
    path.join(dir, `${basename}.test${e}`),
    path.join(dir, `${basename}.spec${e}`),
    path.join(dir, '__tests__', `${basename}.test${e}`),
    path.join(dir, '__tests__', `${basename}.spec${e}`),
    path.join(path.dirname(dir), '__tests__', `${basename}.test${e}`),
    path.join(path.dirname(dir), '__tests__', `${basename}.spec${e}`),
  ]);

  const hasTest = testPatterns.some(p => {
    try { return fs.existsSync(p); } catch { return false; }
  });

  if (!hasTest) {
    process.stdout.write(
      `[tdd-guard] 테스트 파일 없음: ${path.relative(process.cwd(), filePath)}\n` +
      `즉시 생성하세요: ${basename}.test${ext}\n`
    );
    process.exit(2);
  }
} catch {}

process.exit(0);
