'use strict';
// Stop: 세션 종료 직전 미동기 memory 변경 재시도 — 강제 동기화 보장
const path = require('path');
const { spawnSync } = require('child_process');

const projectDir = process.env.CLAUDE_PROJECT_DIR;
if (!projectDir) process.exit(0);

// 1. 미커밋 변경 확인
const uncommitted = spawnSync('git', ['-C', projectDir, 'status', '--porcelain', 'memory/'], {
  encoding: 'utf8', stdio: 'pipe',
});

if (uncommitted.stdout?.trim()) {
  spawnSync('git', ['-C', projectDir, 'add', 'memory/'], { stdio: 'pipe' });
  spawnSync('git', ['-C', projectDir, 'commit', '-m', '[memory] auto-sync on stop'], { stdio: 'pipe' });
}

// 2. upstream 추적 브랜치 존재 여부 확인 (@{u} 사용 전 필수)
const tracking = spawnSync(
  'git', ['-C', projectDir, 'rev-parse', '--abbrev-ref', '@{u}'],
  { encoding: 'utf8', stdio: 'pipe' }
);
if (tracking.status !== 0 || !tracking.stdout?.trim()) {
  // upstream 없음 (아직 push -u 미수행) — push 생략, 정상 종료
  process.exit(0);
}

// 3. 앞선 커밋 확인 — [memory] 커밋만 있을 때만 push (비memory 커밋 포함 시 생략)
const aheadLog = spawnSync(
  'git', ['-C', projectDir, 'log', '--oneline', '@{u}..HEAD'],
  { encoding: 'utf8', stdio: 'pipe' }
);
const aheadCommits = (aheadLog.stdout || '').trim().split('\n').filter(Boolean);
if (aheadCommits.length === 0) process.exit(0);

// memory 커밋이 하나도 없으면 push 불필요
if (!aheadCommits.some(line => line.includes('[memory]'))) process.exit(0);

// 비memory 커밋이 하나라도 있으면 push 생략 (의도치 않은 코드 push 방지)
if (aheadCommits.some(line => !line.includes('[memory]'))) process.exit(0);

// 4. push 시도
const push = spawnSync('git', ['-C', projectDir, 'push'], {
  encoding: 'utf8', stdio: 'pipe', timeout: 15000,
});

if (push.status !== 0) {
  // 경고 출력 (네트워크 오류 등 - 차단하지 않음)
  process.stdout.write(
    `[memory-stop-guard] ⚠️  메모리 원격 동기화 실패.\n다음 세션 시작 전 수동으로 git push하세요.\n`
  );
}

process.exit(0);
