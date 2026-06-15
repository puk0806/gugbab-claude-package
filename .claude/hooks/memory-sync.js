'use strict';
// PostToolUse (Write|Edit): memory 파일 변경 감지 → 즉시 git commit + push
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

let input = '';
process.stdin.on('data', d => (input += d));
process.stdin.on('end', () => {
  try {
    const data = JSON.parse(input);
    const filePath = data?.tool_input?.file_path || '';

    if (!filePath.includes('/memory/')) process.exit(0);

    // symlink → 실제 경로
    let realPath;
    try { realPath = fs.realpathSync(filePath); } catch { process.exit(0); }

    const memDir = path.dirname(realPath);
    if (path.basename(memDir) !== 'memory') process.exit(0);

    const repoRoot = path.dirname(memDir);

    const check = spawnSync('git', ['-C', repoRoot, 'rev-parse', '--git-dir'], { stdio: 'pipe' });
    if (check.status !== 0) process.exit(0);

    // memory/ 외에 이미 staged된 파일 목록 저장
    const nonMemoryStaged = (spawnSync('git', ['-C', repoRoot, 'diff', '--cached', '--name-only'], {
      encoding: 'utf8', stdio: 'pipe',
    }).stdout || '').trim().split('\n').filter(f => f && !f.startsWith('memory/'));

    // 정확한 staged 상태를 patch로 저장 (partial hunk staging 보존)
    const stagedPatch = nonMemoryStaged.length > 0
      ? (spawnSync('git', ['-C', repoRoot, 'diff', '--cached', '--binary'], {
          encoding: 'utf8', stdio: 'pipe',
        }).stdout || '')
      : '';

    // 다른 staged 파일 임시 unstage
    if (nonMemoryStaged.length > 0) {
      spawnSync('git', ['-C', repoRoot, 'restore', '--staged', '--', ...nonMemoryStaged], { stdio: 'pipe' });
    }

    spawnSync('git', ['-C', repoRoot, 'add', 'memory/'], { stdio: 'pipe' });

    const status = spawnSync('git', ['-C', repoRoot, 'status', '--porcelain', 'memory/'], {
      encoding: 'utf8', stdio: 'pipe',
    });

    if (!status.stdout?.trim()) {
      // 커밋할 변경 없음 → 이전 staged 복원 후 종료
      if (stagedPatch) {
        spawnSync('git', ['-C', repoRoot, 'apply', '--cached', '--whitespace=nowarn', '-'], {
          input: stagedPatch, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'],
        });
      }
      process.exit(0);
    }

    const fileName = path.basename(filePath);
    spawnSync('git', ['-C', repoRoot, 'commit', '-m', `[memory] sync: ${fileName}`], { stdio: 'pipe' });

    // 이전 staged 상태를 patch로 정확히 복원 (partial staging 보존)
    if (stagedPatch) {
      const result = spawnSync('git', ['-C', repoRoot, 'apply', '--cached', '--whitespace=nowarn', '-'], {
        input: stagedPatch, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'],
      });
      if (result.status !== 0) {
        // patch 적용 실패 시 fallback: 파일 전체 re-stage
        spawnSync('git', ['-C', repoRoot, 'add', '--', ...nonMemoryStaged], { stdio: 'pipe' });
      }
    }

    // upstream 추적 브랜치 존재 여부 확인
    const tracking = spawnSync('git', ['-C', repoRoot, 'rev-parse', '--abbrev-ref', '@{u}'], {
      encoding: 'utf8', stdio: 'pipe',
    });
    if (tracking.status !== 0 || !tracking.stdout?.trim()) process.exit(0);

    // [memory] 커밋 1개만 앞서 있는 경우에만 push (다른 미push 커밋 포함 시 생략)
    const aheadCommits = (spawnSync('git', ['-C', repoRoot, 'log', '--oneline', '@{u}..HEAD'], {
      encoding: 'utf8', stdio: 'pipe',
    }).stdout || '').trim().split('\n').filter(Boolean);

    if (aheadCommits.length !== 1 || !aheadCommits[0].includes('[memory]')) process.exit(0);

    const push = spawnSync('git', ['-C', repoRoot, 'push'], { encoding: 'utf8', stdio: 'pipe', timeout: 15000 });
    if (push.status !== 0) {
      process.stdout.write(
        `[memory-sync] ⚠️  push 실패 — 나중에 수동으로 git push하세요.\n${push.stderr || ''}\n`
      );
    }
  } catch {
    // Claude 작업 절대 차단 금지
  }
  process.exit(0);
});
